<?php

namespace App\Services;

use App\Models\FraudFlag;
use App\Models\Vendor;
use App\Models\VendorEvent;
use App\Models\VendorMedia;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaPipelineService
{
    /**
     * Process uploaded media file:
     * - Strips EXIF/GPS
     * - Converts to WebP
     * - Generates medium and thumb variants
     * - Computes perceptual hash (pHash) for cross-vendor duplicate detection
     */
    public function processUpload(UploadedFile $file, int $vendorId, ?string $mediableType = null, ?int $mediableId = null, array $metadata = []): array
    {
        $extension = strtolower($file->getClientOriginalExtension());
        if (!in_array($extension, ['jpg', 'jpeg', 'png', 'webp'])) {
            throw new \InvalidArgumentException('Unsupported image format. Allowed formats: JPG, JPEG, PNG, WebP.');
        }

        if ($file->getSize() > 10 * 1024 * 1024) {
            throw new \InvalidArgumentException('Image size exceeds maximum limit of 10 MB.');
        }

        $tmpPath = $file->getRealPath();
        [$origWidth, $origHeight, $imageType] = @getimagesize($tmpPath) ?: [0, 0, 0];

        if ($origWidth < 300 || $origHeight < 200) {
            throw new \InvalidArgumentException('Image resolution is too low. Please upload an image with at least 800x500 resolution.');
        }

        // 1. Create source image resource based on type (Strips EXIF when re-encoding)
        $srcImage = null;
        switch ($imageType) {
            case IMAGETYPE_JPEG:
                $srcImage = @imagecreatefromjpeg($tmpPath);
                break;
            case IMAGETYPE_PNG:
                $srcImage = @imagecreatefrompng($tmpPath);
                break;
            case IMAGETYPE_WEBP:
                $srcImage = @imagecreatefromwebp($tmpPath);
                break;
        }

        if (!$srcImage) {
            // Fallback to reading file directly
            $data = file_get_contents($tmpPath);
            $srcImage = @imagecreatefromstring($data);
        }

        if (!$srcImage) {
            throw new \RuntimeException('Failed to process image file.');
        }

        // Preserve alpha transparency for PNG/WebP
        imagealphablending($srcImage, true);
        imagesavealpha($srcImage, true);

        // 2. Compute 64-bit perceptual difference hash (dHash)
        $pHash = $this->computePerceptualHash($srcImage, $origWidth, $origHeight);

        // 3. Check for cross-vendor duplicate photo
        $duplicateWarning = $this->detectCrossVendorDuplicate($pHash, $vendorId);

        // 4. Generate WebP files (Medium: 1200x750, Thumb: 400x250)
        $storageDir = storage_path('app/public/media/vendor_' . $vendorId);
        if (!File::isDirectory($storageDir)) {
            File::makeDirectory($storageDir, 0755, true);
        }

        $fileUuid = Str::uuid()->toString();
        $mediumFileName = 'med_' . $fileUuid . '.webp';
        $thumbFileName = 'thm_' . $fileUuid . '.webp';

        $mediumFullPath = $storageDir . '/' . $mediumFileName;
        $thumbFullPath = $storageDir . '/' . $thumbFileName;

        // Resize & Save Medium (max 1200w)
        $targetMedW = min(1200, $origWidth);
        $targetMedH = (int) round(($targetMedW / max(1, $origWidth)) * $origHeight);
        $mediumRes = imagecreatetruecolor($targetMedW, $targetMedH);
        imagealphablending($mediumRes, false);
        imagesavealpha($mediumRes, true);
        imagecopyresampled($mediumRes, $srcImage, 0, 0, 0, 0, $targetMedW, $targetMedH, $origWidth, $origHeight);
        imagewebp($mediumRes, $mediumFullPath, 85);
        imagedestroy($mediumRes);

        // Resize & Save Thumb (400x250 fixed 16:10 cover crop)
        $targetThmW = 400;
        $targetThmH = 250;
        $thumbRes = imagecreatetruecolor($targetThmW, $targetThmH);
        imagealphablending($thumbRes, false);
        imagesavealpha($thumbRes, true);

        // Crop centered 16:10
        $aspectRatio = $origWidth / max(1, $origHeight);
        $targetRatio = 16 / 10;
        if ($aspectRatio > $targetRatio) {
            $srcH = $origHeight;
            $srcW = (int) ($origHeight * $targetRatio);
            $srcX = (int) (($origWidth - $srcW) / 2);
            $srcY = 0;
        } else {
            $srcW = $origWidth;
            $srcH = (int) ($origWidth / $targetRatio);
            $srcX = 0;
            $srcY = (int) (($origHeight - $srcH) / 2);
        }
        imagecopyresampled($thumbRes, $srcImage, 0, 0, $srcX, $srcY, $targetThmW, $targetThmH, $srcW, $srcH);
        imagewebp($thumbRes, $thumbFullPath, 80);
        imagedestroy($thumbRes);
        imagedestroy($srcImage);

        // Relative public paths
        $mediumPublicPath = '/storage/media/vendor_' . $vendorId . '/' . $mediumFileName;
        $thumbPublicPath = '/storage/media/vendor_' . $vendorId . '/' . $thumbFileName;

        // Create Database Record
        $media = VendorMedia::create([
            'vendor_id' => $vendorId,
            'mediable_type' => $mediableType,
            'mediable_id' => $mediableId,
            'path' => $mediumPublicPath,
            'thumb_path' => $thumbPublicPath,
            'medium_path' => $mediumPublicPath,
            'alt_text' => $metadata['alt_text'] ?? null,
            'caption' => $metadata['caption'] ?? null,
            'taken_at' => $metadata['taken_at'] ?? now()->toDateString(),
            'place_id' => $metadata['place_id'] ?? null,
            'status' => $duplicateWarning ? 'pending' : 'approved',
            'reject_reason' => $duplicateWarning ? 'Flagged for moderation: Duplicate image detected across different vendor accounts' : null,
            'phash' => $pHash,
            'width' => $origWidth,
            'height' => $origHeight,
            'file_size_bytes' => $file->getSize(),
            'sort_order' => $metadata['sort_order'] ?? 0,
            'is_verified_traveller_memory' => $metadata['is_verified_traveller_memory'] ?? false,
            'tourist_id' => $metadata['tourist_id'] ?? null,
        ]);

        return [
            'media' => $media,
            'phash' => $pHash,
            'duplicate_warning' => $duplicateWarning,
            'path' => $mediumPublicPath,
            'thumb_path' => $thumbPublicPath,
        ];
    }

    /**
     * Compute a 64-bit perceptual difference hash (dHash) from GD resource.
     */
    public function computePerceptualHash($gdImage, int $origW, int $origH): string
    {
        // 1. Resize to 9x8 grayscale
        $small = imagecreatetruecolor(9, 8);
        imagecopyresampled($small, $gdImage, 0, 0, 0, 0, 9, 8, $origW, $origH);

        // 2. Compute left-to-right difference bits
        $hashBits = '';
        for ($y = 0; $y < 8; $y++) {
            for ($x = 0; $x < 8; $x++) {
                $rgbLeft = imagecolorat($small, $x, $y);
                $grayLeft = (($rgbLeft >> 16) & 0xFF) * 0.299 + (($rgbLeft >> 8) & 0xFF) * 0.587 + ($rgbLeft & 0xFF) * 0.114;

                $rgbRight = imagecolorat($small, $x + 1, $y);
                $grayRight = (($rgbRight >> 16) & 0xFF) * 0.299 + (($rgbRight >> 8) & 0xFF) * 0.587 + ($rgbRight & 0xFF) * 0.114;

                $hashBits .= ($grayLeft > $grayRight) ? '1' : '0';
            }
        }
        imagedestroy($small);

        // 3. Convert 64-bit binary to 16-character hexadecimal hash
        $hexHash = '';
        for ($i = 0; $i < 64; $i += 4) {
            $nibble = substr($hashBits, $i, 4);
            $hexHash .= dechex(bindec($nibble));
        }

        return $hexHash;
    }

    /**
     * Detect if this perceptual hash has been uploaded by another vendor.
     */
    public function detectCrossVendorDuplicate(string $pHash, int $currentVendorId): bool
    {
        $existing = VendorMedia::where('phash', $pHash)
            ->where('vendor_id', '!=', $currentVendorId)
            ->first();

        if ($existing) {
            // Log security and fraud event for Isolation Forest
            $vendor = Vendor::find($currentVendorId);
            $otherVendor = Vendor::find($existing->vendor_id);

            Log::warning("FRAUD_ALERT: Duplicate photo pHash [{$pHash}] detected between Vendor #{$currentVendorId} (" . ($vendor->business_name ?? 'Unknown') . ") and Vendor #{$existing->vendor_id} (" . ($otherVendor->business_name ?? 'Unknown') . ")");

            FraudFlag::create([
                'vendor_id' => $currentVendorId,
                'reason' => "Uploaded duplicate photo matching photo ID #{$existing->id} from partner #{$existing->vendor_id} (pHash: {$pHash})",
                'severity' => 'high',
                'hard_rule_hits' => ['duplicate_cross_vendor_photo'],
            ]);

            VendorEvent::create([
                'vendor_id' => $currentVendorId,
                'type' => 'duplicate_photo_upload',
                'payload' => [
                    'phash' => $pHash,
                    'matched_media_id' => $existing->id,
                    'matched_vendor_id' => $existing->vendor_id,
                ],
                'created_at' => now(),
            ]);

            return true;
        }

        return false;
    }

    /**
     * Content sanitization filter to block phone numbers, UPI IDs, and external links
     * in titles and descriptions.
     */
    public function validateCleanContent(?string $text, string $fieldName = 'description'): array
    {
        if (empty($text)) {
            return ['is_clean' => true, 'violations' => []];
        }

        $violations = [];

        // 1. Phone number patterns (10-digit, spaced, hyphenated, +91)
        if (preg_match('/(\+?91[\s-]?)?[6-9]\d{9}|\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b|\b\d{5}[\s]\d{5}\b/', $text)) {
            $violations[] = "Phone numbers are not permitted in {$fieldName}. All tourist communication is managed securely in-app.";
        }

        // 2. UPI ID patterns (e.g. user@oksbi, payment@upi, paytm)
        if (preg_match('/[a-zA-Z0-9.\-_]{2,256}@(okaxis|okhdfcbank|oksbi|okicici|paytm|upi|ybl|apl|ibl|axl)/i', $text)) {
            $violations[] = "Direct payment IDs (UPI) are not permitted in {$fieldName}. Payments must go through verified in-app bookings.";
        }

        // 3. Web URLs / External Links (http, https, www, .com, .in)
        if (preg_match('/(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.(com|in|org|net|co|io)\b)/i', $text)) {
            $violations[] = "External website links and domain URLs are prohibited in {$fieldName} to ensure verified platform safety.";
        }

        return [
            'is_clean' => count($violations) === 0,
            'violations' => $violations,
        ];
    }
}

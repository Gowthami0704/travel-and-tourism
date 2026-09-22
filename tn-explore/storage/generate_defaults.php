<?php

$dir = __DIR__ . '/../public/defaults';
if (!is_dir($dir)) {
    mkdir($dir, 0755, true);
}

$themes = [
    'temple' => ['title' => 'Ancient Temple & Spiritual Heritage', 'icon' => '🛕', 'color1' => '#9333EA', 'color2' => '#D97706', 'sub' => 'Sacred Architecture of Tamil Nadu'],
    'beach' => ['title' => 'Coastal Sands & Ocean View', 'icon' => '🌊', 'color1' => '#0284C7', 'color2' => '#0D9488', 'sub' => 'Coromandel & Indian Ocean Coastline'],
    'heritage' => ['title' => 'Historic Fort & Monument', 'icon' => '🏰', 'color1' => '#B45309', 'color2' => '#78350F', 'sub' => 'Dravidian Architecture & History'],
    'hill' => ['title' => 'Misty Hills & Mountain Peaks', 'icon' => '⛰️', 'color1' => '#047857', 'color2' => '#064E3B', 'sub' => 'Western & Eastern Ghats of Tamil Nadu'],
    'food' => ['title' => 'Authentic Tamil Nadu Cuisine', 'icon' => '🍲', 'color1' => '#EA580C', 'color2' => '#B91C1C', 'sub' => 'Iconic Flavors & Traditional Dishes'],
    'hidden' => ['title' => 'Offbeat Hidden Gem', 'icon' => '💎', 'color1' => '#4F46E5', 'color2' => '#1E1B4B', 'sub' => 'Untouched Wonders & Secret Trails'],
    'generic' => ['title' => 'TN Explore Discovery', 'icon' => '✨', 'color1' => '#1B4332', 'color2' => '#0A0E1A', 'sub' => 'Explore the Pride of Tamil Nadu']
];

foreach ($themes as $key => $t) {
    $svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <defs>
    <linearGradient id="grad_{$key}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{$t['color1']}" />
      <stop offset="100%" stop-color="{$t['color2']}" />
    </linearGradient>
    <radialGradient id="glow_{$key}" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.6" />
    </radialGradient>
  </defs>
  <rect width="800" height="500" fill="url(#grad_{$key})" />
  <rect width="800" height="500" fill="url(#glow_{$key})" />
  <circle cx="400" cy="200" r="140" fill="#ffffff" fill-opacity="0.08" />
  <circle cx="400" cy="200" r="90" fill="#ffffff" fill-opacity="0.12" />
  <text x="400" y="215" font-size="70" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">{$t['icon']}</text>
  <text x="400" y="320" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="Georgia, serif">{$t['title']}</text>
  <text x="400" y="360" font-size="16" fill="#FAF3E0" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" letter-spacing="1">{$t['sub']}</text>
  <text x="400" y="440" font-size="14" fill="#D4A574" text-anchor="middle" font-weight="600" font-family="system-ui, sans-serif" letter-spacing="3">TN EXPLORE • TAMIL NADU TOURISM</text>
</svg>
SVG;

    file_put_contents("$dir/{$key}.svg", $svg);
    file_put_contents("$dir/{$key}.jpg", $svg);
}

echo "Created all default theme images in public/defaults/\n";

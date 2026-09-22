/**
 * District Center Coordinates & Deterministic Geo Scatter Utility for Tamil Nadu
 */

export const DISTRICT_CENTERS = {
    'Ariyalur': [11.1401, 79.0786],
    'Chengalpattu': [12.6841, 79.9836],
    'Chennai': [13.0827, 80.2707],
    'Coimbatore': [11.0168, 76.9558],
    'Cuddalore': [11.7480, 79.7714],
    'Dharmapuri': [12.1211, 78.1582],
    'Dindigul': [10.3673, 77.9803],
    'Erode': [11.3410, 77.7172],
    'Kallakurichi': [11.7383, 78.9639],
    'Kanchipuram': [12.8342, 79.7036],
    'Kanyakumari': [8.0883, 77.5385],
    'Karur': [10.9601, 78.0766],
    'Krishnagiri': [12.5186, 78.2138],
    'Madurai': [9.9252, 78.1198],
    'Mayiladuthurai': [11.1075, 79.6522],
    'Nagapattinam': [10.7656, 79.8424],
    'Namakkal': [11.2189, 78.1674],
    'Nilgiris': [11.4102, 76.6950],
    'Perambalur': [11.2342, 78.8821],
    'Pudukkottai': [10.3797, 78.8208],
    'Ramanathapuram': [9.3639, 78.8395],
    'Ranipet': [12.9272, 79.3331],
    'Salem': [11.6643, 78.1460],
    'Sivaganga': [9.8433, 78.4809],
    'Tenkasi': [8.9594, 77.3152],
    'Thanjavur': [10.7870, 79.1378],
    'Theni': [10.0104, 77.4768],
    'Thoothukudi': [8.7642, 78.1348],
    'Tiruchirappalli': [10.7905, 78.7047],
    'Tirunelveli': [8.7139, 77.7567],
    'Tirupathur': [12.4958, 78.5678],
    'Tiruppur': [11.1085, 77.3411],
    'Tiruvallur': [13.1438, 79.9083],
    'Tiruvannamalai': [12.2253, 79.0747],
    'Tiruvarur': [10.7725, 79.6365],
    'Vellore': [12.9165, 79.1325],
    'Viluppuram': [11.9401, 79.4861],
    'Virudhunagar': [9.5680, 77.9624],
};

// Simple deterministic hash for string
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

/**
 * Returns [lat, lng] for a place. Uses real coordinates if available,
 * otherwise deterministically scatters nearby the district center.
 */
export function getPlaceCoordinates(place, fallbackDistrictName) {
    if (place?.latitude && place?.longitude && !isNaN(place.latitude) && !isNaN(place.longitude)) {
        return [parseFloat(place.latitude), parseFloat(place.longitude)];
    }

    const cleanDistrict = place?.district_name || place?.district?.name || fallbackDistrictName || 'Chennai';
    const center = DISTRICT_CENTERS[cleanDistrict] || [11.1271, 78.6569]; // Center of Tamil Nadu default

    const nameStr = (place?.name || '') + (place?.id || '0');
    const hash = hashString(nameStr);

    // Deterministic angle and distance offset
    const angle = (hash % 360) * (Math.PI / 180);
    const distanceOffset = 0.015 + ((hash % 100) / 100) * 0.055; // ~1.5km to 7.5km offset

    const latOffset = Math.sin(angle) * distanceOffset;
    const lngOffset = Math.cos(angle) * distanceOffset;

    return [
        Number((center[0] + latOffset).toFixed(5)),
        Number((center[1] + lngOffset).toFixed(5)),
    ];
}

/**
 * Haversine formula to compute distance in km between two lat/lng pairs
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
}

/**
 * Calculates total route distance across an array of places
 */
export function calculateTotalRouteDistance(places, districtName) {
    if (!places || places.length < 2) return 0;

    let total = 0;
    for (let i = 0; i < places.length - 1; i++) {
        const [lat1, lon1] = getPlaceCoordinates(places[i], districtName);
        const [lat2, lon2] = getPlaceCoordinates(places[i + 1], districtName);
        total += calculateHaversineDistance(lat1, lon1, lat2, lon2);
    }
    return Number(total.toFixed(1));
}

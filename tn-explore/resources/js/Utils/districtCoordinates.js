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

/**
 * Accurate Geographic Coordinates for Prominent Tamil Nadu Landmarks
 */
export const KNOWN_LANDMARK_COORDINATES = {
    // Madurai Landmarks
    'meenakshi amman temple': [9.9195, 78.1193],
    'meenakshi temple': [9.9195, 78.1193],
    'thirumalai nayakkar mahal': [9.9150, 78.1235],
    'thirumalai nayak palace': [9.9150, 78.1235],
    'gandhi memorial museum': [9.9304, 78.1408],
    'alagar kovil': [10.0745, 78.2132],
    'kallazhagar temple': [10.0745, 78.2132],
    'vandiyur mariamman teppakulam': [9.9126, 78.1517],
    'thiruparankundram murugan temple': [9.8809, 78.0716],
    'pazhamudircholai': [10.0911, 78.2255],
    'koodal azhagar temple': [9.9168, 78.1132],
    'samana malai': [9.9295, 78.0577],
    'kutladampatti falls': [10.1345, 77.9863],

    // Chennai Landmarks
    'marina beach': [13.0499, 80.2824],
    'kapaleeshwarar temple': [13.0336, 80.2699],
    'fort st. george': [13.0797, 80.2874],
    'san thome basilica': [13.0337, 80.2785],
    'guindy national park': [13.0067, 80.2206],
    'elliot beach': [12.9994, 80.2711],
    'besant nagar beach': [12.9994, 80.2711],
    'valluvar kottam': [13.0538, 80.2415],
    'vandalur zoo': [12.8797, 80.0815],
    'arignar anna zoological park': [12.8797, 80.0815],
    'dakshinachitra': [12.8188, 80.2427],

    // Chengalpattu / Kanchipuram / Mahabalipuram
    'shore temple': [12.6163, 80.1983],
    'pancha rathas': [12.6105, 80.1928],
    'arjuna penance': [12.6173, 80.1936],
    'ekambareswarar temple': [12.8465, 79.6997],
    'kailasanathar temple': [12.8423, 79.6897],
    'varadharaja perumal temple': [12.8197, 79.7247],
    'vedanthangal bird sanctuary': [12.5447, 79.8553],

    // Nilgiris / Ooty / Coonoor
    'ooty lake': [11.4080, 76.6908],
    'government botanical garden': [11.4172, 76.7112],
    'doddabetta peak': [11.4014, 76.7355],
    'pykara lake': [11.4552, 76.5978],
    'pykara waterfalls': [11.4589, 76.6021],
    'dolphin nose': [11.3533, 76.8833],
    'sims park': [11.3546, 76.7972],
    'avalanche lake': [11.2986, 76.5939],
    'nilgiri mountain railway': [11.3444, 76.7950],

    // Dindigul / Kodaikanal
    'kodaikanal lake': [10.2324, 77.4891],
    'coakers walk': [10.2312, 77.4947],
    'pillar rocks': [10.2078, 77.4682],
    'bryant park': [10.2319, 77.4958],
    'guna caves': [10.2173, 77.4644],
    'silver cascade falls': [10.2526, 77.5192],
    'mannavanur lake': [10.2505, 77.3486],
    'dindigul rock fort': [10.3627, 77.9698],

    // Thanjavur / Kumbakonam
    'brihadeeswarar temple': [10.7828, 79.1318],
    'thanjavur maratha palace': [10.7925, 79.1370],
    'airavatesvara temple': [10.9478, 79.3562],
    'gangaikonda cholapuram': [11.2064, 79.4497],
    'adi kumbeswarar temple': [10.9592, 79.3732],

    // Tiruchirappalli
    'rockfort ucchi pillayar temple': [10.8284, 78.6970],
    'srirangam ranganathaswamy temple': [10.8624, 78.6901],
    'jambukeswarar temple': [10.8533, 78.7054],
    'kallanai dam': [10.8333, 78.8194],

    // Ramanathapuram / Rameswaram
    'ramanathaswamy temple': [9.2881, 79.3174],
    'dhanushkodi beach': [9.1764, 79.4184],
    'arichal munai': [9.1554, 79.4435],
    'pamban bridge': [9.2783, 79.1989],
    'apj abdul kalam memorial': [9.2842, 79.2886],

    // Kanyakumari
    'vivekananda rock memorial': [8.0780, 77.5550],
    'thiruvalluvar statue': [8.0778, 77.5540],
    'kanyakumari beach': [8.0792, 77.5502],
    'padmanabhapuram palace': [8.2508, 77.3275],
    'thirparappu waterfalls': [8.3905, 77.2667],

    // Tirunelveli / Tenkasi
    'nellaiappar temple': [8.7289, 77.6881],
    'courtallam main falls': [8.9312, 77.2694],
    'five falls': [8.9372, 77.2483],
    'manimuthar falls': [8.5986, 77.4042],

    // Coimbatore / Salem / Erode
    'marudhamalai temple': [11.0458, 76.8519],
    'adiyogi shiva statue': [10.9723, 76.7405],
    'yercaud lake': [11.7770, 78.2096],
    'bhavanisagar dam': [11.4705, 77.1128],
    'hogenakkal falls': [12.1182, 77.7766],
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
 * Normalizes string for landmark dictionary lookup
 */
function normalizePlaceName(name = '') {
    return String(name)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Returns [lat, lng] for a place. Uses real coordinates if available,
 * checks known landmark database, or uses smart dispersed scatter around district center.
 */
export function getPlaceCoordinates(place, fallbackDistrictName) {
    if (place?.latitude && place?.longitude && !isNaN(place.latitude) && !isNaN(place.longitude)) {
        return [parseFloat(place.latitude), parseFloat(place.longitude)];
    }

    const normName = normalizePlaceName(place?.name);

    // Check exact or partial match in KNOWN_LANDMARK_COORDINATES
    if (KNOWN_LANDMARK_COORDINATES[normName]) {
        return KNOWN_LANDMARK_COORDINATES[normName];
    }

    for (const [key, coords] of Object.entries(KNOWN_LANDMARK_COORDINATES)) {
        if (normName.includes(key) || key.includes(normName)) {
            return coords;
        }
    }

    const cleanDistrict = place?.district_name || place?.district?.name || fallbackDistrictName || 'Chennai';
    const center = DISTRICT_CENTERS[cleanDistrict] || [11.1271, 78.6569];

    const nameStr = (place?.name || '') + (place?.id || '0');
    const hash = hashString(nameStr);

    // Disperse smartly around district center without overlapping
    const angle = (hash % 360) * (Math.PI / 180);
    const distanceOffset = 0.018 + ((hash % 100) / 100) * 0.065; // ~2km to 9km clean dispersion

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

/**
 * Trip Mates Storage & State Utilities
 * Persistent LocalStorage manager for Trip Posts, Join Requests, and Expiration filtering
 */

const TRIP_POSTS_STORAGE_KEY = 'tn_explore_trip_posts_v1';
const JOIN_REQUESTS_STORAGE_KEY = 'tn_explore_join_requests_v1';

// Initial seed data with authentic upcoming Tamil Nadu travel ads
const INITIAL_SEED_POSTS = [
    {
        id: 'tp-101',
        creatorId: 1,
        creatorName: 'Kavitha Ramachandran',
        creatorPhone: '+91 98401 56789',
        creatorVerified: true,
        district: 'Nilgiris',
        districtRegion: 'Kongu',
        startDate: '2026-10-15',
        endDate: '2026-10-18',
        slotsNeeded: 3,
        slotsFilled: 1,
        estimatedBudget: 3200,
        description: 'Planning a scenic weekend photography & tea plantation trekking getaway in Kotagiri and Ooty. Looking for 2-3 chill travel mates to split cab and homestay expenses.',
        tags: ['Photography', 'Nature Trek', 'Budget Stay', 'Tea Gardens'],
        status: 'open',
        createdAt: '2026-09-15T10:00:00.000Z'
    },
    {
        id: 'tp-102',
        creatorId: 2,
        creatorName: 'Sundaram Pandian',
        creatorPhone: '+91 98421 11223',
        creatorVerified: true,
        district: 'Madurai',
        districtRegion: 'South',
        startDate: '2026-10-22',
        endDate: '2026-10-24',
        slotsNeeded: 4,
        slotsFilled: 2,
        estimatedBudget: 2400,
        description: 'Night street food crawl & Meenakshi temple heritage architecture exploration. We have 2 confirmed spots, looking for 2 foodies to join for Jigarthanda & Kari Dosa trails!',
        tags: ['Food Crawl', 'Heritage Walk', 'Temple Tour', 'Street Food'],
        status: 'open',
        createdAt: '2026-09-14T14:30:00.000Z'
    },
    {
        id: 'tp-103',
        creatorId: 3,
        creatorName: 'Dinesh Karthik',
        creatorPhone: '+91 97890 12345',
        creatorVerified: true,
        district: 'Kanyakumari',
        districtRegion: 'South',
        startDate: '2026-11-05',
        endDate: '2026-11-07',
        slotsNeeded: 2,
        slotsFilled: 0,
        estimatedBudget: 2800,
        description: 'Sunrise to sunset coastal road trip covering Thiruvalluvar Statue, Vivekananda Rock Memorial, and scenic coastal backwaters. Splitting fuel and beachside cottage.',
        tags: ['Road Trip', 'Coastal Sunrise', 'Budget', 'Backpacking'],
        status: 'open',
        createdAt: '2026-09-16T08:00:00.000Z'
    },
    {
        id: 'tp-104',
        creatorId: 4,
        creatorName: 'Ananya Swaminathan',
        creatorPhone: '+91 94440 67890',
        creatorVerified: true,
        district: 'Thanjavur',
        districtRegion: 'Central',
        startDate: '2026-10-30',
        endDate: '2026-11-01',
        slotsNeeded: 3,
        slotsFilled: 1,
        estimatedBudget: 2100,
        description: 'Great Living Chola Temples circuit tour: Brihadeeswarar Temple, Gangaikonda Cholapuram, and Darasuram. Ideal for history lovers and art enthusiasts.',
        tags: ['Chola Architecture', 'History', 'UNESCO Site', 'Art & Dolls'],
        status: 'open',
        createdAt: '2026-09-15T18:20:00.000Z'
    }
];

const INITIAL_SEED_REQUESTS = [
    {
        id: 'jr-201',
        tripPostId: 'tp-101',
        userId: 5,
        userName: 'Praveen Kumar',
        userEmail: 'praveen.k@gmail.com',
        userVerified: true,
        message: 'Hey Kavitha! I love trekking and photography. Would love to join for the Kotagiri tea trails!',
        status: 'accepted',
        createdAt: '2026-09-15T12:00:00.000Z'
    },
    {
        id: 'jr-202',
        tripPostId: 'tp-102',
        userId: 6,
        userName: 'Meera Nambiar',
        userEmail: 'meera.n@gmail.com',
        userVerified: true,
        message: 'Huge fan of Madurai culinary food! Count me in for the evening food crawl.',
        status: 'accepted',
        createdAt: '2026-09-15T16:00:00.000Z'
    }
];

/**
 * Get all Trip Posts from storage with automatic seed initialization
 */
export function getTripPosts() {
    try {
        const raw = localStorage.getItem(TRIP_POSTS_STORAGE_KEY);
        if (!raw) {
            localStorage.setItem(TRIP_POSTS_STORAGE_KEY, JSON.stringify(INITIAL_SEED_POSTS));
            return INITIAL_SEED_POSTS;
        }
        return JSON.parse(raw);
    } catch (e) {
        console.error('Failed to load trip posts from localStorage', e);
        return INITIAL_SEED_POSTS;
    }
}

/**
 * Save Trip Posts to storage
 */
export function saveTripPosts(posts) {
    try {
        localStorage.setItem(TRIP_POSTS_STORAGE_KEY, JSON.stringify(posts));
    } catch (e) {
        console.error('Failed to save trip posts', e);
    }
}

/**
 * Get all Join Requests from storage
 */
export function getJoinRequests() {
    try {
        const raw = localStorage.getItem(JOIN_REQUESTS_STORAGE_KEY);
        if (!raw) {
            localStorage.setItem(JOIN_REQUESTS_STORAGE_KEY, JSON.stringify(INITIAL_SEED_REQUESTS));
            return INITIAL_SEED_REQUESTS;
        }
        return JSON.parse(raw);
    } catch (e) {
        console.error('Failed to load join requests from localStorage', e);
        return INITIAL_SEED_REQUESTS;
    }
}

/**
 * Save Join Requests to storage
 */
export function saveJoinRequests(requests) {
    try {
        localStorage.setItem(JOIN_REQUESTS_STORAGE_KEY, JSON.stringify(requests));
    } catch (e) {
        console.error('Failed to save join requests', e);
    }
}

/**
 * Filter for active open trips (filters out past start dates and completely full slots)
 */
export function filterActiveTrips(posts) {
    const today = new Date().toISOString().split('T')[0];
    return posts.filter((p) => {
        const isNotExpired = p.startDate >= today;
        return isNotExpired;
    });
}

/**
 * Create a new Trip Post
 */
export function createTripPost(postData, currentUser) {
    const posts = getTripPosts();
    const newPost = {
        id: `tp-${Date.now()}`,
        creatorId: currentUser?.id || 999,
        creatorName: currentUser?.name || 'Explorer',
        creatorPhone: currentUser?.phone || '+91 98400 00000',
        creatorVerified: true,
        district: postData.district,
        districtRegion: postData.districtRegion || 'Tamil Nadu',
        startDate: postData.startDate,
        endDate: postData.endDate,
        slotsNeeded: Number(postData.slotsNeeded) || 2,
        slotsFilled: 0,
        estimatedBudget: Number(postData.estimatedBudget) || 2500,
        description: postData.description,
        tags: postData.tags || ['Backpacking', 'Sightseeing'],
        status: 'open',
        createdAt: new Date().toISOString(),
    };

    const updated = [newPost, ...posts];
    saveTripPosts(updated);
    return newPost;
}

/**
 * Create a Join Request for a trip
 */
export function applyToTrip(tripPostId, currentUser, message = '') {
    const requests = getJoinRequests();
    
    // Check if already applied
    const existing = requests.find(
        (r) => r.tripPostId === tripPostId && r.userId === (currentUser?.id || 999)
    );
    if (existing) {
        return { success: false, message: 'You have already applied to join this trip!' };
    }

    const newRequest = {
        id: `jr-${Date.now()}`,
        tripPostId,
        userId: currentUser?.id || 999,
        userName: currentUser?.name || 'Fellow Traveler',
        userEmail: currentUser?.email || 'traveler@tnexplore.com',
        userVerified: true,
        message: message || 'Hi! I would love to join your trip.',
        status: 'pending',
        createdAt: new Date().toISOString(),
    };

    const updated = [newRequest, ...requests];
    saveJoinRequests(updated);
    return { success: true, request: newRequest };
}

/**
 * Accept or Reject a Join Request
 */
export function updateJoinRequestStatus(requestId, newStatus) {
    const requests = getJoinRequests();
    const posts = getTripPosts();

    let targetPostId = null;

    const updatedRequests = requests.map((r) => {
        if (r.id === requestId) {
            targetPostId = r.tripPostId;
            return { ...r, status: newStatus };
        }
        return r;
    });

    saveJoinRequests(updatedRequests);

    // If accepted, increment slotsFilled in post
    if (newStatus === 'accepted' && targetPostId) {
        const updatedPosts = posts.map((p) => {
            if (p.id === targetPostId) {
                const filled = Math.min(p.slotsNeeded, p.slotsFilled + 1);
                return {
                    ...p,
                    slotsFilled: filled,
                    status: filled >= p.slotsNeeded ? 'full' : 'open',
                };
            }
            return p;
        });
        saveTripPosts(updatedPosts);
    }

    return { updatedRequests, targetPostId };
}

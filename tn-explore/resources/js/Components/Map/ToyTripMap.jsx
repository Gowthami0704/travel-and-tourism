import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getPlaceCoordinates, calculateTotalRouteDistance, DISTRICT_CENTERS } from '@/Utils/districtCoordinates';
import { cleanName } from '@/Utils/imageFallback';

/**
 * ToyTripMap: Interactive Leaflet Map with Toy-to-Travel aesthetic
 * - OpenStreetMap / Carto Voyager tiles
 * - Colorful playful custom marker icons with stop numbers & category icons
 * - Polyline route connecting itinerary pins in order
 * - Animated Toy Vehicle (🚗 🚌 🚂 🛵) smoothly traveling along the route
 */
export default function ToyTripMap({
    districtName = 'Madurai',
    selectedPlaces = [],
    allDistrictPlaces = [],
    onTogglePlace,
    transitMode = 'Cab',
    className = ''
}) {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersLayerRef = useRef(null);
    const polylineLayerRef = useRef(null);
    const vehicleMarkerRef = useRef(null);
    const animFrameRef = useRef(null);

    // Get vehicle emoji based on transit mode
    const getVehicleEmoji = (mode) => {
        switch (mode) {
            case 'Train': return '🚂';
            case 'Bus': return '🚌';
            case 'Bike': return '🛵';
            case 'Cab':
            default: return '🚗';
        }
    };

    // Category styling helper
    const getCategoryTheme = (cat = '') => {
        const c = cat.toLowerCase();
        if (c.includes('temple') || c.includes('spiritual')) return { bg: '#F59E0B', icon: '🛕' };
        if (c.includes('nature') || c.includes('hill') || c.includes('forest')) return { bg: '#10B981', icon: '🌲' };
        if (c.includes('water') || c.includes('beach') || c.includes('fall')) return { bg: '#06B6D4', icon: '🌊' };
        if (c.includes('fort') || c.includes('palace') || c.includes('museum')) return { bg: '#8B5CF6', icon: '🏰' };
        if (c.includes('food') || c.includes('market')) return { bg: '#EC4899', icon: '🍛' };
        return { bg: '#EAB308', icon: '📍' };
    };

    // Initialize Map once
    useEffect(() => {
        const container = mapContainerRef.current;
        if (!container) return;

        // Clean up previous instance or id if any
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
        if (container._leaflet_id) {
            container._leaflet_id = null;
        }

        const defaultCenter = DISTRICT_CENTERS[districtName] || [11.1271, 78.6569];

        try {
            const map = L.map(container, {
                center: defaultCenter,
                zoom: 12,
                zoomControl: false,
                attributionControl: false,
            });

            // Free OpenStreetMap tile server (100% Free, No API Key Required)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Add custom styled zoom control in top right
            L.control.zoom({ position: 'topright' }).addTo(map);

            const markersLayer = L.layerGroup().addTo(map);
            const polylineLayer = L.layerGroup().addTo(map);

            mapInstanceRef.current = map;
            markersLayerRef.current = markersLayer;
            polylineLayerRef.current = polylineLayer;
        } catch (e) {
            console.error('Leaflet Map init error:', e);
        }

        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
            if (container && container._leaflet_id) {
                container._leaflet_id = null;
            }
        };
    }, []);

    // Update map view & render pins and polyline whenever selectedPlaces or district changes
    useEffect(() => {
        const map = mapInstanceRef.current;
        const markersLayer = markersLayerRef.current;
        const polylineLayer = polylineLayerRef.current;
        if (!map || !markersLayer || !polylineLayer) return;

        markersLayer.clearLayers();
        polylineLayer.clearLayers();
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

        const center = DISTRICT_CENTERS[districtName] || [11.1271, 78.6569];

        // 1. Render all district places as subtle unselected pins
        const selectedIds = new Set(selectedPlaces.map((p) => String(p.id)));

        allDistrictPlaces.forEach((place) => {
            const isSelected = selectedIds.has(String(place.id));
            if (isSelected) return; // Will render with full badge below

            const [lat, lng] = getPlaceCoordinates(place, districtName);
            const theme = getCategoryTheme(place.category);

            const unselectedIcon = L.divIcon({
                className: 'custom-unselected-pin',
                html: `
                    <div style="
                        width: 26px; height: 26px;
                        background: rgba(15, 23, 42, 0.85);
                        border: 2px solid ${theme.bg};
                        border-radius: 50%;
                        display: flex; align-items: center; justify-content: center;
                        font-size: 11px;
                        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
                        cursor: pointer;
                        transition: transform 0.2s;
                    " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
                        ${theme.icon}
                    </div>
                `,
                iconSize: [26, 26],
                iconAnchor: [13, 13],
            });

            const marker = L.marker([lat, lng], { icon: unselectedIcon });
            marker.bindPopup(`
                <div style="font-family: sans-serif; min-width: 160px;">
                    <div style="font-weight: bold; font-size: 13px; color: #1E293B;">${cleanName(place.name)}</div>
                    <div style="font-size: 11px; color: #64748B; margin: 3px 0;">${place.category || 'Attraction'}</div>
                    <button id="add-btn-${place.id}" style="
                        margin-top: 6px; width: 100%; padding: 5px 8px;
                        background: #10B981; color: white; border: none;
                        border-radius: 6px; font-size: 11px; font-weight: bold;
                        cursor: pointer;
                    ">+ Add to Itinerary Route</button>
                </div>
            `);

            marker.on('popupopen', () => {
                const btn = document.getElementById(`add-btn-${place.id}`);
                if (btn && onTogglePlace) {
                    btn.onclick = () => {
                        onTogglePlace(place);
                        map.closePopup();
                    };
                }
            });

            marker.addTo(markersLayer);
        });

        // 2. Render Selected Places in Route Order with Numbers
        const routeCoords = [];

        selectedPlaces.forEach((place, index) => {
            const [lat, lng] = getPlaceCoordinates(place, districtName);
            routeCoords.push([lat, lng]);
            const theme = getCategoryTheme(place.category);

            const selectedIcon = L.divIcon({
                className: 'custom-selected-pin',
                html: `
                    <div style="
                        position: relative;
                        display: flex; flex-direction: column; align-items: center;
                        cursor: pointer;
                    ">
                        <div style="
                            background: linear-gradient(135deg, ${theme.bg}, #F59E0B);
                            color: #0F172A;
                            font-weight: 900; font-size: 12px;
                            width: 34px; height: 34px;
                            border-radius: 50%;
                            display: flex; align-items: center; justify-content: center;
                            box-shadow: 0 0 15px ${theme.bg}88, 0 4px 12px rgba(0,0,0,0.6);
                            border: 3px solid #FFFFFF;
                            transform: scale(1.1);
                        ">
                            #${index + 1}
                        </div>
                        <div style="
                            background: rgba(15, 23, 42, 0.9);
                            color: #FFFFFF;
                            font-size: 10px; font-weight: bold;
                            padding: 2px 7px;
                            border-radius: 10px;
                            border: 1px solid rgba(255,255,255,0.2);
                            white-space: nowrap;
                            margin-top: 3px;
                            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                        ">
                            ${cleanName(place.name).slice(0, 16)}${place.name.length > 16 ? '..' : ''}
                        </div>
                    </div>
                `,
                iconSize: [34, 55],
                iconAnchor: [17, 20],
            });

            const marker = L.marker([lat, lng], { icon: selectedIcon });
            marker.bindPopup(`
                <div style="font-family: sans-serif; min-width: 170px;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="background: ${theme.bg}; color: white; font-weight: bold; font-size: 10px; padding: 2px 6px; border-radius: 4px;">Stop #${index + 1}</span>
                        <span style="font-size: 11px; color: #64748B;">${place.category || 'Sightseeing'}</span>
                    </div>
                    <div style="font-weight: bold; font-size: 13px; color: #0F172A; margin-top: 4px;">${cleanName(place.name)}</div>
                    <div style="font-size: 11px; color: #475569; margin: 4px 0;">Est. Entry Fee: ₹50</div>
                    <button id="rem-btn-${place.id}" style="
                        margin-top: 4px; width: 100%; padding: 5px 8px;
                        background: #EF4444; color: white; border: none;
                        border-radius: 6px; font-size: 11px; font-weight: bold;
                        cursor: pointer;
                    ">✕ Remove from Itinerary</button>
                </div>
            `);

            marker.on('popupopen', () => {
                const btn = document.getElementById(`rem-btn-${place.id}`);
                if (btn && onTogglePlace) {
                    btn.onclick = () => {
                        onTogglePlace(place);
                        map.closePopup();
                    };
                }
            });

            marker.addTo(markersLayer);
        });

        // 3. Draw Polyline Route if 2 or more stops
        if (routeCoords.length >= 2) {
            // Shadow polyline
            L.polyline(routeCoords, {
                color: '#000000',
                weight: 8,
                opacity: 0.35,
                lineCap: 'round',
                lineJoin: 'round',
            }).addTo(polylineLayer);

            // Glowing Animated Dashed Polyline
            const routeLine = L.polyline(routeCoords, {
                color: '#8B5CF6',
                weight: 5,
                opacity: 0.9,
                dashArray: '10, 10',
                lineCap: 'round',
                lineJoin: 'round',
            }).addTo(polylineLayer);

            // Inner vibrant stripe
            L.polyline(routeCoords, {
                color: '#F59E0B',
                weight: 2.5,
                opacity: 1,
            }).addTo(polylineLayer);

            // 4. TOY VEHICLE ANIMATION ALONG POLYLINE
            const vehicleEmoji = getVehicleEmoji(transitMode);
            const vehicleIcon = L.divIcon({
                className: 'custom-toy-vehicle',
                html: `
                    <div style="
                        width: 38px; height: 38px;
                        background: #FFFFFF;
                        border: 2.5px solid #8B5CF6;
                        border-radius: 50%;
                        display: flex; align-items: center; justify-content: center;
                        font-size: 20px;
                        box-shadow: 0 0 16px rgba(139, 92, 246, 0.8), 0 4px 10px rgba(0,0,0,0.5);
                        transform: scale(1.1);
                        animation: toyBounce 1.2s infinite ease-in-out alternate;
                    ">
                        ${vehicleEmoji}
                    </div>
                `,
                iconSize: [38, 38],
                iconAnchor: [19, 19],
            });

            const vehicleMarker = L.marker(routeCoords[0], { icon: vehicleIcon, zIndexOffset: 1000 }).addTo(polylineLayer);
            vehicleMarkerRef.current = vehicleMarker;

            // Animate vehicle along routeCoords
            let segmentIndex = 0;
            let progress = 0;
            const speed = 0.007; // Smooth cruise speed

            const animateVehicle = () => {
                if (routeCoords.length < 2) return;

                const p1 = routeCoords[segmentIndex];
                const p2 = routeCoords[(segmentIndex + 1) % routeCoords.length];

                progress += speed;
                if (progress >= 1) {
                    progress = 0;
                    segmentIndex = (segmentIndex + 1) % (routeCoords.length - 1);
                }

                const currentLat = p1[0] + (p2[0] - p1[0]) * progress;
                const currentLng = p1[1] + (p2[1] - p1[1]) * progress;

                if (vehicleMarkerRef.current) {
                    vehicleMarkerRef.current.setLatLng([currentLat, currentLng]);
                }

                animFrameRef.current = requestAnimationFrame(animateVehicle);
            };

            animFrameRef.current = requestAnimationFrame(animateVehicle);

            // Fit map to include all pins
            const bounds = L.latLngBounds(routeCoords);
            map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
        } else if (routeCoords.length === 1) {
            map.setView(routeCoords[0], 13);
        } else {
            map.setView(center, 12);
        }
    }, [districtName, selectedPlaces, allDistrictPlaces, transitMode]);

    return (
        <div className={`relative w-full h-full rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#090D18] ${className}`}>
            {/* Map Canvas Container */}
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Toy Theme Route Meta Overlay Banner */}
            <div className="absolute top-4 left-4 z-[400] flex items-center gap-2 bg-[#0B1120]/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 shadow-xl text-white text-xs">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-gold">{districtName}</span>
                <span className="text-gray-400">•</span>
                <span>{selectedPlaces.length} Stops Active</span>
                <span className="text-gray-400">•</span>
                <span className="font-mono text-purple-300 font-bold">
                    {calculateTotalRouteDistance(selectedPlaces, districtName)} km
                </span>
            </div>

            {/* Map Legend */}
            <div className="absolute bottom-4 right-4 z-[400] hidden sm:flex items-center gap-3 bg-[#0B1120]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-[11px] text-gray-300">
                <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Temples</span>
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Nature</span>
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                    <span>Water</span>
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <span>Forts</span>
                </span>
            </div>
        </div>
    );
}

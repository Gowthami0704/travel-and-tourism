import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Ensure Leaflet does not reference remote CDN icon assets in air-gapped mode
if (typeof window !== 'undefined' && L.Icon && L.Icon.Default) {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: '',
        iconUrl: '',
        shadowUrl: '',
    });
}
import { getPlaceCoordinates, calculateTotalRouteDistance, calculateHaversineDistance, DISTRICT_CENTERS } from '@/Utils/districtCoordinates';
import { cleanName, getImage } from '@/Utils/imageFallback';
import {
    MapPin,
    Layers,
    Navigation,
    Eye,
    EyeOff,
    Sparkles,
    Check,
    Plus,
    Trash2,
    Compass,
    SlidersHorizontal,
    Maximize2
} from 'lucide-react';

/**
 * Tile Layer Configurations for Professional Map Styles (100% Free, No API Key Required)
 */
const MAP_TILES = {
    voyager: {
        name: 'Clean Streets',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abc',
        maxZoom: 19
    },
    dark: {
        name: 'Dark Mode',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
        maxZoom: 16
    },
    satellite: {
        name: 'Satellite',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        maxZoom: 18
    }
};

/**
 * Category styling tokens
 */
const CATEGORY_STYLES = {
    temple: { bg: '#D97706', accent: '#F59E0B', text: '#FEF3C7', icon: '🛕', label: 'Temple & Heritage' },
    nature: { bg: '#059669', accent: '#10B981', text: '#D1FAE5', icon: '🌲', label: 'Nature' },
    hill: { bg: '#047857', accent: '#34D399', text: '#ECFDF5', icon: '⛰️', label: 'Hill Station' },
    water: { bg: '#0284C7', accent: '#38BDF8', text: '#E0F2FE', icon: '🌊', label: 'Water / Beach' },
    heritage: { bg: '#7C3AED', accent: '#A78BFA', text: '#EDE9FE', icon: '🏰', label: 'Palace / Fort' },
    food: { bg: '#DB2777', accent: '#F472B6', text: '#FCE7F3', icon: '🍛', label: 'Food & Culinary' },
    default: { bg: '#475569', accent: '#94A3B8', text: '#F8FAFC', icon: '✨', label: 'Attraction' }
};

function getCategoryTheme(category = '') {
    const c = String(category).toLowerCase();
    if (c.includes('temple') || c.includes('spiritual') || c.includes('kovil')) return CATEGORY_STYLES.temple;
    if (c.includes('nature') || c.includes('forest') || c.includes('park')) return CATEGORY_STYLES.nature;
    if (c.includes('hill') || c.includes('mountain') || c.includes('peak') || c.includes('valley')) return CATEGORY_STYLES.hill;
    if (c.includes('water') || c.includes('beach') || c.includes('fall') || c.includes('lake') || c.includes('sea')) return CATEGORY_STYLES.water;
    if (c.includes('fort') || c.includes('palace') || c.includes('heritage') || c.includes('museum')) return CATEGORY_STYLES.heritage;
    if (c.includes('food') || c.includes('market') || c.includes('mess')) return CATEGORY_STYLES.food;
    return CATEGORY_STYLES.default;
}

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
    const tileLayerRef = useRef(null);
    const markersLayerRef = useRef(null);
    const polylineLayerRef = useRef(null);
    const pulseMarkerRef = useRef(null);
    const animFrameRef = useRef(null);

    // Map UI State
    const [mapStyle, setMapStyle] = useState('voyager'); // 'voyager' | 'dark' | 'satellite'
    const [showAmbientPins, setShowAmbientPins] = useState(false); // Default to clean Route-Only mode!
    const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'temple' | 'beach' | 'hill' | 'heritage' | 'food'

    // Transit speed & ETA estimation
    const transitInfo = useMemo(() => {
        const speedKmh = transitMode === 'Bike' ? 40 : transitMode === 'Bus' ? 35 : transitMode === 'Train' ? 55 : 45;
        const totalDistance = calculateTotalRouteDistance(selectedPlaces, districtName);
        const hours = (totalDistance / speedKmh);
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        const etaText = h > 0 ? `${h}h ${m}m` : `${m} mins`;
        return { totalDistance, etaText };
    }, [selectedPlaces, districtName, transitMode]);

    // 1. Initialize Leaflet Map
    useEffect(() => {
        const container = mapContainerRef.current;
        if (!container) return;

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

            // Initial Tile Layer
            const tileConfig = MAP_TILES[mapStyle] || MAP_TILES.voyager;
            const tileLayer = L.tileLayer(tileConfig.url, {
                attribution: tileConfig.attribution,
                subdomains: tileConfig.subdomains || 'abc',
                maxZoom: tileConfig.maxZoom || 19,
            }).addTo(map);

            L.control.zoom({ position: 'bottomright' }).addTo(map);

            const markersLayer = L.layerGroup().addTo(map);
            const polylineLayer = L.layerGroup().addTo(map);

            mapInstanceRef.current = map;
            tileLayerRef.current = tileLayer;
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

    // 2. Handle Map Style / Tile Switch
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        if (tileLayerRef.current) {
            map.removeLayer(tileLayerRef.current);
        }

        const tileConfig = MAP_TILES[mapStyle] || MAP_TILES.voyager;
        const newTileLayer = L.tileLayer(tileConfig.url, {
            attribution: tileConfig.attribution,
            subdomains: tileConfig.subdomains || 'abc',
            maxZoom: tileConfig.maxZoom || 19,
        }).addTo(map);

        tileLayerRef.current = newTileLayer;
    }, [mapStyle]);

    // 3. Render Clean Markers, Routes, & GPS Pulse
    useEffect(() => {
        const map = mapInstanceRef.current;
        const markersLayer = markersLayerRef.current;
        const polylineLayer = polylineLayerRef.current;
        if (!map || !markersLayer || !polylineLayer) return;

        markersLayer.clearLayers();
        polylineLayer.clearLayers();
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

        const center = DISTRICT_CENTERS[districtName] || [11.1271, 78.6569];

        // Deduplicate selected places
        const seenSelected = new Set();
        const cleanSelectedPlaces = [];
        selectedPlaces.forEach((p) => {
            const idKey = p.id ? String(p.id) : cleanName(p.name).toLowerCase();
            if (!seenSelected.has(idKey)) {
                seenSelected.add(idKey);
                cleanSelectedPlaces.push(p);
            }
        });

        const selectedIds = new Set(cleanSelectedPlaces.map((p) => String(p.id)));

        // A. Render Ambient / Nearby Places (ONLY when showAmbientPins is TRUE)
        if (showAmbientPins && Array.isArray(allDistrictPlaces)) {
            const visibleAmbient = allDistrictPlaces.filter((place) => {
                if (selectedIds.has(String(place.id))) return false;
                if (categoryFilter === 'all') return true;
                const catLower = (place.category || '').toLowerCase();
                if (categoryFilter === 'temple' && (catLower.includes('temple') || catLower.includes('spiritual'))) return true;
                if (categoryFilter === 'beach' && (catLower.includes('beach') || catLower.includes('water') || catLower.includes('fall'))) return true;
                if (categoryFilter === 'hill' && (catLower.includes('hill') || catLower.includes('nature'))) return true;
                if (categoryFilter === 'heritage' && (catLower.includes('fort') || catLower.includes('palace') || catLower.includes('heritage'))) return true;
                if (categoryFilter === 'food' && (catLower.includes('food') || catLower.includes('market'))) return true;
                return false;
            }).slice(0, 15); // Limit to top 15 relevant spots to avoid screen overcrowding

            visibleAmbient.forEach((place) => {
                const [lat, lng] = getPlaceCoordinates(place, districtName);
                const theme = getCategoryTheme(place.category);
                const displayName = cleanName(place.name);
                const imageUrl = getImage(place);

                // Refined, subtle ambient micro-pin
                const ambientIcon = L.divIcon({
                    className: 'custom-ambient-pin',
                    html: `
                        <div style="
                            position: relative;
                            display: flex; align-items: center; justify-content: center;
                            cursor: pointer;
                        ">
                            <div style="
                                width: 22px; height: 22px;
                                background: #0F172A;
                                border: 2px solid ${theme.accent};
                                border-radius: 50%;
                                display: flex; align-items: center; justify-content: center;
                                font-size: 10px;
                                box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                                transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                            " title="${displayName} (${theme.label})">
                                ${theme.icon}
                            </div>
                        </div>
                    `,
                    iconSize: [22, 22],
                    iconAnchor: [11, 11],
                });

                const marker = L.marker([lat, lng], { icon: ambientIcon });

                marker.bindPopup(`
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 200px; padding: 2px;">
                        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                            <span style="background: ${theme.accent}20; color: ${theme.accent}; border: 1px solid ${theme.accent}40; font-weight: 700; font-size: 10px; padding: 2px 6px; rounded-md: 4px; border-radius: 4px;">${theme.label}</span>
                            <span style="font-size: 11px; color: #64748B;">• ${place.district_name || districtName}</span>
                        </div>
                        <div style="font-weight: 800; font-size: 14px; color: #0F172A; line-height: 1.2;">${displayName}</div>
                        ${place.description ? `<div style="font-size: 11px; color: #475569; margin: 6px 0; max-height: 48px; overflow: hidden; text-overflow: ellipsis; line-height: 1.3;">${place.description}</div>` : ''}
                        <button id="add-btn-${place.id}" style="
                            margin-top: 8px; width: 100%; padding: 7px 12px;
                            background: linear-gradient(135deg, #10B981, #059669); color: white; border: none;
                            border-radius: 8px; font-size: 12px; font-weight: 700;
                            box-shadow: 0 2px 6px rgba(16,185,129,0.3);
                            cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;
                        ">+ Add to Active Route</button>
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
        }

        // B. Render Selected Itinerary Stops (High-Contrast Professional SVG Pins)
        const routeCoords = [];

        cleanSelectedPlaces.forEach((place, index) => {
            const [lat, lng] = getPlaceCoordinates(place, districtName);
            routeCoords.push([lat, lng]);
            const theme = getCategoryTheme(place.category);
            const displayName = cleanName(place.name);
            const stopNum = index + 1;

            // Sleek Drop-Pin Design with Stop Number Badge
            const selectedIcon = L.divIcon({
                className: 'custom-selected-pin',
                html: `
                    <div style="
                        position: relative;
                        display: flex; flex-direction: column; align-items: center;
                        cursor: pointer;
                    ">
                        <div style="
                            background: #0F172A;
                            color: #FFFFFF;
                            font-weight: 900; font-size: 12px;
                            width: 32px; height: 32px;
                            border-radius: 50%;
                            display: flex; align-items: center; justify-content: center;
                            box-shadow: 0 0 16px ${theme.accent}88, 0 4px 12px rgba(0,0,0,0.5);
                            border: 3px solid ${theme.accent};
                            position: relative;
                            z-index: 2;
                        " title="Stop ${stopNum}: ${displayName}">
                            ${stopNum}
                        </div>
                        <div style="
                            width: 0; height: 0;
                            border-left: 6px solid transparent;
                            border-right: 6px solid transparent;
                            border-top: 8px solid ${theme.accent};
                            margin-top: -2px;
                            z-index: 1;
                        "></div>
                        <div style="
                            background: rgba(15, 23, 42, 0.9);
                            color: #FFFFFF;
                            font-weight: 700; font-size: 10px;
                            padding: 2px 8px;
                            border-radius: 9999px;
                            border: 1px solid rgba(255,255,255,0.2);
                            white-space: nowrap;
                            margin-top: 3px;
                            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                            max-width: 140px;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        ">
                            ${displayName}
                        </div>
                    </div>
                `,
                iconSize: [140, 60],
                iconAnchor: [70, 36],
            });

            const marker = L.marker([lat, lng], { icon: selectedIcon, zIndexOffset: 600 + index });

            marker.bindPopup(`
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 210px; padding: 2px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                        <span style="background: ${theme.accent}; color: #0F172A; font-weight: 800; font-size: 11px; padding: 2px 8px; border-radius: 6px;">Stop #${stopNum}</span>
                        <span style="font-size: 11px; color: #64748B; font-weight: 600;">${theme.label}</span>
                    </div>
                    <div style="font-weight: 800; font-size: 14px; color: #0F172A; line-height: 1.2;">${displayName}</div>
                    <div style="font-size: 11px; color: #64748B; margin-top: 3px;">• ${place.district_name || districtName}</div>
                    <button id="rem-btn-${place.id}" style="
                        margin-top: 10px; width: 100%; padding: 6px 10px;
                        background: #FEE2E2; color: #DC2626; border: 1px solid #FCA5A5;
                        border-radius: 8px; font-size: 11px; font-weight: 700;
                        cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;
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

        // C. Draw Polylines & Directional GPS Pulse Indicator
        if (routeCoords.length >= 2) {
            // Background Route Glow Shadow
            L.polyline(routeCoords, {
                color: '#0F172A',
                weight: 8,
                opacity: 0.4,
                lineCap: 'round',
                lineJoin: 'round',
            }).addTo(polylineLayer);

            // Sleek Glowing Route Line
            L.polyline(routeCoords, {
                color: '#10B981',
                weight: 4.5,
                opacity: 0.95,
                dashArray: '8, 8',
                lineCap: 'round',
                lineJoin: 'round',
            }).addTo(polylineLayer);

            // Animated Vehicle Cruiser along Route Line (🚗 / 🚌 / 🚂 / 🛵)
            const vehicleEmoji = transitMode === 'Train' ? '🚂' : transitMode === 'Bus' ? '🚌' : transitMode === 'Bike' ? '🛵' : '🚗';
            const vehicleIcon = L.divIcon({
                className: 'custom-vehicle-cruiser',
                html: `
                    <div style="
                        position: relative; width: 42px; height: 42px;
                        display: flex; align-items: center; justify-content: center;
                    ">
                        <!-- Radar wave pulse -->
                        <div style="
                            position: absolute; width: 42px; height: 42px;
                            border-radius: 50%; background: #10B981;
                            opacity: 0.35; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
                        "></div>
                        <!-- Vehicle Pod -->
                        <div style="
                            position: relative; width: 34px; height: 34px;
                            background: #FFFFFF;
                            border: 2.5px solid #10B981;
                            border-radius: 50%;
                            display: flex; align-items: center; justify-content: center;
                            font-size: 18px;
                            box-shadow: 0 0 16px rgba(16,185,129,0.8), 0 4px 10px rgba(0,0,0,0.5);
                            z-index: 2;
                        " title="En route (${transitMode})">
                            ${vehicleEmoji}
                        </div>
                    </div>
                `,
                iconSize: [42, 42],
                iconAnchor: [21, 21],
            });

            const pulseMarker = L.marker(routeCoords[0], { icon: vehicleIcon, zIndexOffset: 1000 }).addTo(polylineLayer);
            pulseMarkerRef.current = pulseMarker;

            // Smooth interpolation along the route line
            let segmentIdx = 0;
            let progress = 0;
            const speed = 0.006;

            const animateVehicle = () => {
                if (routeCoords.length < 2) return;

                const p1 = routeCoords[segmentIdx];
                const p2 = routeCoords[(segmentIdx + 1) % routeCoords.length];

                progress += speed;
                if (progress >= 1) {
                    progress = 0;
                    segmentIdx = (segmentIdx + 1) % (routeCoords.length - 1);
                }

                const currentLat = p1[0] + (p2[0] - p1[0]) * progress;
                const currentLng = p1[1] + (p2[1] - p1[1]) * progress;

                if (pulseMarkerRef.current) {
                    pulseMarkerRef.current.setLatLng([currentLat, currentLng]);
                }

                animFrameRef.current = requestAnimationFrame(animateVehicle);
            };

            animFrameRef.current = requestAnimationFrame(animateVehicle);

            // Fit map to route bounds
            const bounds = L.latLngBounds(routeCoords);
            map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13 });
        } else if (routeCoords.length === 1) {
            map.setView(routeCoords[0], 12);
        } else {
            map.setView(center, 11);
        }
    }, [districtName, selectedPlaces, allDistrictPlaces, showAmbientPins, categoryFilter, transitMode]);

    return (
        <div className={`relative w-full h-full rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#090D18] ${className}`}>
            {/* Map Canvas */}
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* TOP BAR CONTROLS: Route Stats + Mode Toggle + Layer Switcher */}
            <div className="absolute top-4 left-4 right-4 z-[400] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
                {/* Route Summary Pill */}
                <div className="pointer-events-auto flex items-center gap-2.5 bg-[#0B1120]/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 shadow-xl text-white text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-amber-300 font-display">{districtName}</span>
                    <span className="text-gray-500">•</span>
                    <span className="font-semibold text-gray-200">{selectedPlaces.length} Stops Connected</span>
                    <span className="text-gray-500">•</span>
                    <span className="font-mono text-emerald-300 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                        {transitInfo.totalDistance} km (~{transitInfo.etaText})
                    </span>
                </div>

                {/* Map Control Buttons: Route Only vs Show Nearby + Map Style */}
                <div className="pointer-events-auto flex items-center gap-2">
                    {/* View Mode Toggle: Clean Route vs Explore Nearby */}
                    <button
                        type="button"
                        onClick={() => setShowAmbientPins(!showAmbientPins)}
                        className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-lg flex items-center gap-1.5 cursor-pointer border ${
                            showAmbientPins
                                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/20'
                                : 'bg-[#0B1120]/95 text-gray-200 border-white/20 hover:bg-white/10'
                        }`}
                        title={showAmbientPins ? 'Switch to Clean Route Only' : 'Show Nearby Attractions'}
                    >
                        {showAmbientPins ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-amber-400" />}
                        <span>{showAmbientPins ? 'Nearby Spots Visible' : 'Route Focus Only'}</span>
                    </button>

                    {/* Map Tile Style Switcher */}
                    <div className="bg-[#0B1120]/95 backdrop-blur-md p-1 rounded-2xl border border-white/20 shadow-xl flex items-center gap-1">
                        {[
                            { id: 'voyager', label: 'Clean' },
                            { id: 'dark', label: 'Dark' },
                            { id: 'satellite', label: 'Satellite' }
                        ].map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setMapStyle(t.id)}
                                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                                    mapStyle === t.id
                                        ? 'bg-white/20 text-white shadow-sm'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* CATEGORY FILTER CHIPS (Shown when Nearby Spots is enabled) */}
            {showAmbientPins && (
                <div className="absolute top-18 left-4 right-4 z-[400] flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pointer-events-auto">
                    {[
                        { id: 'all', label: 'All Attractions', icon: '✨' },
                        { id: 'temple', label: 'Temples & Heritage', icon: '🛕' },
                        { id: 'hill', label: 'Hills & Nature', icon: '🌲' },
                        { id: 'beach', label: 'Beaches & Water', icon: '🌊' },
                        { id: 'heritage', label: 'Forts & Palaces', icon: '🏰' },
                        { id: 'food', label: 'Culinary Trails', icon: '🍛' }
                    ].map((cat) => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setCategoryFilter(cat.id)}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all shadow-md cursor-pointer border flex items-center gap-1.5 ${
                                categoryFilter === cat.id
                                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border-amber-300 shadow-amber-500/20'
                                    : 'bg-[#0B1120]/90 text-gray-300 border-white/10 hover:bg-white/10'
                            }`}
                        >
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* BOTTOM MAP LEGEND */}
            <div className="absolute bottom-4 left-4 z-[400] hidden sm:flex items-center gap-3 bg-[#0B1120]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-[11px] text-gray-300">
                <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                    <span>Active Route Stops</span>
                </span>
                <span className="text-gray-600">•</span>
                <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Temples</span>
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                    <span>Beaches</span>
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Hills</span>
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                    <span>Heritage</span>
                </span>
            </div>
        </div>
    );
}

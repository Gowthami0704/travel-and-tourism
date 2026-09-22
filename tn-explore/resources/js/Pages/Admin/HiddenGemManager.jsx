import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Sparkles, MapPin, Plus, Check, Search, ExternalLink } from 'lucide-react';
import { getImage, handleImageError } from '@/Utils/imageFallback';

export default function HiddenGemManager({ places = { data: [] }, districts = [] }) {
    const { post, processing, reset } = useForm();
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    const { data: newPlaceData, setData: setNewPlaceData, post: postNewPlace } = useForm({
        district_id: districts[0]?.id || '',
        name: '',
        category: 'hidden_gem',
        description: '',
        image_url: '',
        is_hidden_gem: true,
    });

    const handleToggleGem = (placeId) => {
        post(route('admin.gems.toggle', placeId));
    };

    const handleCreatePlace = (e) => {
        e.preventDefault();
        postNewPlace(route('admin.places.store'), {
            onSuccess: () => {
                setShowAddModal(false);
                reset();
            },
        });
    };

    const placeList = places.data || places;
    const filteredPlaces = placeList.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.district?.name && p.district.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <AdminLayout
            title="Hidden Gem & Place Curator"
            subtitle="Promote offbeat locations to Hidden Gem status and curate tourist discoveries"
        >
            <Head title="Hidden Gem Manager — TN Explore Admin" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search place or district..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-[#080C16] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-gold"
                    />
                </div>

                <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add New Spot / Gem</span>
                </button>
            </div>

            {/* Places Grid with Toggle Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPlaces.map((place) => {
                    const img = getImage(place, 'place');
                    return (
                        <div
                            key={place.id}
                            className={`p-4 rounded-2xl bg-navy-card/90 border transition-all flex flex-col justify-between gap-3 ${
                                place.is_hidden_gem
                                    ? 'border-purple-500/40 bg-purple-950/10'
                                    : 'border-white/10'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-navy-lighter flex-shrink-0">
                                    <img
                                        src={img}
                                        alt={place.name}
                                        onError={(e) => handleImageError(e, place.category)}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <h4 className="font-bold text-white text-sm truncate">
                                            {place.name}
                                        </h4>
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        📍 {place.district?.name} • <span className="capitalize">{place.category?.replace('_', ' ')}</span>
                                    </p>
                                    <p className="text-[11px] text-gray-400 line-clamp-2 mt-1">
                                        {place.description}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    place.is_hidden_gem
                                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                        : 'bg-white/5 text-gray-400'
                                }`}>
                                    {place.is_hidden_gem ? '💎 HIDDEN GEM' : '🏛️ Regular Attraction'}
                                </span>

                                <button
                                    type="button"
                                    disabled={processing}
                                    onClick={() => handleToggleGem(place.id)}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                        place.is_hidden_gem
                                            ? 'bg-white/10 hover:bg-red-500/20 text-gray-300 hover:text-red-300'
                                            : 'bg-purple-600 hover:bg-purple-500 text-white'
                                    }`}
                                >
                                    {place.is_hidden_gem ? 'Demote to Regular' : 'Promote to Gem 💎'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add New Place Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="w-full max-w-lg rounded-2xl bg-[#0D1322] border border-white/20 p-6 text-white shadow-2xl">
                        <h3 className="font-display text-xl font-bold mb-4">
                            Add New Attraction / Hidden Gem
                        </h3>

                        <form onSubmit={handleCreatePlace} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">District</label>
                                <select
                                    value={newPlaceData.district_id}
                                    onChange={(e) => setNewPlaceData('district_id', e.target.value)}
                                    className="w-full px-3 py-2 bg-[#080C16] border border-white/10 rounded-xl text-xs text-white"
                                >
                                    {districts.map((d) => (
                                        <option key={d.id} value={d.id}>{d.name} ({d.region})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Place Name</label>
                                <input
                                    type="text"
                                    value={newPlaceData.name}
                                    onChange={(e) => setNewPlaceData('name', e.target.value)}
                                    className="w-full px-3 py-2 bg-[#080C16] border border-white/10 rounded-xl text-xs text-white"
                                    required
                                    placeholder="e.g. Broken Bridge Trail"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Category</label>
                                    <select
                                        value={newPlaceData.category}
                                        onChange={(e) => setNewPlaceData('category', e.target.value)}
                                        className="w-full px-3 py-2 bg-[#080C16] border border-white/10 rounded-xl text-xs text-white"
                                    >
                                        <option value="temple">Temple</option>
                                        <option value="heritage">Heritage</option>
                                        <option value="beach">Beach</option>
                                        <option value="hill_station">Hill Station</option>
                                        <option value="nature">Nature</option>
                                        <option value="hidden_gem">Hidden Gem</option>
                                    </select>
                                </div>

                                <div className="flex items-center pt-6">
                                    <label className="flex items-center gap-2 cursor-pointer text-xs">
                                        <input
                                            type="checkbox"
                                            checked={newPlaceData.is_hidden_gem}
                                            onChange={(e) => setNewPlaceData('is_hidden_gem', e.target.checked)}
                                            className="rounded bg-navy-lighter text-purple-600"
                                        />
                                        <span>Mark as Hidden Gem 💎</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Description</label>
                                <textarea
                                    rows="3"
                                    value={newPlaceData.description}
                                    onChange={(e) => setNewPlaceData('description', e.target.value)}
                                    className="w-full px-3 py-2 bg-[#080C16] border border-white/10 rounded-xl text-xs text-white"
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 rounded-xl bg-white/10 text-xs font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
                                >
                                    Save Place
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

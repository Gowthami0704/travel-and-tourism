import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Sparkles, MapPin, Plus, Check, Search, ExternalLink, X } from 'lucide-react';
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
                    <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search place or district..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-amber-500"
                    />
                </div>

                <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer self-start sm:self-auto hover:opacity-95"
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
                            className={`p-4 rounded-2xl bg-[var(--card)] border transition-all flex flex-col justify-between gap-3 shadow-sm ${
                                place.is_hidden_gem
                                    ? 'border-purple-500/40'
                                    : 'border-[var(--border)]'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-[var(--bg)] flex-shrink-0 border border-[var(--border)]">
                                    <img
                                        src={img}
                                        alt={place.name}
                                        onError={(e) => handleImageError(e, place.category)}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <h4 className="font-bold text-[var(--text)] text-sm truncate">
                                            {place.name}
                                        </h4>
                                    </div>
                                    <p className="text-xs text-[var(--muted)] flex items-center gap-1 mt-0.5">
                                        <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                                        <span>{place.district?.name} • <span className="capitalize">{place.category?.replace('_', ' ')}</span></span>
                                    </p>
                                    <p className="text-[11px] text-[var(--muted)] line-clamp-2 mt-1">
                                        {place.description}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    place.is_hidden_gem
                                        ? 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30'
                                        : 'bg-[var(--bg)] text-[var(--muted)] border border-[var(--border)]'
                                }`}>
                                    {place.is_hidden_gem ? '💎 HIDDEN GEM' : '🏛️ Regular Attraction'}
                                </span>

                                <button
                                    type="button"
                                    disabled={processing}
                                    onClick={() => handleToggleGem(place.id)}
                                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                        place.is_hidden_gem
                                            ? 'bg-[var(--bg)] hover:bg-rose-500/15 border border-[var(--border)] text-[var(--muted)] hover:text-rose-500 dark:hover:text-rose-300'
                                            : 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm'
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="w-full max-w-lg rounded-2xl bg-[var(--card)] border border-[var(--border)] p-6 text-[var(--text)] shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-[var(--text)]">
                                Add New Attraction / Hidden Gem
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowAddModal(false)}
                                className="p-1 text-[var(--muted)] hover:text-[var(--text)]"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreatePlace} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-[var(--text)] uppercase mb-1">District</label>
                                <select
                                    value={newPlaceData.district_id}
                                    onChange={(e) => setNewPlaceData('district_id', e.target.value)}
                                    className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] focus:outline-none focus:border-purple-500"
                                >
                                    {districts.map((d) => (
                                        <option key={d.id} value={d.id}>{d.name} ({d.region})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[var(--text)] uppercase mb-1">Place Name</label>
                                <input
                                    type="text"
                                    value={newPlaceData.name}
                                    onChange={(e) => setNewPlaceData('name', e.target.value)}
                                    className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] focus:outline-none focus:border-purple-500"
                                    required
                                    placeholder="e.g. Broken Bridge Trail"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-[var(--text)] uppercase mb-1">Category</label>
                                    <select
                                        value={newPlaceData.category}
                                        onChange={(e) => setNewPlaceData('category', e.target.value)}
                                        className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] focus:outline-none focus:border-purple-500"
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
                                    <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--text)]">
                                        <input
                                            type="checkbox"
                                            checked={newPlaceData.is_hidden_gem}
                                            onChange={(e) => setNewPlaceData('is_hidden_gem', e.target.checked)}
                                            className="rounded bg-[var(--bg)] border-[var(--border)] text-purple-600 focus:ring-purple-500"
                                        />
                                        <span>Mark as Hidden Gem 💎</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[var(--text)] uppercase mb-1">Description</label>
                                <textarea
                                    rows="3"
                                    value={newPlaceData.description}
                                    onChange={(e) => setNewPlaceData('description', e.target.value)}
                                    className="w-full px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-xs text-[var(--text)] focus:outline-none focus:border-purple-500"
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 rounded-xl bg-[var(--bg)] hover:bg-[var(--card)] border border-[var(--border)] text-[var(--muted)] text-xs font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-sm"
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

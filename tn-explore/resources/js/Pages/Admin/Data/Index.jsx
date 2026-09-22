import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import {
    Database,
    Search,
    Plus,
    Edit2,
    Trash2,
    Download,
    MapPin,
    Sparkles,
    Check,
    X,
    FileSpreadsheet,
    Layers,
    Image,
    Globe
} from 'lucide-react';

export default function DataIndex({ places, districts = [], categories = [], filters = {}, totalCount = 0 }) {
    const [search, setSearch] = useState(filters.search || '');
    const [districtFilter, setDistrictFilter] = useState(filters.district_id || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || '');
    const [showModal, setShowModal] = useState(false);
    const [editingPlace, setEditingPlace] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        district_id: districts[0]?.id || 1,
        category: 'Temple & Heritage',
        description: '',
        image_url: '',
        latitude: 10.0,
        longitude: 78.0,
        is_hidden_gem: false,
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.data.index'), {
            search,
            district_id: districtFilter,
            category: categoryFilter,
        }, { preserveState: true });
    };

    const openCreateModal = () => {
        setEditingPlace(null);
        reset();
        setShowModal(true);
    };

    const openEditModal = (place) => {
        setEditingPlace(place);
        setData({
            name: place.name,
            district_id: place.district_id,
            category: place.category,
            description: place.description,
            image_url: place.image_url || '',
            latitude: place.latitude || 10.0,
            longitude: place.longitude || 78.0,
            is_hidden_gem: Boolean(place.is_hidden_gem),
        });
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingPlace) {
            put(route('admin.data.update', editingPlace.id), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                }
            });
        } else {
            post(route('admin.data.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                }
            });
        }
    };

    const handleDelete = (id, name) => {
        if (confirm(`Are you sure you want to delete '${name}'? It will be archived to deleted_records.json for backup.`)) {
            router.delete(route('admin.data.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AdminLayout
            title="Tamil Nadu Tourism Data Editor"
            subtitle={`Live master directory of state tourist attractions, temples, waterfalls & food trails (${totalCount.toLocaleString()} total entries)`}
        >
            <Head title="Tourism Dataset Editor — Admin" />

            <div className="space-y-6">

                {/* FILTERS & ACTION BAR */}
                <div className="p-4 rounded-2xl bg-[#0E1526] border border-white/10 flex flex-wrap items-center justify-between gap-4">
                    <form onSubmit={handleSearch} className="flex flex-1 flex-wrap items-center gap-2 min-w-[280px]">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search destinations, temples, hills..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                            />
                        </div>

                        <select
                            value={districtFilter}
                            onChange={(e) => setDistrictFilter(e.target.value)}
                            className="bg-slate-950 border border-white/10 rounded-xl text-xs text-gray-300 px-3 py-1.5 focus:outline-none"
                        >
                            <option value="">All 38 Districts</option>
                            {districts.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>

                        <button
                            type="submit"
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer transition-all"
                        >
                            Search
                        </button>
                    </form>

                    <div className="flex items-center gap-2">
                        {/* CSV Export */}
                        <a
                            href={route('admin.data.exportCsv')}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                            <span>Export CSV</span>
                        </a>

                        {/* Add Place */}
                        <button
                            onClick={openCreateModal}
                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>+ Add Destination</span>
                        </button>
                    </div>
                </div>

                {/* PLACES DATASET TABLE */}
                <div className="p-6 rounded-2xl bg-[#0E1526] border border-white/10 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-gray-300">
                            <thead className="bg-white/5 text-gray-400 uppercase text-[10px] font-bold tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">ID</th>
                                    <th className="px-4 py-3">Destination Name</th>
                                    <th className="px-4 py-3">District</th>
                                    <th className="px-4 py-3">Category</th>
                                    <th className="px-4 py-3">Hidden Gem</th>
                                    <th className="px-4 py-3">Description</th>
                                    <th className="px-4 py-3 rounded-r-lg text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {places.data?.map((place) => (
                                    <tr key={place.id} className="hover:bg-white/5 transition">
                                        <td className="px-4 py-3.5 font-mono text-[11px] text-gray-500">#{place.id}</td>
                                        <td className="px-4 py-3.5">
                                            <div className="font-bold text-white text-sm">{place.name}</div>
                                            <div className="text-[10px] text-gray-400">
                                                {place.latitude && place.longitude ? `Coords: ${place.latitude}, ${place.longitude}` : ''}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-gray-200 font-medium">
                                            {place.district?.name || 'Tamil Nadu'}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className="px-2 py-0.5 rounded-md bg-white/5 text-gold text-[10px] font-semibold">
                                                {place.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {place.is_hidden_gem ? (
                                                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30 flex items-center gap-1 w-fit">
                                                    <Sparkles className="w-3 h-3" />
                                                    Hidden Gem
                                                </span>
                                            ) : (
                                                <span className="text-gray-500 text-[11px]">Standard</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-gray-400 max-w-xs line-clamp-2">
                                            {place.description}
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => openEditModal(place)}
                                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition cursor-pointer"
                                                    title="Edit Record"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(place.id, place.name)}
                                                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition cursor-pointer"
                                                    title="Delete & Archive"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* ADD / EDIT PLACE MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
                    <div className="relative w-full max-w-xl bg-[#0E1526] border border-white/10 rounded-2xl p-6 text-white space-y-4 my-8">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <h4 className="text-base font-bold text-white flex items-center gap-2">
                                <Database className="w-5 h-5 text-amber-400" />
                                <span>{editingPlace ? `Edit '${editingPlace.name}'` : 'Add New Tourist Destination'}</span>
                            </h4>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3.5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Place / Attraction Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Thirumalai Nayakkar Palace"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full p-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">District</label>
                                    <select
                                        value={data.district_id}
                                        onChange={(e) => setData('district_id', e.target.value)}
                                        className="w-full p-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none"
                                    >
                                        {districts.map(d => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-300 mb-1">Category</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Temple / Waterfalls / Palace..."
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="w-full p-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Description</label>
                                <textarea
                                    rows="3"
                                    required
                                    placeholder="Historical background, architecture, best visiting hours..."
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="w-full p-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Image URL</label>
                                <input
                                    type="text"
                                    placeholder="https://images.unsplash.com/..."
                                    value={data.image_url}
                                    onChange={(e) => setData('image_url', e.target.value)}
                                    className="w-full p-2.5 bg-slate-950 border border-white/15 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.is_hidden_gem}
                                        onChange={(e) => setData('is_hidden_gem', e.target.checked)}
                                        className="rounded bg-slate-950 border-white/20 text-purple-500"
                                    />
                                    <span>Tag as Offbeat Hidden Gem ✨</span>
                                </label>
                            </div>

                            <div className="flex gap-2 justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow"
                                >
                                    {processing ? 'Saving...' : editingPlace ? 'Update Record' : 'Save & Sync'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

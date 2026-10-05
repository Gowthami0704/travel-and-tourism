import React, { useState } from 'react';
import { Award, Trophy, MapPin, Sparkles, CheckCircle2, Lock, Star, Compass, Share2 } from 'lucide-react';

export default function DistrictBadges({ districts = [] }) {
    // Demo visited districts tracker (persistent in localStorage if present)
    const [visitedDistricts, setVisitedDistricts] = useState(() => {
        try {
            const saved = localStorage.getItem('tn_visited_districts');
            return saved ? JSON.parse(saved) : ['Nilgiris', 'Madurai', 'Thanjavur', 'Chennai', 'Kanyakumari'];
        } catch (e) {
            return ['Nilgiris', 'Madurai', 'Thanjavur', 'Chennai', 'Kanyakumari'];
        }
    });

    const [activeCategory, setActiveCategory] = useState('All');
    const [selectedBadge, setSelectedBadge] = useState(null);

    const badges = [
        {
            id: 'chola-dynasty',
            title: 'Chola Heritage Vanguard',
            district: 'Thanjavur',
            region: 'Central',
            icon: '🏛️',
            points: 250,
            requirement: 'Visit Brihadeeswara Temple & Thanjavur Maratha Palace with group',
            rarity: 'Legendary',
            color: 'from-amber-500 to-yellow-600',
            bgGlow: 'rgba(245, 158, 11, 0.15)',
            unlocked: visitedDistricts.includes('Thanjavur')
        },
        {
            id: 'queen-of-hills',
            title: 'Nilgiris Peak Climber',
            district: 'Nilgiris',
            region: 'Kongu',
            icon: '🌲',
            points: 200,
            requirement: 'Trek Doddabetta Peak & ride the Nilgiri Mountain Railway',
            rarity: 'Epic',
            color: 'from-emerald-500 to-teal-600',
            bgGlow: 'rgba(16, 185, 129, 0.15)',
            unlocked: visitedDistricts.includes('Nilgiris')
        },
        {
            id: 'temple-city-connoisseur',
            title: 'Madurai Temple & Foodie',
            district: 'Madurai',
            region: 'South',
            icon: '🪔',
            points: 220,
            requirement: 'Explore Meenakshi Amman Temple & taste authentic Jigarthanda',
            rarity: 'Legendary',
            color: 'from-purple-500 to-indigo-600',
            bgGlow: 'rgba(168, 85, 247, 0.15)',
            unlocked: visitedDistricts.includes('Madurai')
        },
        {
            id: 'cape-comorin-voyager',
            title: 'Triveni Sangam Voyager',
            district: 'Kanyakumari',
            region: 'Coastal',
            icon: '🌅',
            points: 280,
            requirement: 'Witness sunrise/sunset at Vivekananda Rock Memorial & Thiruvalluvar Statue',
            rarity: 'Legendary',
            color: 'from-rose-500 to-orange-500',
            bgGlow: 'rgba(244, 63, 94, 0.15)',
            unlocked: visitedDistricts.includes('Kanyakumari')
        },
        {
            id: 'metropolis-explorer',
            title: 'Singara Chennai Explorer',
            district: 'Chennai',
            region: 'North',
            icon: '🌊',
            points: 150,
            requirement: 'Walk Marina Beach Promenade & Kapaleeshwarar Mylapore',
            rarity: 'Rare',
            color: 'from-blue-500 to-cyan-500',
            bgGlow: 'rgba(59, 130, 246, 0.15)',
            unlocked: visitedDistricts.includes('Chennai')
        },
        {
            id: 'kodaikanal-mist',
            title: 'Princess of Hills Rover',
            district: 'Dindigul',
            region: 'Kongu',
            icon: '⛰️',
            points: 200,
            requirement: 'Cycle around Kodaikanal Lake & visit Pillar Rocks',
            rarity: 'Epic',
            color: 'from-teal-500 to-cyan-600',
            bgGlow: 'rgba(20, 184, 166, 0.15)',
            unlocked: visitedDistricts.includes('Dindigul')
        },
        {
            id: 'chettinad-heritage',
            title: 'Chettinad Palace Chronicler',
            district: 'Sivaganga',
            region: 'South',
            icon: '🏰',
            points: 240,
            requirement: 'Tour 1000-window heritage mansions & taste Karaikudi delicacies',
            rarity: 'Epic',
            color: 'from-amber-600 to-orange-700',
            bgGlow: 'rgba(217, 119, 6, 0.15)',
            unlocked: visitedDistricts.includes('Sivaganga')
        },
        {
            id: 'rameswaram-ram-setu',
            title: 'Dhanushkodi Border Guard',
            district: 'Ramanathapuram',
            region: 'Coastal',
            icon: '🏝️',
            points: 300,
            requirement: 'Reach the tip of Dhanushkodi ghost town & Pamban Bridge',
            rarity: 'Mythic',
            color: 'from-cyan-500 to-blue-600',
            bgGlow: 'rgba(6, 182, 212, 0.15)',
            unlocked: visitedDistricts.includes('Ramanathapuram')
        },
        {
            id: 'yercaud-jewel',
            title: 'Shevaroys Cloudwalker',
            district: 'Salem',
            region: 'Kongu',
            icon: '☕',
            points: 180,
            requirement: 'Visit Yercaud coffee plantations & Lady’s Seat viewpoint',
            rarity: 'Rare',
            color: 'from-emerald-600 to-green-700',
            bgGlow: 'rgba(16, 185, 129, 0.15)',
            unlocked: visitedDistricts.includes('Salem')
        },
        {
            id: 'courtallam-cascade',
            title: 'Spa of South Chaser',
            district: 'Tenkasi',
            region: 'South',
            icon: '💦',
            points: 210,
            requirement: 'Bathe in Courtallam Main Falls & Five Falls during monsoon',
            rarity: 'Rare',
            color: 'from-blue-600 to-indigo-700',
            bgGlow: 'rgba(37, 99, 235, 0.15)',
            unlocked: visitedDistricts.includes('Tenkasi')
        }
    ];

    const toggleDistrictVisited = (districtName) => {
        let updated;
        if (visitedDistricts.includes(districtName)) {
            updated = visitedDistricts.filter((d) => d !== districtName);
        } else {
            updated = [...visitedDistricts, districtName];
        }
        setVisitedDistricts(updated);
        try {
            localStorage.setItem('tn_visited_districts', JSON.stringify(updated));
        } catch (e) {
            // ignore
        }
    };

    const unlockedCount = badges.filter((b) => b.unlocked).length;
    const totalPoints = badges.reduce((acc, b) => acc + (b.unlocked ? b.points : 0), 0);
    const maxPoints = badges.reduce((acc, b) => acc + b.points, 0);
    const explorerRank =
        unlockedCount >= 8
            ? 'TN Grand Explorer (Tier 5)'
            : unlockedCount >= 5
            ? 'Heritage Trailblazer (Tier 3)'
            : 'Wanderlust Initiate (Tier 1)';

    const filteredBadges = badges.filter((b) => {
        if (activeCategory === 'All') return true;
        if (activeCategory === 'Unlocked') return b.unlocked;
        if (activeCategory === 'Locked') return !b.unlocked;
        return b.region === activeCategory;
    });

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* BADGES HERO STATS */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 max-w-xl space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                            <Trophy className="w-3.5 h-3.5" />
                            Gamified Group Achievements
                        </span>
                        <span className="text-purple-700 dark:text-purple-300 text-xs font-semibold">
                            38 Districts Passport
                        </span>
                    </div>

                    <h2 className="font-display font-black text-2xl sm:text-3xl text-stone-900 dark:text-white">
                        Tamil Nadu Explorer Badges
                    </h2>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                        Earn exclusive travel badges and level up your traveler profile as your group completes journeys across Tamil Nadu’s hill stations, coastal shores, and temple towns.
                    </p>

                    <div className="pt-2 flex items-center gap-3">
                        <div className="px-3 py-1.5 rounded-xl bg-[#FAF7F0] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs shadow-sm">
                            <span className="text-stone-500 dark:text-stone-400 text-[10px] block">Current Rank</span>
                            <strong className="text-amber-700 dark:text-amber-400 font-bold">{explorerRank}</strong>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-[#FAF7F0] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-mono shadow-sm">
                            <span className="text-stone-500 dark:text-stone-400 text-[10px] block">Experience Points</span>
                            <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{totalPoints} / {maxPoints} XP</strong>
                        </div>
                    </div>
                </div>

                {/* Progress Circle Visual */}
                <div className="relative z-10 flex items-center justify-center p-5 bg-[#FAF7F0] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-sm">
                    <div className="text-center space-y-1">
                        <div className="text-3xl font-black font-display text-amber-700 dark:text-amber-400">
                            {unlockedCount} / {badges.length}
                        </div>
                        <div className="text-[11px] font-bold text-stone-700 dark:text-stone-300">
                            Badges Claimed
                        </div>
                        <div className="w-36 h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden mt-2 mx-auto">
                            <div
                                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
                                style={{ width: `${(unlockedCount / badges.length) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* CATEGORY FILTER PILLS */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {['All', 'Unlocked', 'Locked', 'Kongu', 'South', 'Central', 'Coastal', 'North'].map((cat) => (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                            activeCategory === cat
                                ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-stone-700'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* BADGES GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredBadges.map((badge) => (
                    <div
                        key={badge.id}
                        onClick={() => setSelectedBadge(badge)}
                        className={`relative rounded-3xl p-5 border transition-all duration-300 cursor-pointer flex flex-col justify-between group overflow-hidden ${
                            badge.unlocked
                                ? 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 hover:border-amber-400 hover:shadow-lg hover:-translate-y-1'
                                : 'bg-stone-50 dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 opacity-75 hover:opacity-90'
                        }`}
                    >
                        <div className="space-y-4">
                            {/* Icon & Rarity Tag */}
                            <div className="flex items-center justify-between">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-md transition-transform group-hover:scale-110 bg-gradient-to-br ${badge.color}`}>
                                    {badge.icon}
                                </div>

                                <div className="text-right space-y-1">
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide ${
                                        badge.rarity === 'Mythic'
                                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                            : badge.rarity === 'Legendary'
                                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                            : badge.rarity === 'Epic'
                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                    }`}>
                                        {badge.rarity}
                                    </span>
                                    <span className="block text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                                        +{badge.points} XP
                                    </span>
                                </div>
                            </div>

                            {/* Badge Title & District */}
                            <div>
                                <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                                    <MapPin className="w-3 h-3 text-amber-600" />
                                    <span>{badge.district} District ({badge.region} TN)</span>
                                </div>
                                <h3 className="font-display font-bold text-base text-stone-900 dark:text-white mt-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                    {badge.title}
                                </h3>
                                <p className="text-xs text-stone-600 dark:text-stone-300 mt-1.5 leading-relaxed line-clamp-2">
                                    {badge.requirement}
                                </p>
                            </div>
                        </div>

                        {/* Status Footer */}
                        <div className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                            {badge.unlocked ? (
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Unlocked & Claimed
                                </span>
                            ) : (
                                <span className="text-xs font-semibold text-stone-400 flex items-center gap-1.5">
                                    <Lock className="w-4 h-4" />
                                    Trip Required
                                </span>
                            )}

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleDistrictVisited(badge.district);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-[10px] font-bold text-stone-700 dark:bg-stone-800 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition-all cursor-pointer"
                            >
                                {badge.unlocked ? 'Mark Unvisited' : 'Mark Visited'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL: BADGE DETAILS / SHARE */}
            {selectedBadge && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-6 sm:p-8 shadow-2xl text-stone-900 dark:text-white space-y-5 text-center">
                        <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-4xl shadow-lg bg-gradient-to-br ${selectedBadge.color}`}>
                            {selectedBadge.icon}
                        </div>

                        <div className="space-y-1">
                            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                {selectedBadge.rarity} Achievement
                            </span>
                            <h3 className="font-display font-bold text-xl text-stone-900 dark:text-white pt-2">
                                {selectedBadge.title}
                            </h3>
                            <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold flex items-center justify-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {selectedBadge.district} District • {selectedBadge.region} Tamil Nadu
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-[#FAF7F0] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-left space-y-2">
                            <span className="text-[10px] font-bold text-stone-500 uppercase">Requirement Checklist</span>
                            <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                                {selectedBadge.requirement}
                            </p>
                            <div className="pt-2 flex items-center justify-between text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                                <span>Rewards:</span>
                                <span>+{selectedBadge.points} Travel Karma XP</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    if (navigator.clipboard) {
                                        navigator.clipboard.writeText(`I earned the "${selectedBadge.title}" badge exploring ${selectedBadge.district} on TN Explore!`);
                                        alert('Badge share link copied to clipboard!');
                                    }
                                }}
                                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-md shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <Share2 className="w-4 h-4" />
                                Share Badge
                            </button>

                            <button
                                type="button"
                                onClick={() => setSelectedBadge(null)}
                                className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300 font-bold text-xs transition-all cursor-pointer border border-stone-200 dark:border-stone-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

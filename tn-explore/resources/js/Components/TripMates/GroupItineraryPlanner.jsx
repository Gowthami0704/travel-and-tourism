import React, { useState } from 'react';
import {
    Calendar,
    Clock,
    MapPin,
    CheckSquare,
    Square,
    Vote,
    ThumbsUp,
    Plus,
    Trash2,
    Sparkles,
    UserCheck,
    Luggage,
    FileText,
    Share2,
    Users
} from 'lucide-react';

export default function GroupItineraryPlanner({ tripTitle = 'Nilgiris & Mudumalai Expedition' }) {
    // Collaborative Poll Options State
    const [polls, setPolls] = useState([
        {
            id: 'poll-1',
            title: 'Day 2 Sunrise Viewpoint Choice',
            options: [
                { id: 'opt-1', text: 'Doddabetta Peak Viewpoint (Early 5:30 AM)', votes: 4, voters: ['Kavitha', 'Dinesh', 'Ananya', 'Vijay'] },
                { id: 'opt-2', text: 'Ketti Valley View + Tea Plantation Walk', votes: 2, voters: ['Priya', 'Rohan'] }
            ]
        },
        {
            id: 'poll-2',
            title: 'Dinner Venue at Ooty Town',
            options: [
                { id: 'opt-3', text: 'Authentic Badaga Traditional Kitchen', votes: 5, voters: ['Kavitha', 'Dinesh', 'Ananya', 'Priya', 'Rohan'] },
                { id: 'opt-4', text: 'Ooty Club Colonial Dining', votes: 1, voters: ['Vijay'] }
            ]
        }
    ]);

    // Collaborative Checklist State
    const [checklist, setChecklist] = useState([
        { id: 'chk-1', text: 'Trekking Shoes with Good Grip (Annamalai/Nilgiris terrain)', completed: true, assignedTo: 'All Members' },
        { id: 'chk-2', text: 'Forest Department E-Pass / Mudumalai Safari Permit', completed: true, assignedTo: 'Kavitha Ramachandran' },
        { id: 'chk-3', text: 'First-Aid Kit + Motion Sickness Pills for Ghat Roads', completed: false, assignedTo: 'Dinesh Kumar' },
        { id: 'chk-4', text: 'Camera + Extra Batteries & Power Banks', completed: true, assignedTo: 'Vijay Sundaram' },
        { id: 'chk-5', text: 'Light Winter Woolen Jacket / Windcheater', completed: false, assignedTo: 'All Members' },
        { id: 'chk-6', text: 'Cash reserve for remote tea estate stalls (low UPI coverage)', completed: false, assignedTo: 'Priya Mani' }
    ]);

    const [newItemText, setNewItemText] = useState('');
    const [newAssignee, setNewAssignee] = useState('All Members');
    const [newPollQuestion, setNewPollQuestion] = useState('');
    const [newOption1, setNewOption1] = useState('');
    const [newOption2, setNewOption2] = useState('');
    const [isAddingPoll, setIsAddingPoll] = useState(false);

    // Vote on a poll option
    const handleVote = (pollId, optionId) => {
        setPolls((prev) =>
            prev.map((poll) => {
                if (poll.id !== pollId) return poll;
                return {
                    ...poll,
                    options: poll.options.map((opt) => {
                        if (opt.id === optionId) {
                            return { ...opt, votes: opt.votes + 1, voters: [...opt.voters, 'You'] };
                        }
                        return opt;
                    })
                };
            })
        );
    };

    // Toggle checklist item
    const toggleChecklistItem = (id) => {
        setChecklist((prev) =>
            prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
        );
    };

    // Add new checklist item
    const handleAddChecklistItem = (e) => {
        e.preventDefault();
        if (!newItemText.trim()) return;
        const newItem = {
            id: `chk-${Date.now()}`,
            text: newItemText.trim(),
            completed: false,
            assignedTo: newAssignee
        };
        setChecklist([...checklist, newItem]);
        setNewItemText('');
    };

    // Add new poll
    const handleCreatePoll = (e) => {
        e.preventDefault();
        if (!newPollQuestion.trim() || !newOption1.trim() || !newOption2.trim()) return;
        const newPoll = {
            id: `poll-${Date.now()}`,
            title: newPollQuestion.trim(),
            options: [
                { id: `opt-${Date.now()}-1`, text: newOption1.trim(), votes: 1, voters: ['You'] },
                { id: `opt-${Date.now()}-2`, text: newOption2.trim(), votes: 0, voters: [] }
            ]
        };
        setPolls([...polls, newPoll]);
        setNewPollQuestion('');
        setNewOption1('');
        setNewOption2('');
        setIsAddingPoll(false);
    };

    const completedCount = checklist.filter((i) => i.completed).length;
    const progressPercent = Math.round((completedCount / (checklist.length || 1)) * 100);

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* HEADER HERO */}
            <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider mb-1">
                        <Users className="w-3.5 h-3.5" />
                        Live Group Planning Squad
                    </div>
                    <h2 className="font-display font-bold text-2xl text-stone-900 dark:text-white">
                        {tripTitle} — Group Itinerary & Polls
                    </h2>
                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                        Vote together on sightseeing detours, manage shared packing checklists, and assign group responsibilities.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 rounded-2xl bg-[#FAF7F0] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-right">
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 block uppercase font-bold">Group Readiness</span>
                        <span className="text-base font-black text-emerald-700 dark:text-emerald-400 font-mono">{progressPercent}% Ready</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ========================================================= */}
                {/* SECTION 1: LIVE GROUP POLLS (DECISION MAKING)             */}
                {/* ========================================================= */}
                <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-sm space-y-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center border border-purple-200 dark:border-purple-800">
                                <Vote className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-display font-bold text-base text-stone-900 dark:text-white">
                                    Squad Decision Polls
                                </h3>
                                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                    Vote on route changes, food spots, and departure times
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsAddingPoll(!isAddingPoll)}
                            className="px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-600 text-purple-800 hover:text-white dark:bg-purple-950/60 dark:text-purple-200 border border-purple-300 dark:border-purple-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            {isAddingPoll ? 'Cancel' : 'New Poll'}
                        </button>
                    </div>

                    {/* NEW POLL FORM */}
                    {isAddingPoll && (
                        <form onSubmit={handleCreatePoll} className="p-4 rounded-2xl bg-[#FAF7F0] dark:bg-stone-800/80 border border-purple-300 dark:border-purple-800 space-y-3">
                            <h4 className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase">Create Quick Poll</h4>
                            <input
                                type="text"
                                value={newPollQuestion}
                                onChange={(e) => setNewPollQuestion(e.target.value)}
                                placeholder="What should the group decide? (e.g. Which lake to visit?)"
                                className="w-full px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-purple-500"
                                required
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    value={newOption1}
                                    onChange={(e) => setNewOption1(e.target.value)}
                                    placeholder="Option A (e.g. Avalanche Lake)"
                                    className="px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-purple-500"
                                    required
                                />
                                <input
                                    type="text"
                                    value={newOption2}
                                    onChange={(e) => setNewOption2(e.target.value)}
                                    placeholder="Option B (e.g. Pykara Waterfalls)"
                                    className="px-3 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-purple-500"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                            >
                                Publish Poll to Group
                            </button>
                        </form>
                    )}

                    {/* POLLS LIST */}
                    <div className="space-y-4">
                        {polls.map((poll) => {
                            const totalVotes = poll.options.reduce((acc, o) => acc + o.votes, 0) || 1;

                            return (
                                <div key={poll.id} className="p-4 rounded-2xl bg-[#FAF7F0] dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3">
                                    <h4 className="font-bold text-xs text-stone-900 dark:text-white flex items-center justify-between">
                                        <span>📊 {poll.title}</span>
                                        <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono font-normal">
                                            {totalVotes} total votes
                                        </span>
                                    </h4>

                                    <div className="space-y-2">
                                        {poll.options.map((opt) => {
                                            const pct = Math.round((opt.votes / totalVotes) * 100);

                                            return (
                                                <div
                                                    key={opt.id}
                                                    onClick={() => handleVote(poll.id, opt.id)}
                                                    className="relative p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-purple-400 cursor-pointer overflow-hidden transition-all group shadow-sm"
                                                >
                                                    {/* Progress bar background fill */}
                                                    <div
                                                        className="absolute inset-y-0 left-0 bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/40 transition-all"
                                                        style={{ width: `${pct}%` }}
                                                    />

                                                    <div className="relative z-10 flex items-center justify-between text-xs">
                                                        <span className="font-medium text-stone-800 dark:text-stone-200 group-hover:text-stone-900 dark:group-hover:text-white flex items-center gap-1.5">
                                                            <ThumbsUp className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                                            {opt.text}
                                                        </span>
                                                        <div className="flex items-center gap-2 font-mono">
                                                            <span className="text-purple-700 dark:text-purple-300 font-bold">{pct}%</span>
                                                            <span className="text-[10px] text-stone-500">({opt.votes})</span>
                                                        </div>
                                                    </div>

                                                    {opt.voters.length > 0 && (
                                                        <div className="relative z-10 text-[10px] text-stone-500 dark:text-stone-400 mt-1">
                                                            Voted by: {opt.voters.join(', ')}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ========================================================= */}
                {/* SECTION 2: SHARED PACKING & DUTY CHECKLIST                 */}
                {/* ========================================================= */}
                <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-sm space-y-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                                <Luggage className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-display font-bold text-base text-stone-900 dark:text-white">
                                    Shared Expedition Checklist
                                </h3>
                                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                                    {completedCount} of {checklist.length} items verified & packed
                                </p>
                            </div>
                        </div>

                        <span className="text-xs font-mono text-emerald-800 dark:text-emerald-300 font-bold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                            {progressPercent}% Complete
                        </span>
                    </div>

                    {/* ADD CHECKLIST ITEM FORM */}
                    <form onSubmit={handleAddChecklistItem} className="flex gap-2">
                        <input
                            type="text"
                            value={newItemText}
                            onChange={(e) => setNewItemText(e.target.value)}
                            placeholder="Add item (e.g. Ooty Chocolate Box gift list, umbrella)..."
                            className="flex-1 px-3 py-2 bg-[#FAF7F0] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
                        />
                        <select
                            value={newAssignee}
                            onChange={(e) => setNewAssignee(e.target.value)}
                            className="px-2 py-2 bg-[#FAF7F0] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-800 dark:text-stone-200 focus:outline-none focus:border-emerald-500"
                        >
                            <option value="All Members">All Members</option>
                            <option value="Kavitha Ramachandran">Kavitha</option>
                            <option value="Dinesh Kumar">Dinesh</option>
                            <option value="Vijay Sundaram">Vijay</option>
                            <option value="Priya Mani">Priya</option>
                        </select>
                        <button
                            type="submit"
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" />
                            Add
                        </button>
                    </form>

                    {/* CHECKLIST ITEMS */}
                    <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                        {checklist.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => toggleChecklistItem(item.id)}
                                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                    item.completed
                                        ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-stone-500 dark:text-stone-400'
                                        : 'bg-[#FAF7F0] dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white hover:border-emerald-400'
                                }`}
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    {item.completed ? (
                                        <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    ) : (
                                        <Square className="w-4 h-4 text-stone-400 shrink-0" />
                                    )}
                                    <span className={`text-xs ${item.completed ? 'line-through text-stone-500 dark:text-stone-400' : 'font-medium text-stone-900 dark:text-white'}`}>
                                        {item.text}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 whitespace-nowrap shadow-sm">
                                        👤 {item.assignedTo}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                             e.stopPropagation();
                                             setChecklist(checklist.filter((i) => i.id !== item.id));
                                        }}
                                        className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

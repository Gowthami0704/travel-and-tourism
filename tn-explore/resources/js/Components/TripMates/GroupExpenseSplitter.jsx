import React, { useState } from 'react';
import { 
    Calculator, 
    DollarSign, 
    Plus, 
    Trash2, 
    CheckCircle2, 
    ArrowRight, 
    Users, 
    QrCode, 
    Copy, 
    Check, 
    Sparkles,
    CreditCard,
    Car,
    Hotel,
    Utensils,
    Ticket,
    Compass
} from 'lucide-react';

export default function GroupExpenseSplitter({ trip, members = [] }) {
    // Default group members if none passed
    const defaultMembers = [
        trip?.creatorName || 'Sundaram Pandian',
        'Kavitha Ramachandran',
        'Praveen Kumar',
        'Arunachalam S'
    ];
    const groupMembers = members.length > 0 ? members : defaultMembers;

    const [expenses, setExpenses] = useState([
        { id: 1, title: 'Outstation AC Cab & Fuel', amount: 3600, paidBy: groupMembers[0], category: 'transit', date: 'Day 1' },
        { id: 2, title: 'Heritage Homestay Rooms (2 Nights)', amount: 4800, paidBy: groupMembers[1], category: 'stay', date: 'Day 1' },
        { id: 3, title: 'Madurai Night Food Trail & Jigarthanda', amount: 1400, paidBy: groupMembers[0], category: 'food', date: 'Day 2' },
        { id: 4, title: 'Licensed Historian Guide Fee', amount: 1200, paidBy: groupMembers[2], category: 'guide', date: 'Day 2' },
    ]);

    const [newTitle, setNewTitle] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [newPaidBy, setNewPaidBy] = useState(groupMembers[0]);
    const [newCategory, setNewCategory] = useState('transit');
    const [copiedUpi, setCopiedUpi] = useState(false);
    const [showUpiModal, setShowUpiModal] = useState(null);

    // Calculate totals
    const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const perPersonShare = Math.round(totalSpent / groupMembers.length);

    // Calculate who paid how much
    const memberPaidTotals = {};
    groupMembers.forEach(m => { memberPaidTotals[m] = 0; });
    expenses.forEach(e => {
        if (memberPaidTotals[e.paidBy] !== undefined) {
            memberPaidTotals[e.paidBy] += e.amount;
        } else {
            memberPaidTotals[e.paidBy] = e.amount;
        }
    });

    // Calculate net balances (+ means should receive, - means owes)
    const balances = {};
    groupMembers.forEach(m => {
        balances[m] = (memberPaidTotals[m] || 0) - perPersonShare;
    });

    // Simplify debts into settlement list
    const settlements = [];
    const debtors = [];
    const creditors = [];

    Object.entries(balances).forEach(([person, balance]) => {
        if (balance < -1) debtors.push({ person, owes: -balance });
        else if (balance > 1) creditors.push({ person, gets: balance });
    });

    debtors.forEach(d => {
        creditors.forEach(c => {
            if (d.owes > 0 && c.gets > 0) {
                const settleAmount = Math.min(d.owes, c.gets);
                settlements.push({
                    from: d.person,
                    to: c.person,
                    amount: Math.round(settleAmount)
                });
                d.owes -= settleAmount;
                c.gets -= settleAmount;
            }
        });
    });

    const handleAddExpense = (e) => {
        e.preventDefault();
        if (!newTitle.trim() || !newAmount || Number(newAmount) <= 0) return;

        setExpenses(prev => [
            ...prev,
            {
                id: Date.now(),
                title: newTitle,
                amount: Number(newAmount),
                paidBy: newPaidBy,
                category: newCategory,
                date: 'Just now'
            }
        ]);

        setNewTitle('');
        setNewAmount('');
    };

    const handleDeleteExpense = (id) => {
        setExpenses(prev => prev.filter(e => e.id !== id));
    };

    const handleCopyUpi = (upiId) => {
        navigator.clipboard.writeText(upiId);
        setCopiedUpi(true);
        setTimeout(() => setCopiedUpi(false), 2000);
    };

    const getCategoryIcon = (cat) => {
        if (cat === 'transit') return <Car className="w-4 h-4 text-purple-400" />;
        if (cat === 'stay') return <Hotel className="w-4 h-4 text-cyan-400" />;
        if (cat === 'food') return <Utensils className="w-4 h-4 text-emerald-400" />;
        if (cat === 'guide') return <Compass className="w-4 h-4 text-gold" />;
        return <Ticket className="w-4 h-4 text-pink-400" />;
    };

    return (
        <div className="space-y-6">
            {/* Header & Overview Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Group Spend */}
                <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider block">Total Group Expenses</span>
                        <div className="text-2xl font-black text-stone-900 dark:text-white font-mono mt-1">₹{totalSpent.toLocaleString('en-IN')}</div>
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5 block">{expenses.length} Split Items Logged</span>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                        <DollarSign className="w-5 h-5" />
                    </div>
                </div>

                {/* Per Person Fair Share */}
                <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider block">Equal Per Person Share</span>
                        <div className="text-2xl font-black text-amber-700 dark:text-amber-400 font-mono mt-1">₹{perPersonShare.toLocaleString('en-IN')}</div>
                        <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 block">Split across {groupMembers.length} Travelers</span>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                        <Users className="w-5 h-5" />
                    </div>
                </div>

                {/* Settlements Pending */}
                <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider block">Settlements Pending</span>
                        <div className="text-2xl font-black text-cyan-700 dark:text-cyan-400 mt-1">{settlements.length} Transfers</div>
                        <span className="text-[11px] text-cyan-700 dark:text-cyan-300 mt-0.5 block font-medium">Instant UPI QR Settlement</span>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400 flex items-center justify-center">
                        <CreditCard className="w-5 h-5" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT: Expense Log & Add Form (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                    {/* Add Expense Form */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-sm space-y-3">
                        <h4 className="font-bold text-xs uppercase text-amber-700 dark:text-amber-400 tracking-wider flex items-center gap-1.5">
                            <Plus className="w-4 h-4" />
                            <span>Log Group Expense</span>
                        </h4>

                        <form onSubmit={handleAddExpense} className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-semibold text-stone-600 dark:text-stone-400 mb-1">Expense Description</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Ooty Toy Train Tickets, Fuel..."
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        className="w-full px-3 py-2 bg-[#FAF7F0] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-stone-600 dark:text-stone-400 mb-1">Total Amount (₹)</label>
                                    <input
                                        type="number"
                                        placeholder="1500"
                                        value={newAmount}
                                        onChange={(e) => setNewAmount(e.target.value)}
                                        className="w-full px-3 py-2 bg-[#FAF7F0] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:bg-white font-mono"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-semibold text-stone-600 dark:text-stone-400 mb-1">Paid by</label>
                                    <select
                                        value={newPaidBy}
                                        onChange={(e) => setNewPaidBy(e.target.value)}
                                        className="w-full px-3 py-2 bg-[#FAF7F0] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                                    >
                                        {groupMembers.map((m, idx) => (
                                            <option key={idx} value={m} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-white">{m}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-semibold text-stone-600 dark:text-stone-400 mb-1">Category</label>
                                    <select
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        className="w-full px-3 py-2 bg-[#FAF7F0] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                                    >
                                        <option value="transit">🚗 Transport / Fuel / Cab</option>
                                        <option value="stay">🏨 Hotel / Homestay</option>
                                        <option value="food">🍲 Food / Snacks / Drinks</option>
                                        <option value="guide">🧭 Licensed Guide Fee</option>
                                        <option value="pass">🎟️ Sightseeing Entry Passes</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01] active:scale-95 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Split With Group</span>
                            </button>
                        </form>
                    </div>

                    {/* Expenses History List */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-xs uppercase text-stone-900 dark:text-white tracking-wider flex items-center gap-1.5">
                                <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span>Itemized Group Bills ({expenses.length})</span>
                            </h4>
                            <span className="text-[10px] text-stone-500 font-mono">Split Equally</span>
                        </div>

                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                            {expenses.map((exp) => (
                                <div
                                    key={exp.id}
                                    className="p-3 rounded-xl bg-[#FAF7F0] dark:bg-stone-800/60 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 transition-all flex items-center justify-between gap-3 group"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-xl bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                                            {getCategoryIcon(exp.category)}
                                        </div>
                                        <div className="min-w-0">
                                            <h5 className="text-xs font-bold text-stone-900 dark:text-white truncate max-w-[200px]">{exp.title}</h5>
                                            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                                                Paid by <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{exp.paidBy}</span> • {exp.date}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <span className="text-sm font-black text-stone-900 dark:text-white font-mono block">₹{exp.amount.toLocaleString('en-IN')}</span>
                                            <span className="text-[9px] text-stone-500 dark:text-stone-400">₹{Math.round(exp.amount / groupMembers.length)} / pax</span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleDeleteExpense(exp.id)}
                                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                            title="Delete expense"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Live Settlement Matrix & UPI QR (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                    {/* Individual Spending Breakdown */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-sm space-y-3">
                        <h4 className="font-bold text-xs uppercase text-stone-900 dark:text-white tracking-wider flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <span>Member Spending Balance</span>
                        </h4>

                        <div className="space-y-2">
                            {groupMembers.map((member, idx) => {
                                const paid = memberPaidTotals[member] || 0;
                                const balance = balances[member] || 0;
                                return (
                                    <div key={idx} className="p-2.5 rounded-xl bg-[#FAF7F0] dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-center justify-between text-xs">
                                        <div>
                                            <span className="font-bold text-stone-900 dark:text-white block">{member}</span>
                                            <span className="text-[10px] text-stone-500 dark:text-stone-400">Total Paid: ₹{paid.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="text-right">
                                            {balance >= 0 ? (
                                                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                                                    Gets back ₹{Math.round(balance).toLocaleString('en-IN')}
                                                </span>
                                            ) : (
                                                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 font-mono">
                                                    Owes ₹{Math.abs(Math.round(balance)).toLocaleString('en-IN')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Optimal Settlement Transfers */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-cyan-300 dark:border-cyan-800 shadow-md space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-xs uppercase text-cyan-800 dark:text-cyan-300 tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400 animate-pulse" />
                                <span>Suggested Transfers</span>
                            </h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 font-bold border border-cyan-200 dark:border-cyan-800">
                                0-Fee UPI
                            </span>
                        </div>

                        {settlements.length === 0 ? (
                            <div className="py-6 text-center text-xs text-stone-500 space-y-1">
                                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto" />
                                <p className="font-bold text-stone-900 dark:text-white">All balances are settled!</p>
                                <p className="text-[10px] text-stone-400">Every traveler has contributed equally.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {settlements.map((s, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3 rounded-xl bg-[#FAF7F0] dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 hover:border-cyan-400 transition-all flex items-center justify-between gap-2"
                                    >
                                        <div className="text-xs min-w-0">
                                            <div className="flex items-center gap-1.5 text-stone-800 dark:text-stone-200">
                                                <strong className="text-stone-900 dark:text-white truncate">{s.from}</strong>
                                                <ArrowRight className="w-3 h-3 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                                                <strong className="text-emerald-700 dark:text-emerald-300 truncate">{s.to}</strong>
                                            </div>
                                            <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono mt-0.5 block">
                                                Direct GPay / PhonePe / Paytm
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="font-mono font-black text-sm text-cyan-700 dark:text-cyan-400">
                                                ₹{s.amount.toLocaleString('en-IN')}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setShowUpiModal(s)}
                                                className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all hover:scale-105 shadow-sm"
                                            >
                                                <QrCode className="w-3 h-3" />
                                                <span>Pay</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* UPI QR Code Modal */}
            {showUpiModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="relative w-full max-w-sm bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-3xl shadow-2xl p-6 text-stone-900 dark:text-white text-center space-y-4">
                        <button
                            type="button"
                            onClick={() => setShowUpiModal(null)}
                            className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 dark:hover:text-white cursor-pointer"
                        >
                            ✕
                        </button>

                        <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 flex items-center justify-center mx-auto border border-cyan-200 dark:border-cyan-800 shadow-sm">
                            <QrCode className="w-6 h-6" />
                        </div>

                        <div>
                            <h3 className="text-base font-bold text-stone-900 dark:text-white">Instant UPI Settlement</h3>
                            <p className="text-xs text-stone-500 dark:text-stone-300 mt-0.5">
                                <strong>{showUpiModal.from}</strong> paying <strong>{showUpiModal.to}</strong>
                            </p>
                        </div>

                        {/* Amount Box */}
                        <div className="p-3 rounded-2xl bg-[#FAF7F0] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-mono text-2xl font-black text-emerald-700 dark:text-emerald-400">
                            ₹{showUpiModal.amount.toLocaleString('en-IN')}
                        </div>

                        {/* Simulated QR Code for Demo */}
                        <div className="p-3 bg-white border border-stone-200 rounded-2xl w-44 h-44 mx-auto flex items-center justify-center shadow-md">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=upi://pay?pa=tnexplore.${showUpiModal.to.toLowerCase().replace(/\s+/g, '')}@okaxis&pn=${encodeURIComponent(showUpiModal.to)}&am=${showUpiModal.amount}&cu=INR`}
                                alt="UPI QR Code"
                                className="w-full h-full object-contain"
                            />
                        </div>

                        <div className="flex items-center justify-center gap-2">
                            <span className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                                tnexplore.{showUpiModal.to.toLowerCase().replace(/\s+/g, '')}@okaxis
                            </span>
                            <button
                                type="button"
                                onClick={() => handleCopyUpi(`tnexplore.${showUpiModal.to.toLowerCase().replace(/\s+/g, '')}@okaxis`)}
                                className="text-xs text-amber-700 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-0.5 font-bold"
                            >
                                {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowUpiModal(null)}
                            className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 cursor-pointer transition-all"
                        >
                            Done / Marked as Paid
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

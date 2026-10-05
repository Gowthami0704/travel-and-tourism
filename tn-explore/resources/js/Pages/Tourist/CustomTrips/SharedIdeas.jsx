import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/UI/Button';
import axios from 'axios';
import {
    Sparkles,
    Users,
    IndianRupee,
    Heart,
    ThumbsUp,
    Calendar,
    Car,
    CheckCircle2,
    Share2,
    ArrowRight,
    MapPin
} from 'lucide-react';

export default function SharedIdeas({ session, token }) {
    const [votes, setVotes] = useState(session.votes || {});
    const [userVoted, setUserVoted] = useState({});
    const [copied, setCopied] = useState(false);

    const ideas = session.ideas || [];
    const pax = session.pax || 2;
    const totalBudget = session.budget || 25000;
    const createdBy = session.createdBy || 'Traveler';

    const handleVote = async (ideaId) => {
        if (userVoted[ideaId]) return;
        try {
            const res = await axios.post(`/custom-trips/ideas/shared/${token}/vote`, {
                idea_id: ideaId,
            });
            if (res.data.success) {
                setVotes(res.data.votes);
                setUserVoted(prev => ({ ...prev, [ideaId]: true }));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleCopyShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Trip Ideas Shared by ${createdBy}`} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Hero Top Card */}
                <div className="p-6 sm:p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#8B1E2D]/10 text-[#8B1E2D] dark:text-[#E7A8AF] mb-3">
                            <Users className="w-3.5 h-3.5" />
                            <span>Trip Mates Group Collaboration</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-serif font-black text-[var(--text)] tracking-tight">
                            Trip Ideas for {pax} Travelers
                        </h1>
                        <p className="text-sm text-[var(--muted)] mt-1">
                            Shared by <strong className="text-[var(--text)]">{createdBy}</strong> · Target Group Budget: ₹{Number(totalBudget).toLocaleString('en-IN')} (₹{Math.round(totalBudget / pax).toLocaleString('en-IN')}/person)
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="secondary"
                            onClick={handleCopyShare}
                            className="gap-2"
                        >
                            <Share2 className="w-4 h-4" />
                            <span>{copied ? 'Link Copied!' : 'Copy Share Link'}</span>
                        </Button>
                        <Link href="/custom-trips/create">
                            <Button variant="primary">
                                Plan New Trip
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Ideas Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {ideas.map((idea) => {
                        const ideaVotes = votes[idea.id] || 0;
                        const hasVoted = userVoted[idea.id];
                        const perPersonCost = Math.round(idea.cost_total / pax);

                        return (
                            <div
                                key={idea.id}
                                className="rounded-3xl bg-[var(--card)] border border-[var(--border)] p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-6"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-[var(--text)] border border-[var(--border)]">
                                                {idea.days} Days Tour
                                            </span>
                                            <h3 className="text-xl font-serif font-black text-[var(--text)] mt-2">
                                                {idea.title}
                                            </h3>
                                            <p className="text-xs text-[var(--muted)] font-medium">
                                                {idea.destination}
                                            </p>
                                        </div>

                                        {/* Voting Button */}
                                        <button
                                            type="button"
                                            onClick={() => handleVote(idea.id)}
                                            className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-1 cursor-pointer ${
                                                hasVoted 
                                                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-[#8B1E2D] dark:text-[#E7A8AF]'
                                                    : 'bg-[var(--bg)] border-[var(--border)] text-[var(--muted)] hover:text-[#8B1E2D] hover:border-[#8B1E2D]/40'
                                            }`}
                                            title="Vote for this circuit"
                                        >
                                            <Heart className={`w-5 h-5 ${hasVoted ? 'fill-current' : ''}`} />
                                            <span className="text-xs font-bold">{ideaVotes}</span>
                                        </button>
                                    </div>

                                    {/* Why it fits */}
                                    <div className="p-3.5 rounded-2xl bg-[#8B1E2D]/5 dark:bg-[#8B1E2D]/10 border border-[#8B1E2D]/20 text-xs text-[var(--text)] leading-relaxed flex items-start gap-2.5">
                                        <Sparkles className="w-4 h-4 text-[#8B1E2D] dark:text-[#E7A8AF] flex-shrink-0 mt-0.5" />
                                        <span>{idea.why_it_fits}</span>
                                    </div>

                                    {/* Highlights */}
                                    <div className="text-xs text-[var(--muted)] leading-relaxed">
                                        <strong className="text-[var(--text)] font-semibold">Highlights: </strong>
                                        {idea.highlights}
                                    </div>
                                </div>

                                {/* Per-Person Cost Breakdown & Action */}
                                <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between gap-4">
                                    <div>
                                        <div className="text-xs text-[var(--muted)]">Cost per person</div>
                                        <div className="text-xl font-black text-[var(--text)]">
                                            ₹{Number(perPersonCost).toLocaleString('en-IN')}
                                            <span className="text-xs font-normal text-[var(--muted)] ml-1">
                                                (₹{Number(idea.cost_total).toLocaleString('en-IN')} total for {pax})
                                            </span>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/custom-trips/create?circuit=${idea.id}&adults=${pax}&days=${idea.days}`}
                                    >
                                        <Button variant="primary" size="sm" className="gap-1.5">
                                            <span>Customize Plan</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

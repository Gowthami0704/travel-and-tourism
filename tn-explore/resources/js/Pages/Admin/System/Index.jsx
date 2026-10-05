import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Button from '@/Components/UI/Button';
import {
    Server,
    Database,
    Cpu,
    Bot,
    Mail,
    HardDrive,
    ShieldCheck,
    RefreshCw,
    Download,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Layers
} from 'lucide-react';

export default function SystemIndex({ metrics }) {
    const [isBackingUp, setIsBackingUp] = useState(false);

    const handleBackup = () => {
        setIsBackingUp(true);
        router.post(route('admin.system.backup'), {}, {
            preserveScroll: true,
            onFinish: () => setIsBackingUp(false),
        });
    };

    return (
        <AdminLayout>
            <Head title="Lab LAN Server Operations & System Health" />

            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 mb-2">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>100% Air-Gapped Offline Lab Ready</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-serif font-black text-[var(--text)] tracking-tight">
                            Lab LAN Server Operations & Health
                        </h1>
                        <p className="text-xs text-[var(--muted)] mt-1">
                            Monitors local services, database latency, local Ollama inference, and email inbox status for multi-user lab deployments.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="primary"
                            size="sm"
                            disabled={isBackingUp}
                            onClick={handleBackup}
                            className="gap-2"
                        >
                            <Download className="w-4 h-4" />
                            <span>{isBackingUp ? 'Creating Backup...' : 'Create DB Backup'}</span>
                        </Button>
                    </div>
                </div>

                {/* Core Status Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Database Health */}
                    <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[var(--muted)] uppercase">MySQL Database</span>
                            <span className={`p-1.5 rounded-lg ${metrics.db_status === 'healthy' ? 'bg-teal-500/10 text-teal-600' : 'bg-rose-500/10 text-rose-600'}`}>
                                <Database className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="text-2xl font-black text-[var(--text)]">
                            {metrics.db_latency_ms} <span className="text-xs font-normal text-[var(--muted)]">ms query</span>
                        </div>
                        <div className="text-xs text-[var(--muted)] flex items-center justify-between pt-1 border-t border-[var(--border)]">
                            <span>Storage size:</span>
                            <strong className="text-[var(--text)]">{metrics.db_size_mb} MB</strong>
                        </div>
                    </div>

                    {/* Local FastAPI AI Service */}
                    <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[var(--muted)] uppercase">FastAPI Service</span>
                            <span className={`p-1.5 rounded-lg ${metrics.ai_status === 'running' ? 'bg-teal-500/10 text-teal-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                <Cpu className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="text-2xl font-black text-[var(--text)]">
                            {metrics.ai_status === 'running' ? `${metrics.ai_latency_ms} ms` : 'Standby'}
                        </div>
                        <div className="text-xs text-[var(--muted)] flex items-center justify-between pt-1 border-t border-[var(--border)]">
                            <span>Isolation Forest:</span>
                            <strong className="text-teal-600 dark:text-teal-400">Active</strong>
                        </div>
                    </div>

                    {/* Local Ollama Server */}
                    <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[var(--muted)] uppercase">Ollama Inference</span>
                            <span className={`p-1.5 rounded-lg ${metrics.ollama_status === 'running' ? 'bg-teal-500/10 text-teal-600' : 'bg-stone-500/10 text-stone-600'}`}>
                                <Bot className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="text-2xl font-black text-[var(--text)]">
                            {metrics.ollama_status === 'running' ? 'Ready' : 'Offline'}
                        </div>
                        <div className="text-xs text-[var(--muted)] flex items-center justify-between pt-1 border-t border-[var(--border)] truncate">
                            <span>Models:</span>
                            <strong className="text-[var(--text)] truncate max-w-[120px]">
                                {metrics.ollama_models.join(', ') || 'Fallback Templates'}
                            </strong>
                        </div>
                    </div>

                    {/* Mailpit SMTP Inbox */}
                    <div className="p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[var(--muted)] uppercase">Local Mailpit (OTP)</span>
                            <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600">
                                <Mail className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="text-2xl font-black text-[var(--text)]">
                            Port 8025
                        </div>
                        <div className="text-xs text-[var(--muted)] flex items-center justify-between pt-1 border-t border-[var(--border)]">
                            <span>6-Digit Codes:</span>
                            <a
                                href="http://127.0.0.1:8025"
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#8B1E2D] dark:text-[#E7A8AF] font-bold hover:underline"
                            >
                                Open Web Inbox →
                            </a>
                        </div>
                    </div>
                </div>

                {/* Hardware, Memory & Storage Detail */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Server Environment */}
                    <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm space-y-4">
                        <h3 className="text-base font-serif font-bold text-[var(--text)] flex items-center gap-2">
                            <Server className="w-4 h-4 text-[#8B1E2D]" />
                            <span>Server & Runtime Environment</span>
                        </h3>
                        <div className="divide-y divide-[var(--border)] text-xs">
                            <div className="py-2.5 flex items-center justify-between">
                                <span className="text-[var(--muted)]">PHP Version</span>
                                <span className="font-mono font-bold text-[var(--text)]">{metrics.php_version}</span>
                            </div>
                            <div className="py-2.5 flex items-center justify-between">
                                <span className="text-[var(--muted)]">Laravel Version</span>
                                <span className="font-mono font-bold text-[var(--text)]">{metrics.laravel_version}</span>
                            </div>
                            <div className="py-2.5 flex items-center justify-between">
                                <span className="text-[var(--muted)]">Air-Gapped Isolation</span>
                                <span className="px-2.5 py-0.5 rounded-full font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300">
                                    {metrics.offline_mode ? 'Strict Air-Gapped' : 'Standard'}
                                </span>
                            </div>
                            <div className="py-2.5 flex items-center justify-between">
                                <span className="text-[var(--muted)]">Server Clock</span>
                                <span className="font-mono font-bold text-[var(--text)]">{metrics.server_time}</span>
                            </div>
                        </div>
                    </div>

                    {/* Disk & Queue Backlog */}
                    <div className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm space-y-4">
                        <h3 className="text-base font-serif font-bold text-[var(--text)] flex items-center gap-2">
                            <HardDrive className="w-4 h-4 text-[#8B1E2D]" />
                            <span>Storage & Worker Backlog</span>
                        </h3>
                        <div className="divide-y divide-[var(--border)] text-xs">
                            <div className="py-2.5 flex items-center justify-between">
                                <span className="text-[var(--muted)]">Free Disk Space</span>
                                <span className="font-mono font-bold text-[var(--text)]">{metrics.disk_free_gb} GB / {metrics.disk_total_gb} GB</span>
                            </div>
                            <div className="py-2.5 flex items-center justify-between">
                                <span className="text-[var(--muted)]">PHP Memory Allocated</span>
                                <span className="font-mono font-bold text-[var(--text)]">{metrics.memory_usage_mb} MB</span>
                            </div>
                            <div className="py-2.5 flex items-center justify-between">
                                <span className="text-[var(--muted)]">Async Queue Worker Backlog</span>
                                <span className="font-mono font-bold text-teal-600">{metrics.queue_backlog} jobs pending</span>
                            </div>
                            <div className="py-2.5 flex items-center justify-between">
                                <span className="text-[var(--muted)]">Audit Log Status</span>
                                <span className="font-bold text-teal-600">Logging all security events</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

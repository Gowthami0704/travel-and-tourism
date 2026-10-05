import React, { useState, useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    KeyRound,
    Mail,
    Lock,
    ShieldCheck,
    ArrowRight,
    CheckCircle2,
    RefreshCw,
    Clock,
    AlertCircle,
    Eye,
    EyeOff,
    Check,
    Sparkles,
    Shield
} from 'lucide-react';

export default function ForgotPassword({ status, devCode = null, portal = 'tourist', initialEmail = '', isLocal = false }) {
    const [step, setStep] = useState(1); // 1: Email, 2: 6-Digit Code, 3: New Password
    const [email, setEmail] = useState(initialEmail);
    const [code, setCode] = useState(devCode || '');
    const [resetToken, setResetToken] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState('');
    const [successMessage, setSuccessMessage] = useState(status || '');
    const [showPassword, setShowPassword] = useState(false);
    const [localDevCode, setLocalDevCode] = useState(devCode);

    // Step 3 Form (New Password)
    const { data: passData, setData: setPassData, post: postReset, processing: passProcessing, errors: passErrors, reset: resetPass } = useForm({
        email: '',
        token: '',
        password: '',
        password_confirmation: '',
        portal: portal,
    });

    // Resend countdown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const portalConfig = {
        admin: {
            title: 'Admin Password Recovery',
            subtitle: 'State Administration Portal Security Gateway',
            loginRoute: 'admin.login',
            loginLabel: 'Back to Admin Sign In',
            badge: 'Admin Access',
            themeColor: 'amber',
        },
        vendor: {
            title: 'Partner Password Recovery',
            subtitle: 'Vendor Partner Hub Security Gateway',
            loginRoute: 'vendor.login',
            loginLabel: 'Back to Partner Sign In',
            badge: 'Vendor Partner',
            themeColor: 'orange',
        },
        tourist: {
            title: 'Account Password Recovery',
            subtitle: 'Tourist & Traveler Account Security Gateway',
            loginRoute: 'login',
            loginLabel: 'Back to Tourist Sign In',
            badge: 'Tourist Portal',
            themeColor: 'teal',
        },
    }[portal] || {
        title: 'Password Recovery',
        subtitle: 'Secure Account Verification',
        loginRoute: 'login',
        loginLabel: 'Back to Sign In',
        badge: 'Account Recovery',
        themeColor: 'amber',
    };

    // Step 1: Send 6-digit Code
    const handleSendCode = async (e) => {
        if (e) e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);
        setApiError('');

        try {
            const response = await fetch(route('password.send-code'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': getCsrfCookie(),
                },
                body: JSON.stringify({ email, portal }),
            });

            const result = await response.json();
            if (response.ok && result.success) {
                setSuccessMessage(result.message);
                if (result.dev_code) {
                    setLocalDevCode(result.dev_code);
                    setCode(result.dev_code);
                }
                setResendCooldown(result.resend_wait_seconds || 60);
                setStep(2);
            } else {
                setApiError(result.message || result.errors?.email?.[0] || 'Unable to send verification code. Please try again.');
            }
        } catch (err) {
            setApiError('Network connection error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Step 2: Verify 6-digit Code
    const handleVerifyCode = async (e) => {
        if (e) e.preventDefault();
        if (code.length !== 6) {
            setApiError('Please enter the full 6-digit verification code.');
            return;
        }

        setIsSubmitting(true);
        setApiError('');

        try {
            const response = await fetch(route('password.verify-code'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': getCsrfCookie(),
                },
                body: JSON.stringify({ email, code, portal }),
            });

            const result = await response.json();
            if (response.ok && result.success) {
                setResetToken(result.reset_token);
                setPassData({
                    ...passData,
                    email: email,
                    token: result.reset_token,
                    portal: portal,
                });
                setSuccessMessage('Code verified successfully! Please set your new password below.');
                setStep(3);
            } else {
                setApiError(result.message || result.errors?.code?.[0] || 'Invalid verification code.');
            }
        } catch (err) {
            setApiError('Verification error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Step 3: Submit New Password
    const handleResetPassword = (e) => {
        e.preventDefault();
        postReset(route('password.reset-password'), {
            onFinish: () => resetPass('password', 'password_confirmation'),
        });
    };

    function getCsrfCookie() {
        const match = document.cookie.match(new RegExp('(^|;\\s*)(XSRF-TOKEN=)([^;]*)'));
        return match ? decodeURIComponent(match[3]) : '';
    }

    return (
        <GuestLayout
            title={portalConfig.title}
            subtitle={portalConfig.subtitle}
        >
            <Head title={`Password Reset — ${portalConfig.title}`} />

            {/* Stepper Progress Header */}
            <div className="mb-6 p-3 rounded-2xl bg-stone-100 dark:bg-slate-900 border border-stone-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-stone-600 dark:text-stone-400">
                    <span className={`flex items-center gap-1.5 ${step >= 1 ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-amber-500 text-stone-950 font-black' : 'bg-stone-300 dark:bg-slate-700'}`}>
                            1
                        </span>
                        <span>Email</span>
                    </span>
                    <div className="h-px bg-stone-300 dark:bg-slate-700 flex-1 mx-2" />
                    <span className={`flex items-center gap-1.5 ${step >= 2 ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-amber-500 text-stone-950 font-black' : 'bg-stone-300 dark:bg-slate-700'}`}>
                            2
                        </span>
                        <span>6-Digit Code</span>
                    </span>
                    <div className="h-px bg-stone-300 dark:bg-slate-700 flex-1 mx-2" />
                    <span className={`flex items-center gap-1.5 ${step >= 3 ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-amber-500 text-stone-950 font-black' : 'bg-stone-300 dark:bg-slate-700'}`}>
                            3
                        </span>
                        <span>New Password</span>
                    </span>
                </div>
            </div>

            {/* Status & Alerts */}
            {successMessage && (
                <div className="mb-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>{successMessage}</span>
                </div>
            )}

            {apiError && (
                <div className="mb-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 p-3.5 text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-2.5">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{apiError}</span>
                </div>
            )}

            {/* Local Dev Helper Notice */}
            {isLocal && localDevCode && (
                <div className="mb-5 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-xs text-amber-900 dark:text-amber-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-mono">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <strong>Dev Mode Code:</strong> <code className="bg-amber-200 dark:bg-amber-900 px-2 py-0.5 rounded font-black text-amber-950 dark:text-white text-sm tracking-widest">{localDevCode}</code>
                    </span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400">(Logged to storage/logs)</span>
                </div>
            )}

            {/* STEP 1: ENTER EMAIL */}
            {step === 1 && (
                <form onSubmit={handleSendCode} className="space-y-4">
                    <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                        Enter your registered email address below. We will send you a secure <strong>6-digit verification code</strong> (valid for 10 minutes).
                    </p>

                    <div>
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                            Registered Email Address *
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                                <Mail className="w-4 h-4" />
                            </div>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                placeholder="your.email@example.com"
                                required
                                autoFocus
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-stone-300 dark:border-slate-700 rounded-xl text-sm text-stone-900 dark:text-white placeholder-stone-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !email}
                        className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                        <span>{isSubmitting ? 'Sending Verification Code...' : 'Send 6-Digit Code →'}</span>
                    </button>
                </form>
            )}

            {/* STEP 2: ENTER 6-DIGIT CODE */}
            {step === 2 && (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 text-xs text-stone-600 dark:text-stone-400 flex items-center justify-between">
                        <div>
                            <span>Code sent to: </span>
                            <strong className="text-stone-900 dark:text-white">{email}</strong>
                        </div>
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-bold"
                        >
                            Change
                        </button>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                            Enter 6-Digit Verification Code *
                        </label>
                        <div className="relative">
                            <input
                                id="code"
                                type="text"
                                maxLength={6}
                                value={code}
                                placeholder="••••••"
                                required
                                autoFocus
                                className="w-full text-center text-2xl font-mono tracking-[0.5em] py-3 bg-white dark:bg-slate-950 border border-stone-300 dark:border-slate-700 rounded-xl text-stone-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all font-black"
                                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                            />
                        </div>
                        <span className="text-[10px] text-stone-500 mt-1 block">
                            Code expires in 10 minutes. Maximum 5 attempts allowed.
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                        {resendCooldown > 0 ? (
                            <span className="text-stone-500 flex items-center gap-1 font-mono">
                                <Clock className="w-3.5 h-3.5" />
                                Resend available in {resendCooldown}s
                            </span>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSendCode}
                                disabled={isSubmitting}
                                className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Resend New Code
                            </button>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || code.length !== 6}
                        className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                        <span>{isSubmitting ? 'Verifying Code...' : 'Verify Code & Proceed →'}</span>
                    </button>
                </form>
            )}

            {/* STEP 3: SET NEW PASSWORD */}
            {step === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                    <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                        Create a strong password with at least <strong>8 characters, letters and numbers</strong>.
                    </p>

                    <div>
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                            New Password *
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                                <Lock className="w-4 h-4" />
                            </div>
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={passData.password}
                                placeholder="••••••••"
                                required
                                autoFocus
                                className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-950 border border-stone-300 dark:border-slate-700 rounded-xl text-sm text-stone-900 dark:text-white placeholder-stone-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                onChange={(e) => setPassData('password', e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <InputError message={passErrors.password} className="mt-1" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
                            Confirm New Password *
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                                <Lock className="w-4 h-4" />
                            </div>
                            <input
                                id="password_confirmation"
                                type={showPassword ? 'text' : 'password'}
                                value={passData.password_confirmation}
                                placeholder="••••••••"
                                required
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-stone-300 dark:border-slate-700 rounded-xl text-sm text-stone-900 dark:text-white placeholder-stone-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                onChange={(e) => setPassData('password_confirmation', e.target.value)}
                            />
                        </div>
                        <InputError message={passErrors.password_confirmation} className="mt-1" />
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-[11px] text-amber-900 dark:text-amber-300 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>Resetting your password will log out all other active browser sessions for security.</span>
                    </div>

                    <button
                        type="submit"
                        disabled={passProcessing}
                        className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                        <KeyRound className="w-4 h-4" />
                        <span>{passProcessing ? 'Updating Password...' : 'Save New Password & Sign In →'}</span>
                    </button>
                </form>
            )}

            {/* Back to Portal Sign In */}
            <div className="mt-6 pt-4 border-t border-stone-200 dark:border-slate-800 text-center">
                <Link
                    href={route(portalConfig.loginRoute)}
                    className="text-xs text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 font-bold transition-colors inline-flex items-center gap-1"
                >
                    ← {portalConfig.loginLabel}
                </Link>
            </div>
        </GuestLayout>
    );
}

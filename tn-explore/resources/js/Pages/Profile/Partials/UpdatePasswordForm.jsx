import React, { useRef } from 'react';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { Lock, KeyRound, CheckCircle2 } from 'lucide-react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header className="border-b border-stone-200 dark:border-stone-800 pb-4 mb-6">
                <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 flex items-center justify-center text-amber-700 dark:text-amber-400">
                        <KeyRound className="w-4 h-4" />
                    </div>
                    <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                        Update Password
                    </h2>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                    Ensure your account is using a long, random password to stay secure across devices.
                </p>
            </header>

            <form onSubmit={updatePassword} className="space-y-5">
                <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                        Current Password
                    </label>
                    <div className="relative">
                        <Lock className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3.5 top-3" />
                        <input
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            type="password"
                            className="w-full bg-stone-50 dark:bg-stone-800/90 border border-stone-300 dark:border-stone-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all font-medium"
                            autoComplete="current-password"
                        />
                    </div>
                    {errors.current_password && (
                        <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400">{errors.current_password}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                            New Password
                        </label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3.5 top-3" />
                            <input
                                id="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                type="password"
                                className="w-full bg-stone-50 dark:bg-stone-800/90 border border-stone-300 dark:border-stone-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all font-medium"
                                autoComplete="new-password"
                            />
                        </div>
                        {errors.password && (
                            <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400">{errors.password}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3.5 top-3" />
                            <input
                                id="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                type="password"
                                className="w-full bg-stone-50 dark:bg-stone-800/90 border border-stone-300 dark:border-stone-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all font-medium"
                                autoComplete="new-password"
                            />
                        </div>
                        {errors.password_confirmation && (
                            <p className="mt-1.5 text-xs text-rose-500 dark:text-rose-400">{errors.password_confirmation}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-6 py-2.5 bg-gradient-to-r from-turmeric-600 to-amber-600 hover:from-turmeric-700 hover:to-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-turmeric-600/20 transition-all disabled:opacity-50 cursor-pointer"
                    >
                        {processing ? 'Updating...' : 'Update Password'}
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out duration-300"
                        leaveTo="opacity-0"
                    >
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            Password updated successfully.
                        </span>
                    </Transition>
                </div>
            </form>
        </section>
    );
}

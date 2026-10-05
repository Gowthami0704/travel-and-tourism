import React, { useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Trash2, AlertTriangle, X, Lock } from 'lucide-react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header className="border-b border-stone-200 dark:border-stone-800 pb-4">
                <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-900 flex items-center justify-center text-rose-700 dark:text-rose-400">
                        <Trash2 className="w-4 h-4" />
                    </div>
                    <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                        Delete Account
                    </h2>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                    Once your account is deleted, all of its active bookings, custom trip requests, proposals, and data will be permanently removed.
                </p>
            </header>

            <button
                type="button"
                onClick={confirmUserDeletion}
                className="px-5 py-2.5 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
                <Trash2 className="w-4 h-4" />
                <span>Delete My Account</span>
            </button>

            {/* Custom Modal */}
            {confirmingUserDeletion && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                            <h3 className="font-bold text-stone-900 dark:text-white text-base flex items-center gap-2 text-rose-600 dark:text-rose-400">
                                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                                Confirm Account Deletion
                            </h3>
                            <button
                                onClick={closeModal}
                                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                            Are you sure you want to delete your account? All active listings, customer bookings, proposals, and chats will be permanently wiped. Please enter your password to confirm.
                        </p>

                        <form onSubmit={deleteUser} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3.5 top-3" />
                                    <input
                                        id="delete_password"
                                        type="password"
                                        ref={passwordInput}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                                        placeholder="Enter your password..."
                                        required
                                        autoFocus
                                    />
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-xs text-rose-500 dark:text-rose-400">{errors.password}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold rounded-xl cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/20 disabled:opacity-50 cursor-pointer"
                                >
                                    {processing ? 'Deleting...' : 'Permanently Delete'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}

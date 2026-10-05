import React from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import VendorLayout from '@/Layouts/VendorLayout';
import AdminLayout from '@/Layouts/AdminLayout';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { 
    User, Store, Shield, ShieldCheck, Award, MapPin, 
    Calendar, Mail, Phone, ExternalLink 
} from 'lucide-react';

export default function Edit({ mustVerifyEmail, status }) {
    const { auth, vendor } = usePage().props;
    const user = auth?.user;
    const role = user?.role;

    const content = (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Role Header Banner */}
            <div className="bg-white dark:bg-stone-900 border border-[#E6D5B8] dark:border-stone-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950 text-maroon-900 dark:text-amber-400 border border-amber-300 dark:border-amber-800 flex items-center justify-center font-serif font-black text-2xl shadow-sm shrink-0">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100">
                                {user?.name}
                            </h1>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-peacock-100 dark:bg-teal-950 text-peacock-800 dark:text-teal-300 border border-peacock-300 dark:border-teal-800">
                                {role === 'vendor' ? 'Commercial Partner' : (role === 'admin' ? 'Super Admin' : 'Verified Traveler')}
                            </span>
                        </div>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                            {user?.email} • Account Member
                        </p>
                    </div>
                </div>

                {role === 'vendor' && vendor?.slug && (
                    <a
                        href={route('vendor.profile', vendor.slug)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-xl bg-amber-50 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-stone-800 dark:text-amber-300 border border-amber-200 dark:border-stone-700 font-bold text-xs flex items-center gap-2 transition-all self-start sm:self-auto"
                    >
                        <span>View Public Storefront</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                )}
            </div>

            {/* Profile Info Form Card */}
            <div className="bg-white dark:bg-stone-900 border border-[#E6D5B8] dark:border-stone-800 rounded-2xl p-6 sm:p-8 shadow-sm transition-colors">
                <UpdateProfileInformationForm
                    mustVerifyEmail={mustVerifyEmail}
                    status={status}
                />
            </div>

            {/* Password Form Card */}
            <div className="bg-white dark:bg-stone-900 border border-[#E6D5B8] dark:border-stone-800 rounded-2xl p-6 sm:p-8 shadow-sm transition-colors">
                <UpdatePasswordForm />
            </div>

            {/* Delete Account Card */}
            <div className="bg-white dark:bg-stone-900 border border-[#E6D5B8] dark:border-stone-800 rounded-2xl p-6 sm:p-8 shadow-sm transition-colors">
                <DeleteUserForm />
            </div>
        </div>
    );

    if (role === 'vendor') {
        return (
            <VendorLayout>
                <Head title="Business Profile & Security | Vendor Portal" />
                {content}
            </VendorLayout>
        );
    }

    if (role === 'admin') {
        return (
            <AdminLayout title="Administrator Profile" subtitle="Manage your administrative credentials">
                <Head title="Admin Profile & Security" />
                {content}
            </AdminLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title="My Profile Settings | TN Explore" />
            {content}
        </AuthenticatedLayout>
    );
}

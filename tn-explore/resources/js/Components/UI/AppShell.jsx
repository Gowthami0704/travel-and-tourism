import React from 'react';
import MainLayout from '@/Layouts/MainLayout';
import AdminLayout from '@/Layouts/AdminLayout';
import VendorLayout from '@/Layouts/VendorLayout';

/**
 * Universal Unified AppShell
 * Role: 'tourist' | 'vendor' | 'admin'
 */
export default function AppShell({ role = 'tourist', title, subtitle, children }) {
    if (role === 'admin') {
        return (
            <AdminLayout title={title} subtitle={subtitle}>
                {children}
            </AdminLayout>
        );
    }

    if (role === 'vendor') {
        return (
            <VendorLayout title={title}>
                {children}
            </VendorLayout>
        );
    }

    return (
        <MainLayout>
            {children}
        </MainLayout>
    );
}

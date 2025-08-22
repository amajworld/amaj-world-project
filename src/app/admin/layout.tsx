
'use client';

import AdminHeader from "./components/AdminHeader";
import AdminSidebar from "./components/AdminSidebar";
import React from 'react';

// This component is being removed as it causes a critical hydration error
// in the Vercel production environment due to incorrect environment variable handling.
// function AppModeWarning() { ... }

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 dark:bg-gray-800">
          <div className="container mx-auto px-6 py-8">
            {/* <AppModeWarning /> - Removed to fix production crash */}
            {children}
            </div>
        </main>
      </div>
    </div>
  );
}

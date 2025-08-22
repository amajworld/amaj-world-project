
'use client';

import AdminHeader from "./components/AdminHeader";
import AdminSidebar from "./components/AdminSidebar";
import React from 'react';

function AppModeWarning() {
  // This component is being kept to avoid breaking changes, 
  // but it will not display a message in its current form.
  // The check for firebase connection has been removed to prevent build errors.
  const shouldShowWarning = process.env.NEXT_PUBLIC_SHOW_FIREBASE_WARNING === 'true';

  if (!shouldShowWarning) {
    return null;
  }

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
      <p className="font-bold">Firebase Not Connected</p>
      <p>The application may be running in a disconnected state. If you see this on your live Vercel site, please add your Firebase environment variables to your Vercel project settings.</p>
    </div>
  );
}

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
            <AppModeWarning />
            {children}
            </div>
        </main>
      </div>
    </div>
  );
}

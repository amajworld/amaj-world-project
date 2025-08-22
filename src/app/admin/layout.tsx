
'use client';

import { isFirebaseConnected } from "@/lib/firebaseAdmin";
import AdminHeader from "./components/AdminHeader";
import AdminSidebar from "./components/AdminSidebar";

function AppModeWarning() {
  if (isFirebaseConnected) {
    return null;
  }

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
      <p className="font-bold">Firebase Not Connected</p>
      <p>The application is not connected to Firebase. Data will not be saved. Please ensure your Firebase environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) are correctly configured in your deployment settings.</p>
       <p className="mt-2 text-sm">To enable saving to the database on Vercel, you must add your Firebase environment variables to your Vercel project settings.</p>
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

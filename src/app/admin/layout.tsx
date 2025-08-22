
'use client';

import AdminHeader from "./components/AdminHeader";
import AdminSidebar from "./components/AdminSidebar";

function AppModeWarning() {
  const isFirebaseConnected = false; // Hardcoded to false as we are in local mode

  if (isFirebaseConnected) {
    return null;
  }

  return (
    <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6" role="alert">
      <p className="font-bold">Local File Mode</p>
      <p>The application is running in local file mode. Changes will be saved to local JSON files. To deploy changes, commit and sync them via the Source Control panel.</p>
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

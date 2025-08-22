
import { isFirebaseConnected } from "@/lib/firebaseAdmin";
import AdminHeader from "./components/AdminHeader";
import AdminSidebar from "./components/AdminSidebar";

function AppModeWarning() {
  if (isFirebaseConnected) {
    return null;
  }

  return (
    <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6" role="alert">
      <p className="font-bold">Local File Mode Activated</p>
      <p>The application is running in local file mode. All data (posts, settings, etc.) is being saved directly to JSON files inside your project's `src/data` directory. To deploy changes, you must use the Source Control panel to commit and sync your changes.</p>
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

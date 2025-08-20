
import { isFirebaseConnected } from "@/lib/firebaseAdmin";
import AdminHeader from "./components/AdminHeader";
import AdminSidebar from "./components/AdminSidebar";

function FirebaseWarning() {
  if (isFirebaseConnected) {
    return null;
  }

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
      <p className="font-bold">Firebase Not Connected</p>
      <p>The application is running in local mode. Posts are being saved to a temporary file. To enable saving to the database on Vercel, you must add your Firebase environment variables to your Vercel project settings.</p>
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
            <FirebaseWarning />
            {children}
            </div>
        </main>
      </div>
    </div>
  );
}

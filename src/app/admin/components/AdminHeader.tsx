
'use client';
import { Bell, User, Search, LogOut } from 'lucide-react';
import { signOutAction } from '@/app/actions/authActions';
import { useRouter } from 'next/navigation';

export default function AdminHeader() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOutAction();
    router.push('/login');
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b-4 border-indigo-600 dark:bg-gray-800 dark:border-indigo-500">
      <div className="flex items-center">
        <div className="relative">
          <input
            type="text"
            className="w-full py-2 pl-10 pr-4 text-gray-700 bg-white border rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:border-indigo-400 dark:focus:border-indigo-300 focus:ring-indigo-300 focus:ring-opacity-40 focus:outline-none focus:ring"
            placeholder="Search"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <button className="flex mx-4 text-gray-600 dark:text-gray-200 focus:outline-none">
          <Bell className="w-6 h-6" />
        </button>
        <button className="flex items-center mx-4 text-gray-600 dark:text-gray-200 focus:outline-none">
          <User className="w-6 h-6" />
        </button>
        <button onClick={handleSignOut} className="flex items-center text-gray-600 dark:text-gray-200 focus:outline-none" title="Sign Out">
          <LogOut className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}

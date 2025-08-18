'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Newspaper, Menu, PlaySquare, Megaphone, Link as LinkIcon, Settings, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarNavItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/posts', icon: Newspaper, label: 'Posts' },
  { href: '/admin/menu', icon: Menu, label: 'Menu' },
  { href: '/admin/hero-slider', icon: PlaySquare, label: 'Hero Slider' },
  { href: '/admin/ads', icon: Megaphone, label: 'Ads' },
  { href: '/admin/social-links', icon: LinkIcon, label: 'Social Links' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex items-center justify-center h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <Bot className="w-8 h-8 text-indigo-500" />
          <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white">Admin Panel</span>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto bg-white dark:bg-gray-800">
          <nav className="flex-1 px-2 py-4">
            {sidebarNavItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center px-4 py-2 mt-2 text-sm font-semibold text-gray-700 dark:text-gray-200 rounded-lg',
                  pathname === href
                    ? 'bg-indigo-200 dark:bg-indigo-600 text-indigo-700 dark:text-indigo-100'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="ml-3">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

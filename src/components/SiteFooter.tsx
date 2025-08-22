
'use client';

import Link from 'next/link';
import { Bot, Link as LinkIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { SocialLink } from '@/app/admin/social-links/page';
import * as LucideIcons from 'lucide-react';
import type { SiteSettings } from '@/app/admin/settings/page';
import Image from 'next/image';
import { getDocuments, getDocument } from '@/app/actions/firestoreActions';
import type { MenuItem } from '@/app/admin/menu/page';
import { menuData as initialMenuData } from '@/data/menu';

const footerLinkSections = [
    {
        title: 'Company',
        links: [
            { label: 'About Us', href: '/about' },
            { label: 'Contact Us', href: '/contact' },
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms of Service', href: '/terms' },
        ],
    },
];

export default function SiteFooter() {
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [menuData, setMenuData] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [links, siteSettings, menu] = await Promise.all([
                    getDocuments<SocialLink>('socialLinks'),
                    getDocument<SiteSettings>('site-data', 'settings'),
                    getDocument<{ data: MenuItem[] }>('site-data', 'menu'),
                ]);

                setSocialLinks(links);
                setSettings(siteSettings);
                if (menu?.data && menu.data.length > 0) {
                    setMenuData(menu.data);
                } else {
                    setMenuData(initialMenuData as MenuItem[]);
                }
                
            } catch (error) {
                console.error("Failed to fetch footer data from Firestore", error);
                setMenuData(initialMenuData as MenuItem[]);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const SiteLogo = () => {
      if (!settings) return null;
      if (settings.logoType === 'image' && settings.logoImageUrl) {
          return <Image src={settings.logoImageUrl} alt="Site Logo" width={150} height={40} className="h-10 w-auto" />;
      }
      return (
          <div className="flex-shrink-0 flex items-center space-x-2">
            <Bot className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-800 dark:text-white">{settings.logoText || 'Amaj World'}</span>
          </div>
      );
    }

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-4 flex flex-col items-center md:items-start text-center md:text-left">
              <Link href="/">
                <SiteLogo />
              </Link>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Amazon World – Explore the Best of Amazon in One Place! Shop smart with curated Amazon product reviews, top deals, viral gadgets, fashion picks, pet accessories & home essentials – updated daily!
              </p>
          </div>

          <div className="text-center md:text-left">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">Categories</h3>
            <ul className="mt-4 space-y-2">
              {menuData.filter(item => item.href !== '/').map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-base text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="text-center md:text-left">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase">{footerLinkSections[0].title}</h3>
            <ul className="mt-4 space-y-2">
            {footerLinkSections[0].links.map((link) => (
                <li key={link.label}>
                <Link href={link.href} className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                    {link.label}
                </Link>
                </li>
            ))}
            </ul>
          </div>

        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 md:mb-0">
                {isLoading ? '...' : (settings?.copyrightText || `© ${new Date().getFullYear()} Amaj Worlds. All rights reserved.`)}
            </p>
             <div className="flex space-x-4">
                {socialLinks.map((link) => {
                    const Icon = LucideIcons[link.iconName] || LinkIcon;
                    return (
                        <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                            <span className="sr-only">{link.platform}</span>
                            <Icon className="h-6 w-6" />
                        </a>
                    );
                })}
            </div>
        </div>
      </div>
    </footer>
  );
}

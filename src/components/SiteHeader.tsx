
'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, Menu as MenuIcon, Bot, Search } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import type { SiteSettings } from "@/app/admin/settings/page";
import type { MenuItem as MenuDataType } from "@/app/admin/menu/page";
import { getDocument } from "@/app/actions/firestoreActions";
import { menuData as initialMenuData } from "@/data/menu";

const SiteLogo: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
        try {
            const savedSettings = await getDocument<SiteSettings>('site-data', 'settings');
            if (savedSettings) {
                setSettings(savedSettings);
            }
        } catch (error) {
            console.error("Failed to fetch settings for logo", error);
        }
    };
    fetchSettings();
    const handleStorageChange = () => fetchSettings();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!settings) {
    return (
        <div className="flex-shrink-0 flex items-center space-x-2">
            <Bot className="h-8 w-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-800 dark:text-white">Amaj World</span>
        </div>
    );
  }

  if (settings.logoType === 'image' && settings.logoImageUrl) {
    return (
      <Image src={settings.logoImageUrl} alt="Site Logo" width={150} height={40} className="h-10 w-auto" />
    );
  }

  return (
    <div className="flex-shrink-0 flex items-center space-x-2">
      <Bot className="h-8 w-8 text-indigo-600" />
      <span className="text-xl font-bold text-gray-800 dark:text-white">{settings.logoText}</span>
    </div>
  );
};


const MenuItem = ({ item }: { item: MenuDataType }) => {
  const pathname = usePathname();
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center space-x-1 text-base font-medium text-gray-700 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-indigo-400">
            <span>{item.label}</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56">
          <div className="grid">
            {item.children.map((child: MenuDataType) => (
              <Link
                key={child.label}
                href={child.href}
                className={cn(
                  "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800",
                  pathname === child.href ? "font-bold text-indigo-600" : ""
                )}
              >
                {child.label}
              </Link>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "text-base font-medium text-gray-700 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-indigo-400",
        pathname === item.href ? "font-bold text-indigo-600" : ""
      )}
    >
      {item.label}
    </Link>
  );
};

const MobileMenuItem = ({ item }: { item: MenuDataType }) => {
  const pathname = usePathname();
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <div>
        <span className="flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
          {item.label}
        </span>
        <div className="pl-4">
          {item.children.map((child: MenuDataType) => (
            <SheetClose key={child.label} asChild>
                <Link
                href={child.href}
                className={cn(
                    "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800",
                    pathname === child.href ? "font-bold text-indigo-600" : ""
                )}
                >
                {child.label}
                </Link>
            </SheetClose>
          ))}
        </div>
      </div>
    );
  }

  return (
    <SheetClose asChild>
      <Link
        href={item.href}
        className={cn(
          "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800",
          pathname === item.href ? "font-bold text-indigo-600" : ""
        )}
      >
        {item.label}
      </Link>
    </SheetClose>
  );
};

const SearchBar = ({ isMobile = false, onSearch }: { isMobile?: boolean, onSearch?: () => void }) => {
    const router = useRouter();
    const [query, setQuery] = useState('');

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            if (onSearch) onSearch();
        }
    };

    return (
        <form onSubmit={handleSearch} className="relative">
            <Input 
                type="search" 
                placeholder="Search..." 
                className={cn("pl-10", isMobile ? "w-full" : "w-40 md:w-auto")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
        </form>
    );
};


export default function SiteHeader() {
  const [menuData, setMenuData] = useState<MenuDataType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      setIsLoading(true);
      try {
        const menuDoc = await getDocument<{ data: MenuDataType[] }>('site-data', 'menu');
        if (menuDoc && menuDoc.data && menuDoc.data.length > 0) {
          setMenuData(menuDoc.data);
        } else {
            setMenuData(initialMenuData as MenuDataType[]);
        }
      } catch (error) {
        console.error("Failed to fetch menu data, using fallback.", error);
        setMenuData(initialMenuData as MenuDataType[]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMenu();
  }, []);

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <SiteLogo />
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
                {isLoading ? (
                    <div className="flex space-x-8">
                        {Array.from({length: 7}).map((_, i) => <div key={i} className="h-4 w-20 bg-muted rounded-md animate-pulse" />)}
                    </div>
                ) : (
                    menuData.map((item) => (
                        <MenuItem key={item.label} item={item} />
                    ))
                )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex">
              <SearchBar />
            </div>
            <div className="md:hidden">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MenuIcon className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <div className="flex flex-col space-y-4 py-6">
                      <Link href="/" className="px-4">
                        <SiteLogo />
                      </Link>
                      <div className="px-4">
                        <SearchBar isMobile onSearch={() => setIsSheetOpen(false)} />
                      </div>
                    {menuData.map((item) => (
                      <MobileMenuItem key={item.label} item={item} />
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

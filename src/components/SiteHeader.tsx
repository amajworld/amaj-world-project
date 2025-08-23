
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { menuData } from '@/data/menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';

import { ChevronDown, Search, Menu as MenuIcon, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const SiteHeader = () => {
  const [isSheetOpen, setSheetOpen] = useState(false);

  const renderNavLinks = (isMobile: boolean) => (
    <>
      {menuData.map((item) =>
        item.children ? (
          <DropdownMenu key={item.label}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-base justify-start">
                {item.label}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {item.children.map((child) => (
                <DropdownMenuItem key={child.label} asChild>
                    <Link href={child.href}>{child.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" asChild className="text-base justify-start" key={item.label}>
            <Link href={item.href}>{item.label}</Link>
          </Button>
        )
      )}
    </>
  );

  return (
    <header className="bg-background shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <MenuIcon className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <nav className="flex flex-col gap-4 mt-8">
                  {menuData.map((item) =>
                    item.children ? (
                      <div key={item.label}>
                        <h3 className="font-semibold px-4 py-2">{item.label}</h3>
                        <div className="flex flex-col pl-4">
                        {item.children.map((child) => (
                           <SheetClose asChild key={child.label}>
                            <Link href={child.href} className="px-4 py-2 text-muted-foreground hover:text-foreground">
                              {child.label}
                            </Link>
                           </SheetClose>
                        ))}
                        </div>
                      </div>
                    ) : (
                       <SheetClose asChild key={item.label}>
                        <Link href={item.href} className="font-semibold px-4 py-2">
                         {item.label}
                        </Link>
                       </SheetClose>
                    )
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          <Link href="/" className="text-2xl font-bold text-primary whitespace-nowrap">
            Amaj World
          </Link>
          
          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center">
            <ul className="flex items-center space-x-2">
              {menuData.map((item) =>
                item.children ? (
                  <li key={item.label}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="text-base">
                          {item.label}
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {item.children.map((child) => (
                          <DropdownMenuItem key={child.label} asChild>
                            <Link href={child.href}>{child.label}</Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </li>
                ) : (
                  <li key={item.label}>
                    <Button variant="ghost" asChild className="text-base">
                      <Link href={item.href}>{item.label}</Link>
                    </Button>
                  </li>
                )
              )}
            </ul>
          </nav>
        </div>

        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-48 lg:w-64 pl-10"
          />
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;

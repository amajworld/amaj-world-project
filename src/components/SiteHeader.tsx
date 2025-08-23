'use client';

import Link from 'next/link';
import { menuData } from '@/data/menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const SiteHeader = () => {
  return (
    <header className="bg-background shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center space-x-16">
          <Link href="/" className="text-2xl font-bold text-primary">
            Amaj World
          </Link>
          <nav>
            <ul className="flex items-center space-x-6">
              {menuData.map((item) =>
                item.children ? (
                  <li key={item.label}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost">
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
                    <Button variant="ghost" asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </Button>
                  </li>
                )
              )}
            </ul>
          </nav>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-64 pl-10"
          />
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;

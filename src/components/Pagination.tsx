
'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
};

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) {
    return null;
  }

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    if (pageNumber > 1) {
        params.set('page', pageNumber.toString());
    } else {
        params.delete('page');
    }
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className="mt-12 flex items-center justify-center space-x-4">
      {currentPage > 1 && (
        <Button asChild variant="outline">
            <Link href={createPageURL(currentPage - 1)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
            </Link>
        </Button>
      )}
      <span className="text-sm font-medium">
        Page {currentPage} of {totalPages}
      </span>
      {currentPage < totalPages && (
        <Button asChild variant="outline">
            <Link href={createPageURL(currentPage + 1)}>
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
        </Button>
      )}
    </div>
  );
}

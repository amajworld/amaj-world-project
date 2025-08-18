"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Facebook, Twitter, Share2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from './ui/button';

type Post = {
  slug: string;
  category?: string;
  title: string;
  imageUrl: string;
  author?: string;
  date?: string;
  href: string;
  dataAiHint?: string;
};

type PostCardProps = {
    post: Post;
}

const PinterestIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12.017 1.99c-5.425 0-8.75 3.9-8.75 8.242 0 2.834 1.483 5.374 3.75 6.542.417.217.5.492.2.783l-1.134 2.2c-.2.4-.617.3-1.033-.116-2.584-2.567-3.6-6.15-3.6-9.425C1.45 4.825 5.55.775 12.017.775c6.133 0 10.45 4.533 10.45 9.758 0 5.85-3.983 10.192-9.45 10.192-3.15 0-5.55-1.55-5.55-3.858 0-1.808 1.15-3.05 2.683-3.05 1.333 0 1.95 1.55 1.95 2.95 0 1.717-1.15 3.15-2.65 3.15-1.183 0-2.2-.95-2.2-2.358 0-2.342 2.167-5.558 2.167-7.658 0-1.55-1.333-2.783-3.233-2.783-2.317 0-4.067 2.233-4.067 4.542 0 1.25.3 2.1.3 2.1L6.5 13.7c0 .2.017.383.017.583 0 1.65-1.3 2.983-2.917 2.983-2.05 0-3.6-1.783-3.6-4.15 0-3.258 2.917-6.25 6.667-6.25 3.483 0 6.017 2.383 6.017 5.358 0 2.2-1.033 4.35-2.667 4.35-1.05 0-1.933-.867-1.933-1.983 0-1.508 1.033-2.85 1.033-3.958 0-1.85-2.283-4.283-2.283-5.758 0-1.183.883-2.1 1.917-2.1 1.416 0 2.316.983 2.316 2.55 0 1.9-1.333 4.283-1.333 5.4 0 .5.083.917.283 1.25.3.483.783.616 1.15.616 2.217 0 3.683-2.2 3.683-5.225 0-2.933-1.783-5.35-5.183-5.35z" />
    </svg>
  );

export default function PostCard({ post }: PostCardProps) {
  const postUrl = typeof window !== 'undefined' ? `${window.location.origin}${post.href}` : post.href;
  const encodedUrl = encodeURIComponent(postUrl);
  const encodedTitle = encodeURIComponent(post.title);
  const encodedImageUrl = encodeURIComponent(post.imageUrl);

  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
  const pinterestShareUrl = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImageUrl}&description=${encodedTitle}`;


  const handleShareClick = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
  };
  
  return (
    <div className="group overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-lg flex flex-col relative">
      <Link href={post.href} className="block flex flex-col h-full">
        <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-800" style={{ paddingTop: '133.33%' }}> {/* 3:4 aspect ratio */}
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={post.dataAiHint}
          />
        </div>
        <div className="flex flex-col p-6 flex-grow">
          <div className="flex-grow">
            <h3 className="text-xl font-bold leading-tight text-primary group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
              {post.title}
            </h3>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm font-semibold text-indigo-600 dark:text-indigo-400">
            <div className="flex items-center">
                <span>Read More</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </Link>
        <div className="absolute top-2 right-2 z-10">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="rounded-full h-8 w-8 bg-black/30 hover:bg-black/50"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                  aria-label="Open share menu"
                >
                  <Share2 className="h-4 w-4 text-white" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-1" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="icon" onClick={(e) => handleShareClick(e, facebookShareUrl)} aria-label="Share on Facebook">
                      <Facebook className="h-5 w-5 text-gray-500 hover:text-indigo-600" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={(e) => handleShareClick(e, twitterShareUrl)} aria-label="Share on Twitter">
                      <Twitter className="h-5 w-5 text-gray-500 hover:text-indigo-600" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={(e) => handleShareClick(e, pinterestShareUrl)} aria-label="Share on Pinterest">
                      <PinterestIcon className="h-5 w-5 text-gray-500 hover:text-indigo-600" />
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
        </div>
    </div>
  );
}

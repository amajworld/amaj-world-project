
'use client';

import React, { useState, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import { getDocuments } from '@/app/actions/firestoreActions';
import type { SlideConfig } from '@/app/admin/hero-slider/page';

export default function HeroSlider() {
    const [slides, setSlides] = useState<SlideConfig[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSlides = async () => {
            setIsLoading(true);
            try {
                const fetchedSlides = await getDocuments<SlideConfig>('heroSlides');
                setSlides(fetchedSlides);
            } catch (error) {
                console.error("Failed to fetch slides:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSlides();
    }, []);

    if (isLoading) {
        return (
            <div className="w-full aspect-[16/7] bg-muted flex items-center justify-center">
                {/* Optional: Add a loader here */}
            </div>
        );
    }
    
    if (slides.length === 0) {
        return null; // Don't render anything if there are no slides
    }

    return (
        <div className="w-full relative mb-8">
             <Carousel
                plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
                className="w-full"
                opts={{
                    loop: true,
                }}
            >
                <CarouselContent>
                    {slides.map((slide) => (
                        <CarouselItem key={slide.id}>
                            <div className="relative w-full aspect-[16/7]">
                                <Image
                                    src={slide.imageUrl}
                                    alt={slide.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-4">
                                    <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
                                        {slide.title}
                                    </h2>
                                    <Button asChild className="mt-6">
                                        <Link href={slide.buttonUrl}>{slide.buttonText}</Link>
                                    </Button>
                                </div>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 border-none" />
                <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50 border-none" />
            </Carousel>
        </div>
    );
}

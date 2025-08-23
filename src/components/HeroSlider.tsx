
'use client';

import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { SlideConfig } from "@/types/hero-slides";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";

interface HeroSliderProps {
  slides: SlideConfig[];
}

export default function HeroSlider({ slides }: HeroSliderProps) {
  return (
    <Carousel
      className="w-full"
      plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
      opts={{ loop: true }}
    >
      <CarouselContent>
        {slides.map((slide) => (
          <CarouselItem key={slide.id}>
            <div className="relative w-full h-[40vh] md:h-[60vh]">
              <Image
                src={slide.imageUrl}
                alt={slide.title}
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center text-white p-4">
                  <h1 className="text-3xl md:text-5xl font-bold">{slide.title}</h1>
                  {slide.subtitle && (
                    <p className="mt-2 text-lg md:text-xl">{slide.subtitle}</p>
                  )}
                  {slide.buttonText && slide.buttonLink && (
                    <Button asChild className="mt-4" size="lg">
                      <Link href={slide.buttonLink}>{slide.buttonText}</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/20 hover:bg-black/50 border-none" />
      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/20 hover:bg-black/50 border-none" />
    </Carousel>
  );
}

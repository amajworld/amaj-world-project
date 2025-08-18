'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Trash2, Edit, PlusCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { getDocuments, addDocument, updateDocument, deleteDocument } from '@/app/actions/firestoreActions';

export type SlideConfig = {
  id: string;
  imageUrl: string;
  title: string;
  buttonText: string;
  buttonUrl: string;
};

const initialSlideState: Omit<SlideConfig, 'id'> = {
  imageUrl: 'https://placehold.co/1200x500.png',
  title: '',
  buttonText: 'Shop Now',
  buttonUrl: '#',
};

export default function HeroSliderPage() {
  const [slides, setSlides] = useState<SlideConfig[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState<Omit<SlideConfig, 'id'> & { id?: string }>(initialSlideState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    setIsLoading(true);
    try {
      const fetchedSlides = await getDocuments<SlideConfig>('heroSlides');
      setSlides(fetchedSlides);
    } catch (error) {
      console.error('Failed to fetch slides from Firestore', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddDialog = () => {
    setCurrentSlide(initialSlideState);
    setIsDialogOpen(true);
  };

  const openEditDialog = (slide: SlideConfig) => {
    setCurrentSlide(slide);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this slide? This cannot be undone.')) {
      try {
        await deleteDocument('heroSlides', id);
        setSlides(slides.filter((slide) => slide.id !== id));
      } catch (error) {
        console.error('Failed to delete slide:', error);
        alert('Failed to delete slide.');
      }
    }
  };

  const handleSave = async () => {
    if (!currentSlide.imageUrl || !currentSlide.title) {
      alert('Image URL and Title are required.');
      return;
    }

    setIsSaving(true);
    try {
      if (currentSlide.id) {
        await updateDocument('heroSlides', currentSlide.id, currentSlide);
      } else {
        await addDocument('heroSlides', currentSlide);
      }
      await fetchSlides();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save slide:', error);
      alert('Failed to save slide.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof Omit<SlideConfig, 'id'>, value: string) => {
    setCurrentSlide((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Manage Hero Slider</CardTitle>
          <CardDescription>
            Add, edit, and delete slides for your homepage hero section.
          </CardDescription>
        </div>
        <Button onClick={openAddDialog}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Slide
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : slides.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No slides configured. Click "Add New Slide" to get started.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {slides.map((slide) => (
              <Card key={slide.id} className="overflow-hidden">
                <div className="relative h-40 w-full bg-gray-200">
                  <Image
                    src={slide.imageUrl}
                    alt={slide.title}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold truncate">{slide.title}</h3>
                  <div className="flex items-center justify-end space-x-2 mt-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openEditDialog(slide)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit Slide</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(slide.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete Slide</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentSlide.id ? 'Edit Slide' : 'Add New Slide'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="slide-imageUrl">Image URL</Label>
              <Input
                id="slide-imageUrl"
                placeholder="https://example.com/image.png"
                value={currentSlide.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slide-title">Title</Label>
              <Input
                id="slide-title"
                placeholder="e.g., Summer Collection"
                value={currentSlide.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slide-buttonText">Button Text</Label>
              <Input
                id="slide-buttonText"
                placeholder="e.g., Shop Now"
                value={currentSlide.buttonText}
                onChange={(e) =>
                  handleInputChange('buttonText', e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slide-buttonUrl">Button URL</Label>
              <Input
                id="slide-buttonUrl"
                placeholder="e.g., /fashion"
                value={currentSlide.buttonUrl}
                onChange={(e) => handleInputChange('buttonUrl', e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isSaving}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Slide
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

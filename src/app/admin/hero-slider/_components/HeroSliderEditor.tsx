
'use client';

import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import type { SlideConfig } from '../page';
import { Trash2, Plus, Save } from 'lucide-react';
import Image from 'next/image';

interface HeroSliderEditorProps {
  initialSlides: SlideConfig[];
  onSave: (slide: SlideConfig) => Promise<{ success: boolean; message?: string }>;
  onDelete: (id: string) => Promise<{ success: boolean; message?: string }>;
}

export default function HeroSliderEditor({ initialSlides, onSave, onDelete }: HeroSliderEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  const { control, register, handleSubmit, reset } = useForm<{ slides: SlideConfig[] }>({
    defaultValues: { slides: initialSlides },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'slides',
  });
  
  const handleSaveSlide = async (index: number) => {
    setIsSaving(true);
    const slideData = control._getWatch(`slides.${index}`);
    const result = await onSave(slideData);
    if (!result.success) {
      alert(result.message);
    }
    setIsSaving(false);
  };
  
  const handleDeleteSlide = async (index: number, id: string) => {
    if (confirm('Are you sure you want to delete this slide?')) {
      if (id) {
          const result = await onDelete(id);
          if (result.success) {
            remove(index);
          } else {
            alert(result.message);
          }
      } else {
          remove(index); // Remove from UI if not saved yet
      }
    }
  };
  
  const handleAddNew = () => {
    append({ id: '', imageUrl: '', title: '', subtitle: '', buttonText: '', buttonLink: '', status: 'inactive' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Slides</CardTitle>
        <CardDescription>Add, edit, or remove your hero slides.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field, index) => {
            const currentImage = control._getWatch(`slides.${index}.imageUrl`);
            return (
                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Image URL</Label>
                            <Input {...register(`slides.${index}.imageUrl`)} placeholder="https://example.com/image.jpg" />
                            {currentImage && 
                                <div className="mt-2">
                                    <Image src={currentImage} alt="Slide preview" width={200} height={100} className="rounded-md object-cover" />
                                </div>
                            }
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={control._getWatch(`slides.${index}.status`) === 'active'}
                                    onCheckedChange={(checked) => {
                                        const newSlides = [...control._getWatch('slides')];
                                        newSlides[index].status = checked ? 'active' : 'inactive';
                                        reset({ slides: newSlides });
                                    }}
                                />
                                <span>{control._getWatch(`slides.${index}.status`)}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input {...register(`slides.${index}.title`)} placeholder="Slide Title" />
                        </div>
                        <div className="space-y-2">
                            <Label>Subtitle</Label>
                            <Input {...register(`slides.${index}.subtitle`)} placeholder="Catchy subtitle" />
                        </div>
                        <div className="space-y-2">
                            <Label>Button Text</Label>
                            <Input {...register(`slides.${index}.buttonText`)} placeholder="Shop Now" />
                        </div>
                        <div className="space-y-2">
                            <Label>Button Link</Label>
                            <Input {...register(`slides.${index}.buttonLink`)} placeholder="/products/new" />
                        </div>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleSaveSlide(index)} disabled={isSaving}>
                            <Save className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteSlide(index, field.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            );
        })}
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button variant="outline" onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" /> Add New Slide
        </Button>
      </CardFooter>
    </Card>
  );
}

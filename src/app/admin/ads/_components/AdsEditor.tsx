
'use client';

import { useState } from 'react';
import { useFieldArray, useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import type { AdConfig } from '../page';
import { Trash2, Plus, Save } from 'lucide-react';
import Image from 'next/image';

interface AdsEditorProps {
  initialAds: AdConfig[];
  onSave: (ad: AdConfig) => Promise<{ success: boolean; message?: string }>;
  onDelete: (id: string) => Promise<{ success: boolean; message?: string }>;
}

export default function AdsEditor({ initialAds, onSave, onDelete }: AdsEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  const { control, register, handleSubmit, reset, watch } = useForm<{ ads: AdConfig[] }>({
    defaultValues: { ads: initialAds },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ads',
  });
  
  const handleSaveAd = async (index: number) => {
    setIsSaving(true);
    const adData = control._getWatch(`ads.${index}`);
    const result = await onSave(adData);
    if (!result.success) {
      alert(result.message);
    }
    setIsSaving(false);
  };
  
  const handleDeleteAd = async (index: number, id: string) => {
    if (confirm('Are you sure you want to delete this ad?')) {
      if (id) {
          const result = await onDelete(id);
          if (result.success) {
            remove(index);
          } else {
            alert(result.message);
          }
      } else {
          remove(index);
      }
    }
  };
  
  const handleAddNew = () => {
    append({ id: '', location: 'home-top', type: 'image', content: '', status: 'inactive' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Ads</CardTitle>
        <CardDescription>Manage your ad placements and content.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field, index) => {
            const adType = watch(`ads.${index}.type`);
            const adContent = watch(`ads.${index}.content`);

            return (
                <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Controller
                            control={control}
                            name={`ads.${index}.location`}
                            render={({ field }) => (
                                <div className="space-y-2">
                                    <Label>Location</Label>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="home-top">Home (Top)</SelectItem>
                                            <SelectItem value="sidebar-top">Sidebar (Top)</SelectItem>
                                            <SelectItem value="post-bottom">Post (Bottom)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        />
                         <Controller
                            control={control}
                            name={`ads.${index}.type`}
                            render={({ field }) => (
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <SelectTrigger><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="image">Image</SelectItem>
                                            <SelectItem value="code">Code</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        />
                        <div className="space-y-2">
                             <Label>Status</Label>
                             <Controller
                                control={control}
                                name={`ads.${index}.status`}
                                render={({ field }) => (
                                    <div className="flex items-center space-x-2 pt-2">
                                        <Switch
                                            checked={field.value === 'active'}
                                            onCheckedChange={(checked) => field.onChange(checked ? 'active' : 'inactive')}
                                        />
                                        <span className="capitalize">{field.value}</span>
                                    </div>
                                )}
                             />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label>{adType === 'image' ? 'Image URL' : 'Ad Code (HTML/JS)'}</Label>
                        {adType === 'image' ? (
                            <Input {...register(`ads.${index}.content`)} placeholder="https://example.com/ad.jpg" />
                        ) : (
                            <Textarea {...register(`ads.${index}.content`)} placeholder="<your ad code here>" />
                        )}
                    </div>

                    {adType === 'image' && (
                        <>
                            <div className="space-y-2">
                                <Label>Image Link (optional)</Label>
                                <Input {...register(`ads.${index}.link`)} placeholder="https://advertiser.com/product" />
                            </div>
                            {adContent && (
                                <div className="mt-2">
                                    <Image src={adContent} alt="Ad preview" width={300} height={150} className="rounded-md object-contain border p-2"/>
                                </div>
                            )}
                        </>
                    )}

                    <div className="absolute top-4 right-4 flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleSaveAd(index)} disabled={isSaving}>
                            <Save className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteAd(index, field.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            );
        })}
      </CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button variant="outline" onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" /> Add New Ad
        </Button>
      </CardFooter>
    </Card>
  );
}

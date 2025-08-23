
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import type { SocialLink } from '../page';
import { Trash2, Plus } from 'lucide-react';

interface SocialLinksEditorProps {
  initialLinks: SocialLink[];
  onSave: (link: SocialLink) => Promise<{ success: boolean; message?: string }>;
  onDelete: (id: string) => Promise<{ success: boolean; message?: string }>;
}

export default function SocialLinksEditor({ initialLinks, onSave, onDelete }: SocialLinksEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const { control, register, handleSubmit, reset } = useForm<{ links: SocialLink[] }>({
    defaultValues: { links: initialLinks },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'links',
  });
  
  const handleSaveLink = async (index: number, link: SocialLink) => {
    setIsSaving(true);
    const result = await onSave(link);
    if (!result.success) {
      alert(result.message);
    }
    setIsSaving(false);
  };
  
  const handleDeleteLink = async (index: number, id: string) => {
      if(confirm('Are you sure you want to delete this link?')) {
          const result = await onDelete(id);
           if (result.success) {
                remove(index);
            } else {
                alert(result.message);
            }
      }
  };
  
  const handleAddNew = () => {
    append({ id: '', platform: 'Facebook', url: '' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Links</CardTitle>
        <CardDescription>Add, edit, or remove your social media links.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-end gap-2 p-4 border rounded-lg">
                <input type="hidden" {...register(`links.${index}.id`)} />
                <div className="flex-1">
                    <Label>Platform</Label>
                    <Select defaultValue={field.platform} onValueChange={(value) => {
                        const newLinks = [...control._getWatch('links')];
                        newLinks[index].platform = value as SocialLink['platform'];
                        reset({ links: newLinks });
                    }}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Facebook">Facebook</SelectItem>
                            <SelectItem value="Twitter">Twitter</SelectItem>
                            <SelectItem value="Instagram">Instagram</SelectItem>
                            <SelectItem value="Linkedin">Linkedin</SelectItem>
                            <SelectItem value="Youtube">Youtube</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex-[2]">
                    <Label>URL</Label>
                    <Input {...register(`links.${index}.url`)} placeholder="https://facebook.com/your-page" />
                </div>
                <Button variant="outline" size="sm" onClick={() => handleSaveLink(index, control._getWatch(`links.${index}`))}>Save</Button>
                <Button variant="destructive" size="icon" onClick={() => handleDeleteLink(index, field.id)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="border-t px-6 py-4 flex justify-between items-center">
        <Button variant="outline" onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" /> Add New Link
        </Button>
      </CardFooter>
    </Card>
  );
}

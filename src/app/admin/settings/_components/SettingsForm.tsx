
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import type { SiteSettings } from '../page';
import Image from 'next/image';

interface SettingsFormProps {
  initialSettings: SiteSettings | null;
  onSave: (settings: SiteSettings) => Promise<{ success: boolean; message?: string }>;
}

export default function SettingsForm({ initialSettings, onSave }: SettingsFormProps) {
  const { register, handleSubmit, watch } = useForm<SiteSettings>({
    defaultValues: initialSettings || {},
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const logoUrl = watch('logoUrl');

  const onSubmit = async (data: SiteSettings) => {
    setIsSaving(true);
    setMessage('');
    const result = await onSave(data);
    if (result.success) {
      setMessage('Settings saved successfully!');
    } else {
      setMessage(result.message || 'An error occurred.');
    }
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Update your site's name, description, and logo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Input id="siteName" {...register('siteName')} placeholder="Your Awesome Site" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="siteDescription">Site Description</Label>
            <Textarea
              id="siteDescription"
              {...register('siteDescription')}
              placeholder="A brief description of your site."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input id="logoUrl" {...register('logoUrl')} placeholder="https://example.com/logo.png" />
             {logoUrl && (
              <div className="mt-4 p-4 border rounded-md bg-muted">
                <p className="text-sm font-medium mb-2">Logo Preview:</p>
                <Image src={logoUrl} alt="Logo preview" width={128} height={40} className="max-h-10 w-auto bg-white p-1 rounded"/>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4 flex justify-between items-center">
            <div>
                 {message && <p className="text-sm text-muted-foreground">{message}</p>}
            </div>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

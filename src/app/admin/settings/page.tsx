'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Text, Image as ImageIcon, Loader2 } from 'lucide-react';
import { getDocument, updateDocument } from '@/app/actions/firestoreActions';

export type SiteSettings = {
  logoType: 'text' | 'image';
  logoText: string;
  logoImageUrl: string;
  copyrightText: string;
};

const initialSettings: SiteSettings = {
  logoType: 'text',
  logoText: 'Amaj World',
  logoImageUrl: '',
  copyrightText: `© ${new Date().getFullYear()} Amaj World. All rights reserved.`,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const savedSettings = await getDocument<SiteSettings>('site-data', 'settings');
        if (savedSettings) {
          setSettings(savedSettings);
        } else {
          // If no settings in DB, use initial and save them
          await updateDocument('site-data', 'settings', initialSettings);
        }
      } catch (error) {
        console.error("Failed to fetch settings from Firestore", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateDocument('site-data', 'settings', settings);
      alert('Settings saved successfully!');
      // Dispatch a storage event to notify other components like header/footer
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error("Failed to save settings to Firestore", error);
      alert('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof SiteSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoTypeChange = (value: SiteSettings['logoType']) => {
    handleInputChange('logoType', value);
  };
  
  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Site Settings</CardTitle>
                <CardDescription>Loading your site settings...</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Settings</CardTitle>
        <CardDescription>
          Manage global settings for your website from here.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="p-6 border rounded-lg space-y-4">
            <h3 className="text-lg font-medium">Logo & Branding</h3>
            <div className="space-y-2">
                <Label htmlFor="logo-type">Logo Type</Label>
                 <Select value={settings.logoType} onValueChange={handleLogoTypeChange}>
                    <SelectTrigger id="logo-type">
                        <SelectValue placeholder="Select logo type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="text"><Text className="inline-block mr-2 h-4 w-4" />Text Logo</SelectItem>
                        <SelectItem value="image"><ImageIcon className="inline-block mr-2 h-4 w-4" />Image Logo</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {settings.logoType === 'text' ? (
                <div className="space-y-2">
                    <Label htmlFor="logo-text">Logo Text</Label>
                    <Input
                      id="logo-text"
                      placeholder="e.g., Amaj World"
                      value={settings.logoText}
                      onChange={e => handleInputChange('logoText', e.target.value)}
                    />
                </div>
            ) : (
                <div className="space-y-2">
                    <Label htmlFor="logo-image-url">Logo Image URL</Label>
                    <Input
                      id="logo-image-url"
                      placeholder="https://example.com/logo.png"
                      value={settings.logoImageUrl}
                      onChange={e => handleInputChange('logoImageUrl', e.target.value)}
                    />
                </div>
            )}
        </div>

        <div className="p-6 border rounded-lg space-y-4">
            <h3 className="text-lg font-medium">Footer Settings</h3>
             <div className="space-y-2">
                <Label htmlFor="copyright-text">Copyright Text</Label>
                <Input
                  id="copyright-text"
                  placeholder="© 2024 Your Company. All rights reserved."
                  value={settings.copyrightText}
                  onChange={e => handleInputChange('copyrightText', e.target.value)}
                />
            </div>
        </div>

        <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, PlusCircle, Edit, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { getDocuments, addDocument, updateDocument, deleteDocument } from '@/app/actions/firestoreActions';

// Define the shape of a single ad configuration
export type AdConfig = {
  id: string;
  name: string; // Unique user-defined name, e.g., 'homepage-top-banner'
  location: 'top-banner' | 'sidebar' | 'popunder' | 'social-bar';
  imageUrl?: string;
  destUrl?: string;
  code?: string;
};

const initialAdState: Omit<AdConfig, 'id'> = {
  name: '',
  location: 'top-banner',
  imageUrl: '',
  destUrl: '',
  code: '',
};

export default function AdsPage() {
  const [ads, setAds] = useState<AdConfig[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAd, setCurrentAd] = useState<Omit<AdConfig, 'id'> & { id?: string }>(initialAdState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    setIsLoading(true);
    try {
      const fetchedAds = await getDocuments<AdConfig>('ads');
      setAds(fetchedAds);
    } catch (error) {
      console.error("Failed to fetch ads from Firestore", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddDialog = () => {
    setCurrentAd(initialAdState);
    setIsDialogOpen(true);
  };

  const openEditDialog = (ad: AdConfig) => {
    setCurrentAd(ad);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this ad? This cannot be undone.')) {
      try {
        await deleteDocument('ads', id);
        setAds(ads.filter(ad => ad.id !== id));
      } catch (error) {
        console.error("Failed to delete ad:", error);
        alert('Failed to delete ad.');
      }
    }
  };

  const handleSave = async () => {
    if (!currentAd.name || !currentAd.location) {
      alert('Ad Name and Location are required.');
      return;
    }
    
    if (!currentAd.id && ads.some(ad => ad.name === currentAd.name)) {
        alert('An ad with this name already exists. Please use a unique name.');
        return;
    }

    setIsSaving(true);
    try {
      if (currentAd.id) {
        await updateDocument('ads', currentAd.id, currentAd);
      } else {
        await addDocument('ads', currentAd);
      }
      await fetchAds(); // Refetch all ads to get the latest state
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to save ad:", error);
      alert('Failed to save ad.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof Omit<AdConfig, 'id'>, value: string) => {
    setCurrentAd(prev => ({ ...prev, [field]: value }));
  };
  
  const handleLocationChange = (value: AdConfig['location']) => {
      handleInputChange('location', value);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Manage Advertisements</CardTitle>
            <CardDescription>
                Create, edit, and delete ads for different locations on your site.
            </CardDescription>
        </div>
        <Button onClick={openAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Ad
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
            <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        ) : ads.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No ads configured. Click "Add New Ad" to get started.</p>
        ) : (
          <div className="space-y-4">
            {ads.map(ad => (
              <div key={ad.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-bold text-lg">{ad.name}</p>
                  <p className="text-sm text-muted-foreground">Location: <span className="font-mono bg-muted px-2 py-1 rounded-md">{ad.location}</span></p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon" onClick={() => openEditDialog(ad)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit Ad</span>
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(ad.id)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete Ad</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{currentAd.id ? 'Edit Ad' : 'Add New Ad'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="ad-name">Ad Name (Unique Identifier)</Label>
                <Input
                  id="ad-name"
                  placeholder="e.g., homepage-top-banner"
                  value={currentAd.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  disabled={!!currentAd.id}
                />
                 <p className="text-xs text-muted-foreground">This name is used to place the ad. It cannot be changed after creation.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ad-location">Ad Location</Label>
                 <Select
                    value={currentAd.location}
                    onValueChange={handleLocationChange}
                  >
                    <SelectTrigger id="ad-location">
                        <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="top-banner">Top Banner</SelectItem>
                        <SelectItem value="sidebar">Sidebar</SelectItem>
                        <SelectItem value="popunder">Popunder</SelectItem>
                        <SelectItem value="social-bar">Social Bar</SelectItem>
                    </SelectContent>
                </Select>
              </div>

              <div className="p-3 border rounded-md bg-muted/50 space-y-2">
                <Label className="font-semibold">Option 1: Linked Image</Label>
                <Input
                  placeholder="Image URL (e.g., https://example.com/banner.png)"
                  value={currentAd.imageUrl ?? ''}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                />
                <Input
                  placeholder="Destination URL (e.g., https://product-link.com)"
                  value={currentAd.destUrl ?? ''}
                  onChange={(e) => handleInputChange('destUrl', e.target.value)}
                />
              </div>

              <div className="relative text-center my-1">
                 <div className="absolute left-0 top-1/2 w-full border-t"></div>
                <span className="relative px-2 bg-background text-muted-foreground text-sm z-10">OR</span>
              </div>

              <div className="p-3 border rounded-md bg-muted/50 space-y-2">
                <Label className="font-semibold">Option 2: Custom Ad Code</Label>
                <Textarea
                  placeholder="Paste your ad script here (e.g., AdSense). This will override the linked image."
                  value={currentAd.code ?? ''}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  rows={4}
                  className="font-mono text-xs"
                />
              </div>

            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline" disabled={isSaving}>Cancel</Button>
                </DialogClose>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Ad
                </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </Card>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Trash2, Edit, PlusCircle, Link as LinkIcon, Loader2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { getDocuments, addDocument, updateDocument, deleteDocument } from '@/app/actions/firestoreActions';

export type SocialLink = {
  id: string;
  platform: string;
  url: string;
  iconName: keyof typeof LucideIcons;
};

const initialLinkState: Omit<SocialLink, 'id'> = {
  platform: '',
  url: '',
  iconName: 'Link',
};

export default function SocialLinksPage() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentLink, setCurrentLink] = useState<Omit<SocialLink, 'id'> & { id?: string }>(initialLinkState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setIsLoading(true);
    try {
      const fetchedLinks = await getDocuments<SocialLink>('socialLinks');
      setLinks(fetchedLinks);
    } catch (error) {
      console.error("Failed to fetch social links from Firestore", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddDialog = () => {
    setCurrentLink(initialLinkState);
    setIsDialogOpen(true);
  };

  const openEditDialog = (link: SocialLink) => {
    setCurrentLink(link);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this link?')) {
      try {
        await deleteDocument('socialLinks', id);
        setLinks(links.filter(link => link.id !== id));
      } catch (error) {
        console.error("Failed to delete link:", error);
        alert('Failed to delete link.');
      }
    }
  };

  const handleSave = async () => {
    if (!currentLink.platform || !currentLink.url || !currentLink.iconName) {
      alert('All fields are required.');
      return;
    }

    setIsSaving(true);
    try {
      if (currentLink.id) {
        await updateDocument('socialLinks', currentLink.id, currentLink);
      } else {
        await addDocument('socialLinks', currentLink);
      }
      await fetchLinks();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to save link:", error);
      alert('Failed to save link.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof Omit<SocialLink, 'id'>, value: string) => {
    setCurrentLink(prev => ({ ...prev, [field]: value as any }));
  };

  const IconComponent = LucideIcons[currentLink.iconName as keyof typeof LucideIcons] || LucideIcons.Link;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Manage Social Links</CardTitle>
            <CardDescription>
                Add, edit, or delete the social media links displayed on your site.
            </CardDescription>
        </div>
        <Button onClick={openAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Link
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
            <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        ) : links.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No social links configured. Click "Add New Link" to get started.</p>
        ) : (
          <div className="space-y-4">
            {links.map(link => {
                const Icon = LucideIcons[link.iconName] || LinkIcon;
                return (
                  <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Icon className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <p className="font-bold text-lg">{link.platform}</p>
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                          {link.url}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="icon" onClick={() => openEditDialog(link)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit Link</span>
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(link.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete Link</span>
                      </Button>
                    </div>
                  </div>
                )
            })}
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{currentLink.id ? 'Edit Social Link' : 'Add New Social Link'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="platform-name">Platform Name</Label>
                <Input
                  id="platform-name"
                  placeholder="e.g., Facebook"
                  value={currentLink.platform}
                  onChange={e => handleInputChange('platform', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform-url">URL</Label>
                <Input
                  id="platform-url"
                  placeholder="https://www.facebook.com/your-page"
                  value={currentLink.url}
                  onChange={e => handleInputChange('url', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon-name">Icon Name (from lucide-react)</Label>
                <div className="flex items-center space-x-2">
                    <Input
                      id="icon-name"
                      placeholder="e.g., Facebook, Twitter, Instagram"
                      value={currentLink.iconName}
                      onChange={e => handleInputChange('iconName', e.target.value)}
                    />
                    <div className="p-2 border rounded-md bg-muted">
                        <IconComponent className="h-6 w-6 text-muted-foreground" />
                    </div>
                </div>
                 <p className="text-xs text-muted-foreground">
                    Enter a valid icon name from the{' '}
                    <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">lucide-react library</a>.
                </p>
              </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline" disabled={isSaving}>Cancel</Button>
                </DialogClose>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Link
                </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </Card>
  );
}


import { getDocuments, setDocument, deleteDocument, addDocument, updateDocument } from '@/app/actions/firestoreActions';
import SocialLinksEditor from './_components/SocialLinksEditor';
import { revalidatePath } from 'next/cache';

export interface SocialLink {
  id: string;
  platform: 'Facebook' | 'Twitter' | 'Instagram' | 'Linkedin' | 'Youtube';
  url: string;
}

async function saveLink(link: SocialLink) {
    'use server';
    try {
        if (link.id) {
            await updateDocument('socialLinks', link.id, link);
        } else {
            await addDocument('socialLinks', { platform: link.platform, url: link.url });
        }
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Failed to save link.' };
    }
}

async function deleteLink(id: string) {
    'use server';
    try {
        await deleteDocument('socialLinks', id);
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Failed to delete link.' };
    }
}


export default async function SocialLinksPage() {
  const links = await getDocuments<SocialLink>('socialLinks');

  return (
    <div className="container mx-auto py-10">
      <div>
        <h1 className="text-3xl font-bold">Social Media Links</h1>
        <p className="text-muted-foreground">Manage links to your social profiles.</p>
      </div>
      <div className="mt-6">
        <SocialLinksEditor 
            initialLinks={links}
            onSave={saveLink}
            onDelete={deleteLink}
        />
      </div>
    </div>
  );
}

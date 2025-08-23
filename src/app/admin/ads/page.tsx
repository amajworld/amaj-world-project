
import { getDocuments, addDocument, updateDocument, deleteDocument } from '@/app/actions/firestoreActions';
import AdsEditor from './_components/AdsEditor';
import { revalidatePath } from 'next/cache';

export interface AdConfig {
  id: string;
  location: 'home-top' | 'sidebar-top' | 'post-bottom';
  type: 'image' | 'code';
  content: string; // URL for image, or HTML/JS code for code type
  link?: string; // Optional link for image ads
  status: 'active' | 'inactive';
}

async function saveAd(ad: AdConfig) {
  'use server';
  try {
    const data = { ...ad };
    delete (data as any).id;

    if (ad.id) {
      await updateDocument('ads', ad.id, data);
    } else {
      await addDocument('ads', data);
    }
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Failed to save ad' };
  }
}

async function deleteAd(id: string) {
  'use server';
  try {
    await deleteDocument('ads', id);
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Failed to delete ad' };
  }
}

export default async function AdsPage() {
  const ads = await getDocuments<AdConfig>('ads');

  return (
    <div className="container mx-auto py-10">
       <div>
        <h1 className="text-3xl font-bold">Advertisements</h1>
        <p className="text-muted-foreground">Manage ads displayed on your site.</p>
      </div>
      <div className="mt-6">
        <AdsEditor
          initialAds={ads}
          onSave={saveAd}
          onDelete={deleteAd}
        />
      </div>
    </div>
  );
}

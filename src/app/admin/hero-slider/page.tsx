
import { getDocuments, addDocument, updateDocument, deleteDocument } from '@/app/actions/firestoreActions';
import HeroSliderEditor from './_components/HeroSliderEditor';
import { revalidatePath } from 'next/cache';

export interface SlideConfig {
  id: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  status: 'active' | 'inactive';
}

async function saveSlide(slide: SlideConfig) {
  'use server';
  try {
    const data = { ...slide };
    // Don't save the id field itself in the document data
    delete (data as any).id;

    if (slide.id) {
      await updateDocument('heroSlides', slide.id, data);
    } else {
      await addDocument('heroSlides', data);
    }
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Failed to save slide' };
  }
}

async function deleteSlide(id: string) {
  'use server';
  try {
    await deleteDocument('heroSlides', id);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Failed to delete slide' };
  }
}

export default async function HeroSliderPage() {
  const slides = await getDocuments<SlideConfig>('heroSlides');

  return (
    <div className="container mx-auto py-10">
       <div>
        <h1 className="text-3xl font-bold">Hero Slider</h1>
        <p className="text-muted-foreground">Manage the slides on your homepage hero section.</p>
      </div>
      <div className="mt-6">
        <HeroSliderEditor
          initialSlides={slides}
          onSave={saveSlide}
          onDelete={deleteSlide}
        />
      </div>
    </div>
  );
}

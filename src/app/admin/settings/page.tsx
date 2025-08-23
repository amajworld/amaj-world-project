
import { getDocument, setDocument } from '@/app/actions/firestoreActions';
import SettingsForm from './_components/SettingsForm';
import { revalidatePath } from 'next/cache';

export interface SiteSettings {
  siteName?: string;
  siteDescription?: string;
  logoUrl?: string;
}

async function saveSettings(settings: SiteSettings) {
  'use server';
  try {
    await setDocument('site-data', 'settings', settings);
    // Revalidate home and layout to reflect changes
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (error) {
    console.error('Failed to save settings:', error);
    return { success: false, message: 'Could not save settings.' };
  }
}

export default async function SettingsPage() {
  const settings = await getDocument<SiteSettings>('site-data', 'settings');

  return (
    <div className="container mx-auto py-10">
      <div>
        <h1 className="text-3xl font-bold">Site Settings</h1>
        <p className="text-muted-foreground">Manage your site-wide settings here.</p>
      </div>
      <div className="mt-6">
        <SettingsForm initialSettings={settings} onSave={saveSettings} />
      </div>
    </div>
  );
}

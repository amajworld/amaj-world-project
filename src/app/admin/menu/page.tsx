
import MenuEditor from './_components/MenuEditor';
import { getDocument, setDocument } from '@/app/actions/firestoreActions';

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  children?: MenuItem[];
}

async function saveMenu(menuData: MenuItem[]) {
  'use server';
  try {
    await setDocument('site-data', 'menu', { data: menuData });
    console.log('Menu saved successfully');
  } catch (error) {
    console.error('Failed to save menu:', error);
    throw new Error('Could not save menu to the database.');
  }
}

export default async function MenuPage() {
    // The type assertion is needed because getDocument is now generic
    const menuDoc = await getDocument<{data: MenuItem[]}>('site-data', 'menu');
    const menuData = menuDoc?.data || [];

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Menu Editor</h1>
          <p className="text-muted-foreground">Drag and drop to reorder and nest menu items.</p>
        </div>
      </div>
      <MenuEditor initialItems={menuData} onSave={saveMenu} />
    </div>
  );
}

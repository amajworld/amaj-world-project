
export type Post = {
  id: string;
  slug: string;
  title: string;
  content: string; // HTML content
  imageUrl: string;
  category: string; // Should match a menu href
  date: any; // Firestore timestamp or string
  status: 'published' | 'draft' | 'scheduled';
  scheduledAt?: any; // Firestore timestamp or string
  dataAiHint?: string;
  href?: string; // This is a client-side addition, should not be stored
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
  views?: number; // For tracking top posts
};

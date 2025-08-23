
export type Post = {
  id: string;
  slug: string;
  title: string;
  content: string; // HTML content
  imageUrl: string;
  category: string; // Should match a menu href
  date: string | Date; // Should be in ISO 8601 format
  status: 'published' | 'draft' | 'scheduled';
  scheduledAt?: string; // ISO 8601 date string
  dataAiHint?: string;
  href?: string; // This is a client-side addition, should not be stored
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
  views?: number; // For tracking top posts
};

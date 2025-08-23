
export type AdConfig = {
  id: string;
  name: string;
  type: 'image' | 'code';
  content: string; // URL for image, code string for code
  link?: string; // Click-through link for image ads
  location: 'home-top' | 'post-bottom';
  status: 'active' | 'inactive';
};

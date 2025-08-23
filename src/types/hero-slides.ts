
export type SlideConfig = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  buttonText?: string;
  buttonLink?: string;
  status: 'active' | 'inactive';
};

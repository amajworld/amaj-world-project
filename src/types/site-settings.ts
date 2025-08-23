
export type SiteSettings = {
  siteName?: string;
  siteDescription?: string;
  logoUrl?: string;
};

export type SocialLink = {
  id: string;
  platform: 'Facebook' | 'Twitter' | 'Instagram' | 'Linkedin' | 'Youtube';
  url: string;
};

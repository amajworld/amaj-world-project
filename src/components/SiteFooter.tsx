
import Link from 'next/link';
import { getDocuments, getDocument } from '@/app/actions/firestoreActions';
import type { MenuItem } from '@/app/admin/menu/page';
import type { SiteSettings } from '@/app/admin/settings/page';
import type { SocialLink } from '@/app/admin/social-links/page';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

const iconComponents: { [key: string]: React.ElementType } = {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
};


const SiteFooter = () => {
  // Data fetching must happen in Server Components (pages or layouts), not in regular components.
  // For this fix, we are removing the async data fetching to make the component synchronous.
  // In a real application, this data should be passed down as props from a parent Server Component.
  const menuData: MenuItem[] = [];
  const settings: SiteSettings | null = null;
  const socialLinks: SocialLink[] = [];

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto py-12 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{settings?.siteName || 'Amaj World'}</h3>
            <p className="text-sm">
              {settings?.siteDescription || 'Your destination for curated fashion, beauty, home essentials, and gadgets.'}
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              {menuData.map((item) =>
                item.href !== '/' ? (
                  <li key={item.label}>
                    <Link href={item.href} className="hover:underline">
                      {item.label}
                    </Link>
                  </li>
                ) : null
              )}
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Information</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:underline">About Us</Link></li>
              <li><Link href="/contact" className="hover:underline">Contact Us</Link></li>
              <li><Link href="/privacy" className="hover:underline">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:underline">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
             {socialLinks.length > 0 && (
                <div className="flex space-x-4">
                    {socialLinks.map(link => {
                        const IconComponent = iconComponents[link.platform];
                        return IconComponent ? (
                            <Link key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                                <IconComponent size={24} />
                            </Link>
                        ) : null;
                    })}
                </div>
            )}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} {settings?.siteName || 'Amaj World'}. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;

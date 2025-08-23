import Link from 'next/link';
import { Facebook, Twitter, Instagram } from 'lucide-react';

const SiteFooter = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto py-12 px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Amaj World</h3>
            <p className="text-sm">
              Your destination for curated fashion, beauty, home essentials, and gadgets.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:underline">Home</Link></li>
              <li><Link href="/about" className="hover:underline">About Us</Link></li>
              <li><Link href="/contact" className="hover:underline">Contact</Link></li>
              <li><Link href="/all-posts" className="hover:underline">All Posts</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:underline">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:underline">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <Link href="#" className="hover:text-primary">
                <Facebook size={24} />
              </Link>
              <Link href="#" className="hover:text-primary">
                <Twitter size={24} />
              </Link>
              <Link href="#" className="hover:text-primary">
                <Instagram size={24} />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Amaj World. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;

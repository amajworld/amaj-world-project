
'use client';

import { Bot } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function TermsOfServicePage() {
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    // This code runs only on the client, after the initial render.
    // This prevents a hydration mismatch between server and client.
    setLastUpdated(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Header Section */}
        <div className="text-center mb-16">
            <Bot className="mx-auto h-16 w-16 text-indigo-600 mb-4" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
                Terms of Service
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Please read these terms carefully before using our service.
            </p>
        </div>

        {/* Terms Content */}
        <div className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
            <p className="lead">Welcome to Amaj World ("we," "our," or "us"). By accessing or using our website (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, then you may not access the Service.</p>

            <h2>1. Acceptance of Terms</h2>
            <p>By using our Service, you confirm that you have read, understood, and agree to these Terms. We may update these Terms from time to time. Your continued use of the Service after any changes constitutes your acceptance of the new Terms.</p>

            <h2>2. Use of the Website</h2>
            <p>You agree to use the Service for lawful purposes only. You are prohibited from using the site:</p>
            <ul>
                <li>For any unlawful purpose.</li>
                <li>To solicit others to perform or participate in any unlawful acts.</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances.</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others.</li>
            </ul>

            <h2>3. Intellectual Property</h2>
            <p>All content on this website, including text, graphics, logos, images, and software, is the property of Amaj World or its content suppliers and is protected by international copyright laws. You may not reproduce, distribute, or create derivative works from any content on this site without our express written permission.</p>

            <h2>4. Affiliate Disclosure</h2>
            <p>Amaj World is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com. This means that we may earn a commission if you click on or make purchases via affiliate links. Our reviews and recommendations are based on our own research and opinion, and we are not compensated for positive reviews.</p>

            <h2>5. Limitation of Liability</h2>
            <p>In no event shall Amaj World, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
            
            <h2>6. Governing Law</h2>
            <p>These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which our company is based, without regard to its conflict of law provisions.</p>

            <h2>7. Changes to Terms</h2>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page. It is your responsibility to review these Terms periodically for changes.</p>

            <h2>8. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us through our <a href="/contact">Contact Page</a>.</p>
            
            {lastUpdated && <p><em>Last updated: {lastUpdated}</em></p>}
        </div>

      </div>
    </div>
  );
}

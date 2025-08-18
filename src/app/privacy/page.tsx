
import { Bot } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Header Section */}
        <div className="text-center mb-16">
            <Bot className="mx-auto h-16 w-16 text-indigo-600 mb-4" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
                Privacy Policy
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Your privacy is important to us.
            </p>
        </div>

        {/* Privacy Content */}
        <div className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
            <p className="lead">This Privacy Policy describes how Amaj World ("we," "our," or "us") collects, uses, and discloses your information. By using our website (the "Service"), you agree to the collection and use of information in accordance with this policy.</p>

            <h2>1. Information Collection and Use</h2>
            <p>We may collect several different types of information for various purposes to provide and improve our Service to you. This may include, but is not limited to, usage data and cookies.</p>
            
            <h3>Usage Data</h3>
            <p>We may automatically collect information on how the Service is accessed and used ("Usage Data"). This Usage Data may include information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</p>
            
            <h3>Cookies</h3>
            <p>We use cookies and similar tracking technologies to track the activity on our Service and we hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>

            <h2>2. Affiliate Disclosure</h2>
            <p>Our Service is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com. When you click on and/or make a purchase through an affiliate link placed on our website, we may receive a small commission at no additional cost to you.</p>

            <h2>3. Use of Data</h2>
            <p>Amaj World uses the collected data for various purposes:</p>
            <ul>
                <li>To provide and maintain our Service</li>
                <li>To notify you about changes to our Service</li>
                <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
                <li>To provide analysis or valuable information so that we can improve the Service</li>
                <li>To monitor the usage of the Service</li>
                <li>To detect, prevent and address technical issues</li>
            </ul>

            <h2>4. Security of Data</h2>
            <p>The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.</p>

            <h2>5. Links to Other Sites</h2>
            <p>Our Service may contain links to other sites that are not operated by us. If you click a third party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.</p>

            <h2>6. Changes to This Privacy Policy</h2>
            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>

            <h2>7. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us through our <a href="/contact">Contact Page</a>.</p>
            
            <p><em>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</em></p>
        </div>

      </div>
    </div>
  );
}

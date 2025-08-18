
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Send, Facebook, Twitter, Instagram, Linkedin, User } from 'lucide-react';
import Link from 'next/link';

const socialLinks = [
  { icon: Facebook, href: '#', 'aria-label': 'Facebook' },
  { icon: Twitter, href: '#', 'aria-label': 'Twitter' },
  { icon: Instagram, href: '#', 'aria-label': 'Instagram' },
  { icon: Linkedin, href: '#', 'aria-label': 'LinkedIn' },
];

export default function ContactPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Header Section */}
        <div className="text-center mb-16">
            <Mail className="mx-auto h-16 w-16 text-indigo-600 mb-4" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
                Get in Touch
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                We'd love to hear from you! Whether you have a question, feedback, or just want to say hello, feel free to reach out.
            </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-12">
            
            {/* Contact Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Send us a Message</CardTitle>
                    <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" placeholder="m@example.com" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input id="subject" placeholder="Question about a product" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Your Message</Label>
                            <Textarea id="message" placeholder="Type your message here..." rows={5} />
                        </div>
                        <Button type="submit" className="w-full">
                            <Send className="mr-2 h-4 w-4" /> Send Message
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
                <div className="p-6 border rounded-lg">
                    <h3 className="text-2xl font-bold text-primary mb-4">Contact Information</h3>
                    <div className="space-y-4 text-muted-foreground">
                        <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-indigo-500" />
                            <span>support@amajworld.com</span>
                        </div>
                         <div className="flex items-center space-x-3">
                            <Phone className="h-5 w-5 text-indigo-500" />
                            <span>+1 (555) 123-4567</span>
                        </div>
                         <div className="flex items-start space-x-3">
                            <MapPin className="h-5 w-5 text-indigo-500 mt-1" />
                            <span>123 Amazon Lane, Suite 100<br />Internet City, Web 54321</span>
                        </div>
                    </div>
                </div>
                <div className="p-6 border rounded-lg">
                    <h3 className="text-2xl font-bold text-primary mb-4">Follow Us</h3>
                    <p className="text-muted-foreground mb-4">Stay connected with us on social media for the latest updates and deals.</p>
                     <div className="flex space-x-4">
                        {socialLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link key={link['aria-label']} href={link.href} className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                                    <span className="sr-only">{link['aria-label']}</span>
                                    <Icon className="h-6 w-6" />
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
}

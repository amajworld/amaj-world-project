
import { Bot, Target, Lightbulb, Users } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Header Section */}
        <div className="text-center mb-16">
            <Bot className="mx-auto h-16 w-16 text-indigo-600 mb-4" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
                About Amaj World
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Your ultimate guide to discovering the best of Amazon. We're dedicated to helping you shop smarter, not harder.
            </p>
        </div>

        {/* Core Values Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            <div className="text-center p-6 border border-border rounded-lg shadow-sm hover:shadow-lg transition-shadow">
                <Target className="mx-auto h-12 w-12 text-indigo-500 mb-4" />
                <h2 className="text-2xl font-bold text-primary mb-2">Our Mission</h2>
                <p className="text-muted-foreground">
                    Our mission is simple: to bring you the best-curated Amazon product reviews, top deals, and viral gadgets. We sift through millions of products, so you don't have to.
                </p>
            </div>
            <div className="text-center p-6 border border-border rounded-lg shadow-sm hover:shadow-lg transition-shadow">
                <Lightbulb className="mx-auto h-12 w-12 text-indigo-500 mb-4" />
                <h2 className="text-2xl font-bold text-primary mb-2">What We Do</h2>
                <p className="text-muted-foreground">
                    From the latest fashion picks and home essentials to pet accessories and trending gadgets, we cover it all. Our team finds and reviews products to ensure you get the best value.
                </p>
            </div>
             <div className="text-center p-6 border border-border rounded-lg shadow-sm hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
                <Users className="mx-auto h-12 w-12 text-indigo-500 mb-4" />
                <h2 className="text-2xl font-bold text-primary mb-2">Why Choose Us?</h2>
                <p className="text-muted-foreground">
                    We provide honest, unbiased reviews and daily updates. Our dedicated team is passionate about finding quality products to make your life easier and more enjoyable.
                </p>
            </div>
        </div>

        {/* Join Community Section */}
        <div className="text-center bg-gray-100 dark:bg-gray-800 p-10 rounded-lg">
            <h2 className="text-3xl font-bold text-primary mb-4">Join Our Community</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Stay updated with the latest trends, deals, and must-have products by following us on our social media channels. Become a part of the Amaj World family today!
            </p>
            <div className="flex justify-center space-x-4">
                <a href="#" className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.013-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.345 2.525c.636-.247 1.363-.416 2.427-.465C9.793 2.013 10.148 2 12.315 2zM12 7a5 5 0 100 10 5 5 0 000-10zm0-2a7 7 0 110 14 7 7 0 010-14zm6.406-2.34a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" clipRule="evenodd" /></svg>
                </a>
            </div>
        </div>

      </div>
    </div>
  );
}

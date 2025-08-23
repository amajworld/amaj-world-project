
import { getDocuments, getDocument } from '@/app/actions/firestoreActions';
import type { Post } from '@/data/posts';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import { Calendar, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import RelatedPosts from '@/components/RelatedPosts';
import AdDisplay from '@/components/AdDisplay';
import type { AdConfig } from '@/app/admin/ads/page';

export async function generateStaticParams() {
  const posts = await getDocuments<Post>('posts', { where: [['status', '==', 'published']] });
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const allPosts = await getDocuments<Post>('posts');
    const post = allPosts.find(p => p.slug === params.slug);

    if (!post) {
        return {
            title: 'Post Not Found',
        };
    }

    return {
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.content.substring(0, 160).replace(/<[^>]+>/g, ''),
        openGraph: {
            title: post.seoTitle || post.title,
            description: post.seoDescription || post.content.substring(0, 160).replace(/<[^>]+>/g, ''),
            images: [
                {
                    url: post.imageUrl,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                },
            ],
        },
    };
}


const getCategoryName = (path: string) => {
    if (!path) return 'General';
    const segments = path.split('/').filter(Boolean);
    const name = segments.pop()?.replace(/-/g, ' ') || 'General';
    return name.charAt(0).toUpperCase() + name.slice(1);
};


export default async function PostPage({ params }: { params: { slug: string } }) {
  const allPosts = await getDocuments<Post>('posts');
  const post = allPosts.find(p => p.slug === params.slug);

  if (!post || post.status !== 'published') {
    notFound();
  }
  
  const ads = await getDocuments<AdConfig>('ads', { where: [['status', '==', 'active']]});
  const bottomAd = ads.find(ad => ad.location === 'post-bottom');

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <article className="max-w-4xl mx-auto bg-card p-6 rounded-lg shadow-md">
        <div className="mb-6">
            <Badge variant="secondary" className="mb-2">{getCategoryName(post.category)}</Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{post.title}</h1>
            <div className="flex items-center text-muted-foreground text-sm space-x-4">
                <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{format(new Date(post.date), 'MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    <span>By Admin</span>
                </div>
            </div>
        </div>
        
        {post.imageUrl && (
            <div className="relative w-full h-96 mb-6">
                <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                />
            </div>
        )}

        <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags && post.tags.length > 0 && (
            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                </div>
            </div>
        )}

      </article>

      {bottomAd && (
        <div className="max-w-4xl mx-auto mt-8">
            <AdDisplay ad={bottomAd} />
        </div>
      )}

      <div className="max-w-4xl mx-auto mt-12">
        <RelatedPosts currentPostId={post.id} category={post.category} />
      </div>
    </div>
  );
}

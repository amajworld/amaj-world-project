import { notFound } from 'next/navigation';
import type { Post } from '@/data/posts';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import AdBanner from '@/components/AdBanner';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { getDocuments } from '@/app/actions/firestoreActions';
import type { Metadata, ResolvingMetadata } from 'next';

// This function tells Next.js which slugs to pre-render at build time
export async function generateStaticParams() {
  // When using dynamic server, we don't need to pre-render static paths
  return [];
}

async function getPost(slug: string): Promise<Post | null> {
    if (!slug) return null;
    const posts = await getDocuments<Post>('posts');
    const foundPost = posts.find(p => p.slug === slug && p.status === 'published');
    return foundPost || null;
}

// Generate dynamic metadata for each post page
export async function generateMetadata(
  { params }: { params: { slug: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || 'Read this exciting post on Amaj World.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
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


export default async function PostPage({ params }: { params: { slug: string }}) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <main className="lg:col-span-8">
            <AdBanner adName="post-top-banner" location="top-banner" className="w-full flex justify-center" />
            <Card>
                <CardContent className="p-6 md:p-8">
                    <article className="prose dark:prose-invert max-w-full">
                      <header className="mb-8">
                        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{post.title}</h1>
                      </header>
                      <div dangerouslySetInnerHTML={{ __html: post.content }} />
                       {post.tags && post.tags.length > 0 && (
                        <div className="mt-12 pt-6 border-t">
                          <h3 className="text-lg font-semibold mb-2">Tags:</h3>
                          <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag) => (<Badge key={tag} variant="secondary">{tag}</Badge>))}
                          </div>
                        </div>
                      )}
                    </article>
                </CardContent>
            </Card>
        </main>
         <aside className="lg:col-span-4">
            <Sidebar />
        </aside>
      </div>
    </div>
  );
}

    
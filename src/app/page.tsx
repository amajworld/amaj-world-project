
import PostCard from '@/components/PostCard';
import { getDocuments } from '@/app/actions/firestoreActions';
import type { Post } from '@/data/posts';
import HeroSlider from '@/components/HeroSlider';
import { AdConfig } from './admin/ads/page';
import AdDisplay from '@/components/AdDisplay';
import { SlideConfig } from './admin/hero-slider/page';

export default async function Home() {
  const allPosts = await getDocuments<Post>('posts', {
    where: [['status', '==', 'published']],
    orderBy: ['date', 'desc'],
    limit: 12,
  });

  const slides = await getDocuments<SlideConfig>('heroSlides', { where: [['status', '==', 'active']]});
  const ads = await getDocuments<AdConfig>('ads', { where: [['status', '==', 'active']]});

  const topAd = ads.find(ad => ad.location === 'home-top');
  
  return (
    <div className="flex flex-col">
      {slides.length > 0 && <HeroSlider slides={slides} />}
       {topAd && <AdDisplay ad={topAd} />}
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Latest Posts</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allPosts.map((post) => (
            <PostCard key={post.id} post={{...post, href: `/posts/${post.slug}`}} />
          ))}
        </div>
      </div>
    </div>
  );
}


import { getDocuments } from '@/app/actions/firestoreActions';
import type { MenuItem } from '@/app/admin/menu/page';
import type { Post } from '@/data/posts';
import { notFound } from 'next/navigation';
import type { Metadata, ResolvingMetadata } from 'next';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import AdBanner from '@/components/AdBanner';
import CategoryView from './CategoryView';
import { menuData as initialMenuData } from '@/data/menu';


const POSTS_PER_PAGE_INITIAL = 15;
const POSTS_PER_PAGE_SECONDARY = 18;
const TOP_POSTS_COUNT = 9;


// Helper function to find the current category from the menu structure
function findCategory(path: string, menu: MenuItem[]): MenuItem | null {
    for (const item of menu) {
        if (item.href === path) {
            return item;
        }
        if (item.children) {
            const foundChild = findCategory(path, item.children);
            if (foundChild) {
                return foundChild;
            }
        }
    }
    return null;
}

// Generate dynamic metadata for category pages
export async function generateMetadata(
  { params }: { params: { category: string[] } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const categoryPath = `/${params.category.join('/')}`;
  
  const menuDocResult = await getDocuments<{data: MenuItem[]}>('site-data');
  const serverMenuData = menuDocResult.find(m => m.id === 'menu')?.data || initialMenuData;
  
  const category = findCategory(categoryPath, serverMenuData as MenuItem[]);

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  const title = `${category.label} - Amaj World`;
  const description = `Browse all posts in the ${category.label} category on Amaj World. Find the best deals, reviews, and guides for ${category.label}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}


async function getCategoryData(category: MenuItem) {
  // This array will hold all hrefs that should be considered for this category page.
  let categoryHrefs: string[];
  const isParentCategory = category.children && category.children.length > 0;

  if (isParentCategory) {
    // For a main category, it includes itself and all its children.
    categoryHrefs = [category.href, ...(category.children?.map(c => c.href) || [])];
  } else {
    // For a sub-category, it just includes itself.
    categoryHrefs = [category.href];
  }
  
  // Fetch posts specifically for the categories needed.
  const categoryPosts = await getDocuments<Post>('posts', {
    where: [
      ['status', '==', 'published'],
      ['category', 'in', categoryHrefs]
    ],
    orderBy: ['date', 'desc'],
  });
  
  // Sort all posts for this category view by views to get the top ones.
  const topPosts = [...categoryPosts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, TOP_POSTS_COUNT);

  const topPostIds = new Set(topPosts.map(p => p.id));
  
  // The rest of the posts are those not in the top posts list.
  const otherPosts = categoryPosts.filter(p => !topPostIds.has(p.id));
  
  const initialPosts = otherPosts.slice(0, POSTS_PER_PAGE_INITIAL);
  const remainingPosts = otherPosts.slice(POSTS_PER_PAGE_INITIAL);

  return { initialPosts, topPosts, remainingPosts };
}


export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { category: string[] };
  searchParams?: { [key:string]: string | string[] | undefined };
}) {
  const categoryPath = `/${params.category.join('/')}`;
  
  const menuDoc = await getDocuments<{data: MenuItem[]}>('site-data');
  const menuData = menuDoc.find(m => m.id === 'menu')?.data || initialMenuData;

  const category = findCategory(categoryPath, menuData as MenuItem[]);

  if (!category) {
    notFound();
  }
  
  const currentPage = Number(searchParams?.['page'] || '1');
  const { initialPosts, topPosts, remainingPosts } = await getCategoryData(category);

  const paginatedPosts = remainingPosts.slice(
    (currentPage - 2) * POSTS_PER_PAGE_SECONDARY,
    (currentPage - 1) * POSTS_PER_PAGE_SECONDARY
  );
  
  const totalPages = Math.ceil(remainingPosts.length / POSTS_PER_PAGE_SECONDARY) + 1;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdBanner adName="post-top-banner" location="top-banner" className="w-full flex justify-center" />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{category.label}</h1>
            <p className="mt-4 text-xl text-muted-foreground">
              Showing posts in the {category.label} category.
            </p>
          </div>
          
            <CategoryView 
                initialPosts={initialPosts}
                topPosts={topPosts}
                paginatedPosts={paginatedPosts}
                currentPage={currentPage}
                totalPages={totalPages}
            />

        </div>
        <aside className="lg:col-span-1">
            <Sidebar />
        </aside>
      </div>
    </div>
  );
}

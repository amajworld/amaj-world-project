import type { Post } from '@/data/posts';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const postDate = typeof post.date === 'string' ? new Date(post.date) : post.date;
  
  // A simple function to get category name from path
  const getCategoryName = (path: string) => {
    if (!path) return 'General';
    const segments = path.split('/').filter(Boolean);
    const name = segments.pop()?.replace(/-/g, ' ') || 'General';
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // Basic HTML tag stripping
  const getSnippet = (htmlContent: string, length = 100) => {
      const text = htmlContent.replace(/<[^>]+>/g, '');
      return text.length > length ? text.substring(0, length) + '...' : text;
  }

  return (
    <Card className="flex flex-col h-full overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
      {post.imageUrl && (
        <Link href={post.href || '#'} className="block">
            <div className="relative w-full h-48">
                <Image
                    src={post.imageUrl}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                    data-ai-hint={post.dataAiHint}
                />
            </div>
        </Link>
      )}
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
            <Badge variant="secondary">{getCategoryName(post.category)}</Badge>
        </div>
        <CardTitle className="text-lg font-bold leading-snug">
          <Link href={post.href || '#'} className="hover:text-primary">
            {post.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">
          {getSnippet(post.content)}
        </p>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          {format(postDate, 'MMMM d, yyyy')}
        </p>
      </CardFooter>
    </Card>
  );
};

export default PostCard;

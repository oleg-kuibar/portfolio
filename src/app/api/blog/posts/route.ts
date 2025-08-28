import { NextRequest, NextResponse } from 'next/server';
import {
  getAllBlogPosts,
  getFeaturedBlogPosts,
  getBlogPostsByCategory,
  getBlogPostsByTag,
  searchBlogPosts,
} from '@/features/blog/utils/blog-utils';
import { BlogCategory } from '@/features/blog/types/blog';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'all';
    const category = searchParams.get('category') as BlogCategory;
    const tag = searchParams.get('tag');
    const query = searchParams.get('query');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    let posts;

    switch (action) {
      case 'featured':
        posts = await getFeaturedBlogPosts(limit);
        break;
      case 'category':
        if (!category) {
          return NextResponse.json({ error: 'Category parameter required' }, { status: 400 });
        }
        posts = await getBlogPostsByCategory(category);
        break;
      case 'tag':
        if (!tag) {
          return NextResponse.json({ error: 'Tag parameter required' }, { status: 400 });
        }
        posts = await getBlogPostsByTag(tag);
        break;
      case 'search':
        if (!query) {
          return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
        }
        posts = await searchBlogPosts(query);
        break;
      case 'all':
      default:
        posts = await getAllBlogPosts();
        break;
    }

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

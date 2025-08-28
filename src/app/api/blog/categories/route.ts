import { NextResponse } from 'next/server';
import { getAllBlogCategories } from '@/features/blog/utils/blog-utils';

export async function GET() {
  try {
    const categories = await getAllBlogCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog categories' },
      { status: 500 }
    );
  }
}

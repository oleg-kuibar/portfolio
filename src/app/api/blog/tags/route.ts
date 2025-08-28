import { NextResponse } from 'next/server';
import { getAllBlogTags } from '@/features/blog/utils/blog-utils';

export async function GET() {
  try {
    const tags = await getAllBlogTags();
    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Error fetching blog tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog tags' },
      { status: 500 }
    );
  }
}

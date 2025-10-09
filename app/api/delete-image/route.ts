import { NextRequest, NextResponse } from 'next/server';
import { deleteFromR2 } from '@/lib/r2';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No image URL provided' },
        { status: 400 }
      );
    }

    // Extract the key from the full URL
    // URL format: https://domain.com/boards/timestamp-random.ext
    const urlParts = imageUrl.split('/');
    const key = urlParts.slice(-2).join('/'); // Get "boards/filename.ext"

    console.log(`Deleting image with key: ${key}`);

    await deleteFromR2(key);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete image';
    return NextResponse.json(
      { error: errorMessage, details: String(error) },
      { status: 500 }
    );
  }
}

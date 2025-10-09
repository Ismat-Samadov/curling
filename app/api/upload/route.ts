import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2, generateImageKey } from '@/lib/r2';

// Configure route to accept larger payloads
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    console.log(`Uploading ${files.length} files...`);

    const uploadPromises = files.map(async (file) => {
      console.log(`Uploading file: ${file.name}, size: ${file.size} bytes`);
      const key = generateImageKey('boards', file.name);
      const url = await uploadToR2(file, key);
      console.log(`Uploaded to: ${url}`);
      return url;
    });

    const urls = await Promise.all(uploadPromises);

    return NextResponse.json({ urls });
  } catch (error) {
    console.error('Error uploading files:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload files';
    return NextResponse.json(
      { error: errorMessage, details: String(error) },
      { status: 500 }
    );
  }
}

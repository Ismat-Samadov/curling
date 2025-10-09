import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });

    // Delete auth cookie
    response.cookies.delete('user_id');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Çıxış zamanı xəta baş verdi' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get the user ID from headers (sent by client)
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user exists and is active
    const user = await db.user.findUnique({
      where: {
        id: userId,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user,
      isAuthenticated: true,
    });
  } catch (error) {
    console.error('Auth verify error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

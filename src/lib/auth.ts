import { NextRequest } from 'next/server';
import { db } from '@/lib/db';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'CLIENT';
  phone?: string;
}

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    // Get user ID from headers (sent by client)
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return null;
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

    return user;
  } catch (error) {
    console.error('Get auth user error:', error);
    return null;
  }
}

export function requireAuth(request: NextRequest) {
  const userId = request.headers.get('x-user-id');

  if (!userId) {
    throw new Error('Unauthorized');
  }

  return userId;
}

export function requireAdmin(request: NextRequest) {
  const userId = request.headers.get('x-user-id');

  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Note: In a real implementation, we'd verify the role from DB
  // For now, the middleware handles role-based access
  return userId;
}

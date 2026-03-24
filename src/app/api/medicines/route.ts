import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const medicines = await db.medicine.findMany({
      include: {
        batches: {
          orderBy: { expiryDate: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ medicines });
  } catch (error) {
    console.error('Fetch medicines error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

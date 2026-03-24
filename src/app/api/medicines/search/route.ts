import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ medicines: [] });
    }

    const medicines = await db.medicine.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { brand: { contains: query, mode: 'insensitive' } },
          { composition: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        batches: {
          where: {
            quantity: { gt: 0 },
            expiryDate: { gt: new Date() },
          },
          orderBy: { expiryDate: 'asc' },
        },
      },
      take: 20,
    });

    // Filter medicines that have available batches
    const availableMedicines = medicines
      .filter((m) => m.batches.length > 0)
      .map((m) => ({
        id: m.id,
        name: m.name,
        brand: m.brand,
        composition: m.composition,
        batches: m.batches.map((b) => ({
          id: b.id,
          batchNumber: b.batchNumber,
          expiryDate: b.expiryDate,
          mrp: b.mrp,
          sellingPrice: b.sellingPrice,
          quantity: b.quantity,
        })),
      }));

    return NextResponse.json({ medicines: availableMedicines });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

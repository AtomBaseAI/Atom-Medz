import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const daysParam = searchParams.get('days') || '30';
    const days = parseInt(daysParam);

    const today = new Date();
    let startDate, endDate;

    if (daysParam === 'expired') {
      // Already expired
      endDate = today;
      startDate = new Date(today);
      startDate.setFullYear(startDate.getFullYear() - 1); // Last year
    } else {
      // Expiring in next X days
      startDate = today;
      endDate = new Date(today);
      endDate.setDate(endDate.getDate() + days);
    }

    const batches = await db.medicineBatch.findMany({
      where: {
        quantity: { gt: 0 },
        expiryDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        medicine: true,
      },
      orderBy: {
        expiryDate: 'asc',
      },
    });

    const items = batches.map((batch) => {
      const expiryDate = new Date(batch.expiryDate);
      const daysToExpiry = Math.ceil(
        (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        id: batch.id,
        medicineName: batch.medicine.name,
        brand: batch.medicine.brand || '',
        batchNumber: batch.batchNumber,
        expiryDate: batch.expiryDate,
        quantity: batch.quantity,
        mrp: batch.mrp,
        sellingPrice: batch.sellingPrice,
        purchasePrice: batch.purchasePrice,
        daysToExpiry,
      };
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Fetch expiry data error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

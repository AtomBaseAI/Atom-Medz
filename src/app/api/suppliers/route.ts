import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const suppliers = await db.supplier.findMany({
      orderBy: { name: 'asc' },
    });

    // Get aggregated data for each supplier
    const suppliersWithStats = await Promise.all(
      suppliers.map(async (supplier) => {
        const totalPurchases = await db.stockEntry
          .aggregate({
            where: { supplierId: supplier.id },
            _sum: { totalAmount: true },
          })
          .then((result) => result._sum.totalAmount || 0);

        const lastPurchase = await db.stockEntry.findFirst({
          where: { supplierId: supplier.id },
          orderBy: { createdAt: 'desc' },
        });

        return {
          ...supplier,
          totalPurchases,
          pendingPayments: 0, // Would need payment tracking
          lastPurchase: lastPurchase?.createdAt,
        };
      })
    );

    return NextResponse.json({ suppliers: suppliersWithStats });
  } catch (error) {
    console.error('Fetch suppliers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create supplier
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const supplier = await db.supplier.create({
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email,
        address: body.address,
        gstin: body.gstin,
      },
    });

    return NextResponse.json({ supplier });
  } catch (error) {
    console.error('Create supplier error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

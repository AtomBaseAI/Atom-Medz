import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ bills: [] });
    }

    const bills = await db.bill.findMany({
      where: {
        isDraft: false,
        OR: [
          { invoiceNumber: { contains: query, mode: 'insensitive' } },
          { customer: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: {
        customer: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const formattedBills = bills.map((bill) => ({
      id: bill.id,
      invoiceNumber: bill.invoiceNumber,
      customerName: bill.customer?.name,
      totalAmount: bill.roundedAmount,
      createdAt: bill.createdAt,
      items: bill.items.map((item) => ({
        id: item.id,
        medicineName: item.medicine.name,
        batchNumber: item.batch.batchNumber,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
      })),
    }));

    return NextResponse.json({ bills: formattedBills });
  } catch (error) {
    console.error('Search bills error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

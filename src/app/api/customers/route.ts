import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const customers = await db.customer.findMany({
      orderBy: { name: 'asc' },
    });

    // Get aggregated data for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const totalPurchases = await db.bill
          .aggregate({
            where: { customerId: customer.id },
            _sum: { roundedAmount: true },
          })
          .then((result) => result._sum.roundedAmount || 0);

        const totalCredit = await db.credit
          .aggregate({
            where: { customerId: customer.id, type: 'CREDIT' },
            _sum: { amount: true },
          })
          .then((result) => result._sum.amount || 0);

        const payments = await db.credit
          .aggregate({
            where: { customerId: customer.id, type: 'PAYMENT' },
            _sum: { amount: true },
          })
          .then((result) => result._sum.amount || 0);

        const lastBill = await db.bill.findFirst({
          where: { customerId: customer.id },
          orderBy: { createdAt: 'desc' },
        });

        return {
          ...customer,
          totalPurchases,
          totalCredit: totalCredit - payments,
          lastPurchase: lastBill?.createdAt,
        };
      })
    );

    return NextResponse.json({ customers: customersWithStats });
  } catch (error) {
    console.error('Fetch customers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const customer = await db.customer.create({
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email,
        address: body.address,
        gstin: body.gstin,
      },
    });

    return NextResponse.json({ customer });
  } catch (error) {
    console.error('Create customer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

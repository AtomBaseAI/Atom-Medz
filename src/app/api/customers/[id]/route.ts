import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET single customer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await db.customer.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { bills: true, credits: true },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const totalPurchases = await db.bill
      .aggregate({
        where: { customerId: params.id },
        _sum: { roundedAmount: true },
      })
      .then((result) => result._sum.roundedAmount || 0);

    const totalCredit = await db.credit
      .aggregate({
        where: { customerId: params.id, type: 'CREDIT' },
        _sum: { amount: true },
      })
      .then((result) => result._sum.amount || 0);

    const payments = await db.credit
      .aggregate({
        where: { customerId: params.id, type: 'PAYMENT' },
        _sum: { amount: true },
      })
      .then((result) => result._sum.amount || 0);

    const lastBill = await db.bill.findFirst({
      where: { customerId: params.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      customer: {
        ...customer,
        totalPurchases,
        totalCredit: totalCredit - payments,
        lastPurchase: lastBill?.createdAt,
      },
    });
  } catch (error) {
    console.error('Fetch customer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const customer = await db.customer.update({
      where: { id: params.id },
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
    console.error('Update customer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.customer.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete customer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

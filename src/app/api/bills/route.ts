import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items,
      customerId,
      discount,
      paymentMode,
      notes,
      subtotal,
      cgst,
      sgst,
      totalAmount,
      roundedAmount,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in bill' },
        { status: 400 }
      );
    }

    // Get the current user (in a real app, get from session)
    const user = await db.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate invoice number
    const today = new Date();
    const invoicePrefix = `INV${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
    const lastBill = await db.bill.findFirst({
      where: { invoiceNumber: { startsWith: invoicePrefix } },
      orderBy: { invoiceNumber: 'desc' },
    });

    let sequence = 1;
    if (lastBill) {
      const lastSequence = parseInt(lastBill.invoiceNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    const invoiceNumber = `${invoicePrefix}${String(sequence).padStart(4, '0')}`;

    // Create bill
    const bill = await db.bill.create({
      data: {
        invoiceNumber,
        customerId: customerId || null,
        userId: user.id,
        subtotal,
        discount: discount || 0,
        cgst,
        sgst,
        totalAmount,
        roundedAmount,
        paymentMode,
        notes,
        items: {
          create: items.map((item: any) => ({
            medicineId: item.medicineId,
            batchId: item.batchId,
            mrp: item.mrp,
            quantity: item.quantity,
            rate: item.rate,
            discount: item.discount,
            gstPercentage: item.gstPercentage,
            cgst: item.cgst,
            sgst: item.sgst,
            amount: item.amount,
          })),
        },
      },
      include: {
        items: true,
        customer: true,
      },
    });

    // Update stock quantities
    for (const item of items) {
      await db.medicineBatch.update({
        where: { id: item.batchId },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      });
    }

    return NextResponse.json({ bill });
  } catch (error) {
    console.error('Create bill error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

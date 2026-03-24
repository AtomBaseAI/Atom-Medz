import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { originalBillId, items, refundAmount, refundMode, notes } = body;

    if (!originalBillId || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the original bill
    const originalBill = await db.bill.findUnique({
      where: { id: originalBillId },
      include: { customer: true },
    });

    if (!originalBill) {
      return NextResponse.json(
        { error: 'Original bill not found' },
        { status: 404 }
      );
    }

    // Get the current user
    const user = await db.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate return number
    const today = new Date();
    const returnPrefix = `RET${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
    const lastReturn = await db.return.findFirst({
      where: { returnNumber: { startsWith: returnPrefix } },
      orderBy: { returnNumber: 'desc' },
    });

    let sequence = 1;
    if (lastReturn) {
      const lastSequence = parseInt(lastReturn.returnNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    const returnNumber = `${returnPrefix}${String(sequence).padStart(4, '0')}`;

    // Create return
    const returnRecord = await db.return.create({
      data: {
        returnNumber,
        originalBillId,
        customerId: originalBill.customerId,
        refundAmount,
        refundMode,
        isStoreCredit: refundMode === 'CREDIT',
        notes,
        items: {
          create: items.map((item: any) => ({
            medicineId: item.medicineId,
            batchId: item.batchId,
            quantity: item.quantity,
            refundAmount: item.refundAmount,
          })),
        },
      },
      include: {
        items: true,
        customer: true,
      },
    });

    // Update stock quantities (add back returned items)
    for (const item of items) {
      await db.medicineBatch.update({
        where: { id: item.batchId },
        data: {
          quantity: {
            increment: item.quantity,
          },
        },
      });
    }

    // Mark original bill as returned
    await db.bill.update({
      where: { id: originalBillId },
      data: { isReturned: true },
    });

    return NextResponse.json({ return: returnRecord });
  } catch (error) {
    console.error('Create return error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

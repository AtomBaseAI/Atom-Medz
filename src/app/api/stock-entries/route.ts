import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      supplierId,
      invoiceNumber,
      items,
      notes,
      subtotal,
      cgst,
      sgst,
      total,
    } = body;

    if (!supplierId || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
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

    // Generate invoice number if not provided
    const finalInvoiceNumber = invoiceNumber || `PO${Date.now()}`;

    // Create stock entry
    const stockEntry = await db.stockEntry.create({
      data: {
        invoiceNumber: finalInvoiceNumber,
        supplierId,
        userId: user.id,
        subtotal,
        cgst,
        sgst,
        totalAmount: total,
        notes,
        items: {
          create: await Promise.all(
            items.map(async (item: any) => {
              // Create or update batch
              const batch = await db.medicineBatch.upsert({
                where: {
                  medicineId_batchNumber: {
                    medicineId: item.medicineId,
                    batchNumber: item.batchNumber,
                  },
                },
                update: {
                  quantity: {
                    increment: item.quantity,
                  },
                  purchasePrice: item.purchasePrice,
                  sellingPrice: item.sellingPrice,
                  expiryDate: new Date(item.expiryDate),
                },
                create: {
                  medicineId: item.medicineId,
                  batchNumber: item.batchNumber,
                  expiryDate: new Date(item.expiryDate),
                  mrp: item.sellingPrice * 1.2, // Default MRP as 20% above selling price
                  purchasePrice: item.purchasePrice,
                  sellingPrice: item.sellingPrice,
                  quantity: item.quantity,
                },
              });

              return {
                medicineId: item.medicineId,
                batchId: batch.id,
                quantity: item.quantity,
                purchasePrice: item.purchasePrice,
                sellingPrice: item.sellingPrice,
                gstPercentage: item.gstPercentage,
                cgst: item.cgst,
                sgst: item.sgst,
                amount: item.amount,
              };
            })
          ),
        },
      },
      include: {
        items: true,
        supplier: true,
      },
    });

    return NextResponse.json({ stockEntry });
  } catch (error) {
    console.error('Create stock entry error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

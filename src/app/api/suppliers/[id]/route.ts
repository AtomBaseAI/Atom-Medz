import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT update supplier
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const supplier = await db.supplier.update({
      where: { id: params.id },
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
    console.error('Update supplier error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE supplier
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.supplier.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete supplier error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

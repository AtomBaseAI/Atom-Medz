import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    let settings = await db.storeSettings.findFirst();

    if (!settings) {
      settings = await db.storeSettings.create({
        data: {
          id: 'default',
          storeName: 'Atom Medz',
          address: '',
          phone: '',
          gstin: '',
          drugLicenseNumber: '',
          footerMessage: 'Thank you! Visit Again!',
          defaultGst: 18,
          thermalPrinter: true,
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Fetch settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const settings = await db.storeSettings.upsert({
      where: { id: body.id || 'default' },
      update: {
        storeName: body.storeName,
        address: body.address,
        phone: body.phone,
        gstin: body.gstin,
        drugLicenseNumber: body.drugLicenseNumber,
        footerMessage: body.footerMessage,
        thermalPrinter: body.thermalPrinter,
      },
      create: {
        id: body.id || 'default',
        storeName: body.storeName,
        address: body.address,
        phone: body.phone,
        gstin: body.gstin,
        drugLicenseNumber: body.drugLicenseNumber,
        footerMessage: body.footerMessage,
        defaultGst: 18,
        thermalPrinter: body.thermalPrinter,
      },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Save settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

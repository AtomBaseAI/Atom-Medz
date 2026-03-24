import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@atommedz.com' },
    update: {},
    create: {
      email: 'admin@atommedz.com',
      password: 'admin123',
      name: 'Admin',
      role: 'ADMIN',
      phone: '9876543210',
      isActive: true,
    },
  });

  console.log('Created admin user:', admin);

  // Create client user
  const client = await prisma.user.upsert({
    where: { email: 'staff@atommedz.com' },
    update: {},
    create: {
      email: 'staff@atommedz.com',
      password: 'staff123',
      name: 'Staff User',
      role: 'CLIENT',
      phone: '9876543211',
      isActive: true,
    },
  });

  console.log('Created staff user:', client);

  // Create store settings
  const settings = await prisma.storeSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      storeName: 'Atom Medz',
      address: '123 Medical Street, Health City',
      phone: '9876543210',
      gstin: '29ABCDE1234F1Z5',
      drugLicenseNumber: 'DL/123/2024',
      footerMessage: 'Thank you! Visit Again!',
      defaultGst: 18,
      thermalPrinter: true,
    },
  });

  console.log('Created store settings:', settings);

  // Create sample medicines
  const medicines = [
    {
      name: 'Paracetamol 500mg',
      brand: 'Crocin',
      composition: 'Paracetamol 500mg',
      hsnCode: '3004',
      gstPercentage: 18,
      minQuantity: 50,
    },
    {
      name: 'Amoxicillin 500mg',
      brand: 'Novamox',
      composition: 'Amoxicillin 500mg',
      hsnCode: '3004',
      gstPercentage: 18,
      minQuantity: 30,
    },
    {
      name: 'Omeprazole 20mg',
      brand: 'Omez',
      composition: 'Omeprazole 20mg',
      hsnCode: '3004',
      gstPercentage: 18,
      minQuantity: 20,
    },
    {
      name: 'Metformin 500mg',
      brand: 'Glycomet',
      composition: 'Metformin 500mg',
      hsnCode: '3004',
      gstPercentage: 18,
      minQuantity: 100,
    },
    {
      name: 'Amlodipine 5mg',
      brand: 'Amlong',
      composition: 'Amlodipine 5mg',
      hsnCode: '3004',
      gstPercentage: 18,
      minQuantity: 40,
    },
  ];

  // Clear existing medicines
  await prisma.medicineBatch.deleteMany({});
  await prisma.medicine.deleteMany({});

  for (const medicine of medicines) {
    const created = await prisma.medicine.create({
      data: medicine,
    });

    // Create a batch for each medicine
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 2);

    await prisma.medicineBatch.create({
      data: {
        medicineId: created.id,
        batchNumber: `BATCH${Math.floor(Math.random() * 10000)}`,
        expiryDate,
        mrp: medicine.name.includes('500mg') ? 50 : 100,
        purchasePrice: 30,
        sellingPrice: 45,
        quantity: 100,
      },
    });

    console.log('Created medicine:', created.name);
  }

  // Create sample customers
  const customers = [
    {
      name: 'Rahul Sharma',
      phone: '9876543220',
      email: 'rahul@email.com',
    },
    {
      name: 'Priya Patel',
      phone: '9876543221',
      email: 'priya@email.com',
    },
  ];

  await prisma.customer.deleteMany({});

  for (const customer of customers) {
    const created = await prisma.customer.create({
      data: customer,
    });
    console.log('Created customer:', created.name);
  }

  // Create sample suppliers
  const suppliers = [
    {
      name: 'Pharma Distributors Ltd',
      phone: '9876543230',
      email: 'orders@pharma.com',
      gstin: '29XYZAB5678C1Z9',
    },
    {
      name: 'MediSupply Co',
      phone: '9876543231',
      email: 'sales@medisupply.com',
      gstin: '29LMNOP9012D1Z8',
    },
  ];

  await prisma.supplier.deleteMany({});

  for (const supplier of suppliers) {
    const created = await prisma.supplier.create({
      data: supplier,
    });
    console.log('Created supplier:', created.name);
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

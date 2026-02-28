import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const orgId = 'mock-org-id';
  const userId = 'mock-user-id';

  // Create Organization
  const org = await prisma.organization.upsert({
    where: { id: orgId },
    update: {},
    create: {
      id: orgId,
      name: 'Nexus Corp',
      slug: 'nexus-corp',
      plan: 'PRO',
      currency: 'USD',
      address: '123 Brutalist Ave, NY',
      taxId: 'US123456789',
    },
  });

  // Create User
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: 'admin@nexus.erp',
      name: 'Admin User',
      role: 'ADMIN',
      organizationId: orgId,
    },
  });

  // Create Products
  const products = [
    { sku: 'PRD-001', name: 'Minimalist Desk', price: 299.00, stock: 45 },
    { sku: 'PRD-002', name: 'Ergonomic Chair', price: 199.00, stock: 4 },
    { sku: 'PRD-003', name: 'Mechanical Keyboard', price: 129.00, stock: 15 },
    { sku: 'PRD-004', name: 'Monitor Arm', price: 89.00, stock: 12 },
    { sku: 'PRD-005', name: 'USB-C Hub', price: 49.00, stock: 100 },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { organizationId_sku: { organizationId: orgId, sku: p.sku } },
      update: { stock: p.stock, price: p.price },
      create: {
        ...p,
        organizationId: orgId,
      },
    });
  }

  // Create Employees
  const employees = [
    { name: 'John Doe', position: 'Software Engineer', baseSalary: 5000 },
    { name: 'Jane Smith', position: 'Product Manager', baseSalary: 6000 },
    { name: 'Bob Wilson', position: 'Designer', baseSalary: 4500 },
  ];

  for (const e of employees) {
    const emp = await prisma.employee.create({
      data: {
        ...e,
        organizationId: orgId,
      },
    });

    // Create some payroll history
    await prisma.payroll.create({
      data: {
        employeeId: emp.id,
        organizationId: orgId,
        base: e.baseSalary,
        bonus: 500,
        deductions: 200,
        amount: e.baseSalary + 500 - 200,
        period: '2024-02',
      },
    });
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';
import Decimal from 'decimal.js';

const prisma = new PrismaClient();

export const createAuditLog = async (tx: any, data: {
  action: string,
  entity: string,
  entityId: string,
  oldValue?: any,
  newValue?: any,
  userId: string,
  organizationId: string
}) => {
  await tx.auditLog.create({
    data: {
      ...data,
      oldValue: data.oldValue ? JSON.stringify(data.oldValue) : null,
      newValue: data.newValue ? JSON.stringify(data.newValue) : null,
    }
  });
};

export const createTenantService = (organizationId: string, userId: string) => {
  return {
    getCurrentUser: () => prisma.user.findUnique({ 
      where: { id: userId },
      include: { organization: true }
    }),

    getProducts: () => prisma.product.findMany({ where: { organizationId } }),
    
    getDashboardStats: async () => {
      const [products, invoices, employees, cashFlow] = await Promise.all([
        prisma.product.findMany({ where: { organizationId } }),
        prisma.invoice.findMany({ 
          where: { organizationId, createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) } },
          include: { items: { include: { product: true } } },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.employee.count({ where: { organizationId } }),
        prisma.cashMovement.findMany({
          where: { organizationId },
          orderBy: { createdAt: 'desc' },
          take: 10
        })
      ]);

      const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
      const lowStockItems = products.filter(p => p.stock <= p.minStock).length;
      const inventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

      // Top Products by Quantity
      const productSales: Record<string, { name: string, quantity: number }> = {};
      invoices.forEach(inv => {
        inv.items.forEach(item => {
          if (!productSales[item.productId]) {
            productSales[item.productId] = { name: item.product.name, quantity: 0 };
          }
          productSales[item.productId].quantity += item.quantity;
        });
      });

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      return {
        revenue: totalRevenue,
        activeOrders: invoices.length,
        inventoryItems: products.length,
        lowStockItems,
        inventoryValue,
        employees,
        topProducts,
        recentInvoices: invoices.slice(0, 5).map(inv => ({
          id: inv.id,
          number: inv.number,
          total: inv.total,
          status: inv.status,
          createdAt: inv.createdAt
        })),
        recentCashFlow: cashFlow
      };
    },

    createProduct: async (data: { sku: string, name: string, category?: string, price: number, stock: number, minStock: number }) => {
      return await prisma.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: {
            ...data,
            organizationId
          }
        });

        await createAuditLog(tx, {
          action: 'CREATE_PRODUCT',
          entity: 'Product',
          entityId: product.id,
          newValue: data,
          userId,
          organizationId
        });

        return product;
      });
    },

    processSale: async (data: { items: { productId: string, quantity: number }[], customer?: string, total?: number, sessionId?: string }) => {
      return await prisma.$transaction(async (tx) => {
        let calculatedTotal = new Decimal(0);
        const invoiceItems = [];

        // Check for active session if not provided
        let activeSessionId = data.sessionId;
        if (!activeSessionId) {
          const session = await tx.cashSession.findFirst({
            where: { organizationId, userId, status: 'OPEN' },
            orderBy: { openedAt: 'desc' }
          });
          if (!session) throw new Error('No active cash session found. Please open a session first.');
          activeSessionId = session.id;
        }

        for (const item of data.items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId, organizationId }
          });

          if (!product || product.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${product?.name || 'product'}`);
          }

          const oldProduct = { ...product };

          // Update Stock
          const updatedProduct = await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
          });

          // Log Stock Movement
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              type: 'OUT',
              reason: 'SALE',
              organizationId
            }
          });

          // Audit Log
          await createAuditLog(tx, {
            action: 'SALE_STOCK_DECREMENT',
            entity: 'Product',
            entityId: item.productId,
            oldValue: { stock: oldProduct.stock },
            newValue: { stock: updatedProduct.stock },
            userId,
            organizationId
          });

          const itemTotal = new Decimal(product.price).mul(item.quantity);
          calculatedTotal = calculatedTotal.plus(itemTotal);

          invoiceItems.push({
            productId: item.productId,
            quantity: item.quantity,
            price: product.price
          });
        }

        const finalTotal = data.total || calculatedTotal.toNumber();

        // Create Invoice
        const invoice = await tx.invoice.create({
          data: {
            number: `INV-${Date.now()}`,
            total: finalTotal,
            organizationId,
            status: 'PAID',
            items: {
              create: invoiceItems
            }
          }
        });

        // Create Cash Movement linked to session
        await tx.cashMovement.create({
          data: {
            amount: finalTotal,
            type: 'INCOME',
            description: `Sale ${invoice.number} - ${data.customer || 'General'}`,
            organizationId,
            sessionId: activeSessionId
          }
        });

        return invoice;
      });
    },

    getActiveSession: () => prisma.cashSession.findFirst({
      where: { organizationId, userId, status: 'OPEN' },
      orderBy: { openedAt: 'desc' }
    }),

    openSession: async (openingAmount: number) => {
      const existing = await prisma.cashSession.findFirst({
        where: { organizationId, userId, status: 'OPEN' }
      });
      if (existing) throw new Error('A session is already open');

      return await prisma.cashSession.create({
        data: {
          organizationId,
          userId,
          openingAmount,
          status: 'OPEN'
        }
      });
    },

    closeSession: async (sessionId: string, closingAmount: number) => {
      return await prisma.$transaction(async (tx) => {
        const session = await tx.cashSession.findUnique({
          where: { id: sessionId },
          include: { movements: true }
        });

        if (!session || session.status === 'CLOSED') throw new Error('Session not found or already closed');

        const totalMovements = session.movements.reduce((sum, m) => {
          return m.type === 'INCOME' ? sum + m.amount : sum - m.amount;
        }, 0);

        const expectedAmount = session.openingAmount + totalMovements;

        return await tx.cashSession.update({
          where: { id: sessionId },
          data: {
            closingAmount,
            expectedAmount,
            status: 'CLOSED',
            closedAt: new Date()
          }
        });
      });
    },

    getEmployees: () => prisma.employee.findMany({ where: { organizationId } }),

    createEmployee: async (data: { name: string, position: string, baseSalary: number, bankAccount?: string }) => {
      return await prisma.employee.create({
        data: {
          ...data,
          organizationId
        }
      });
    },

    getPayroll: () => prisma.payroll.findMany({ 
      where: { organizationId }, 
      include: { employee: true },
      orderBy: { createdAt: 'desc' }
    }),
    
    getAuditLogs: () => prisma.auditLog.findMany({ 
      where: { organizationId }, 
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 50
    }),

    getUsers: () => prisma.user.findMany({ where: { organizationId } }),

    createPayroll: async (data: { employeeId: string, base: number, bonus: number, deductions: number, period: string }) => {
      const amount = new Decimal(data.base).plus(data.bonus).minus(data.deductions).toNumber();
      return await prisma.payroll.create({
        data: {
          ...data,
          amount,
          organizationId,
          status: 'DRAFT'
        }
      });
    },

    payPayroll: async (payrollId: string) => {
      return await prisma.$transaction(async (tx) => {
        const payroll = await tx.payroll.findUnique({
          where: { id: payrollId, organizationId },
          include: { employee: true }
        });

        if (!payroll || payroll.status === 'PAID') {
          throw new Error('Payroll not found or already paid');
        }

        // Update Payroll Status
        const updatedPayroll = await tx.payroll.update({
          where: { id: payrollId },
          data: { status: 'PAID' }
        });

        // Register Expense in Cash Flow
        await tx.cashMovement.create({
          data: {
            amount: payroll.amount,
            type: 'EXPENSE',
            description: `Payroll Payment - ${payroll.employee.name} (${payroll.period})`,
            organizationId
          }
        });

        // Audit Log
        await createAuditLog(tx, {
          action: 'PAY_PAYROLL',
          entity: 'Payroll',
          entityId: payrollId,
          newValue: { status: 'PAID' },
          userId,
          organizationId
        });

        return updatedPayroll;
      });
    },

    getProviders: () => prisma.provider.findMany({ where: { organizationId } }),

    createProvider: (data: { name: string, contact?: string, email?: string }) => {
      return prisma.provider.create({
        data: { ...data, organizationId }
      });
    },

    getPurchaseOrders: () => prisma.purchaseOrder.findMany({
      where: { organizationId },
      include: { provider: true, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    }),

    createPurchaseOrder: async (data: { providerId: string, items: { productId: string, quantity: number, cost: number }[] }) => {
      return await prisma.$transaction(async (tx) => {
        const total = data.items.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
        const po = await tx.purchaseOrder.create({
          data: {
            number: `PO-${Date.now()}`,
            providerId: data.providerId,
            total,
            organizationId,
            items: {
              create: data.items.map(item => ({
                productId: item.productId,
                quantityOrdered: item.quantity,
                cost: item.cost
              }))
            }
          }
        });

        await createAuditLog(tx, {
          action: 'CREATE_PURCHASE_ORDER',
          entity: 'PurchaseOrder',
          entityId: po.id,
          newValue: data,
          userId,
          organizationId
        });

        return po;
      });
    },

    receivePurchaseOrder: async (poId: string, itemsReceived: { productId: string, quantity: number }[]) => {
      return await prisma.$transaction(async (tx) => {
        const po = await tx.purchaseOrder.findUnique({
          where: { id: poId, organizationId },
          include: { items: true }
        });

        if (!po || po.status === 'RECEIVED') throw new Error('Purchase order not found or already received');

        let totalReceivedValue = 0;

        for (const receivedItem of itemsReceived) {
          const poItem = po.items.find(i => i.productId === receivedItem.productId);
          if (!poItem) continue;

          const product = await tx.product.findUnique({
            where: { id: receivedItem.productId }
          });

          if (!product) continue;

          const oldStock = product.stock;
          const oldAvgCost = product.averageCost;
          const newQuantity = receivedItem.quantity;
          const unitCost = poItem.cost;

          // Calculate New Average Cost
          // Formula: ((Old Stock * Old Avg Cost) + (New Qty * Unit Cost)) / (Old Stock + New Qty)
          const totalOldValue = new Decimal(oldStock).mul(oldAvgCost);
          const totalNewValue = new Decimal(newQuantity).mul(unitCost);
          const totalNewStock = oldStock + newQuantity;
          
          const newAvgCost = totalNewStock > 0 
            ? totalOldValue.plus(totalNewValue).div(totalNewStock).toNumber()
            : unitCost;

          // Update Product
          await tx.product.update({
            where: { id: product.id },
            data: {
              stock: { increment: newQuantity },
              averageCost: newAvgCost
            }
          });

          // Update PO Item
          await tx.purchaseOrderItem.update({
            where: { id: poItem.id },
            data: { quantityReceived: { increment: newQuantity } }
          });

          // Log Stock Movement
          await tx.stockMovement.create({
            data: {
              productId: product.id,
              quantity: newQuantity,
              type: 'IN',
              reason: 'PURCHASE',
              organizationId
            }
          });

          totalReceivedValue += (newQuantity * unitCost);
        }

        // Check if fully received (simplified: just mark as received for now)
        const updatedPo = await tx.purchaseOrder.update({
          where: { id: poId },
          data: { 
            status: 'RECEIVED',
            receivedAt: new Date()
          }
        });

        // Register Account Payable
        await tx.accountPayable.create({
          data: {
            providerId: po.providerId,
            amount: totalReceivedValue,
            organizationId,
            dueDate: new Date(new Date().setDate(new Date().getDate() + 30)) // Default 30 days
          }
        });

        await createAuditLog(tx, {
          action: 'RECEIVE_PURCHASE_ORDER',
          entity: 'PurchaseOrder',
          entityId: poId,
          newValue: { status: 'RECEIVED', receivedValue: totalReceivedValue },
          userId,
          organizationId
        });

        return updatedPo;
      });
    },

    getAccountsPayable: () => prisma.accountPayable.findMany({
      where: { organizationId },
      include: { provider: true },
      orderBy: { createdAt: 'desc' }
    })
  };
};

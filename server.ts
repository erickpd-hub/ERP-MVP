import express from "express";
import { createServer as createViteServer } from "vite";
import { authMiddleware, rbacMiddleware } from "./server/middlewares/auth.ts";
import { createTenantService } from "./server/services/tenantService.ts";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(authMiddleware);

  // Onboarding & Auth
  app.post("/api/onboarding/register", async (req, res) => {
    try {
      const { email, password, orgName, slug, currency, taxRate } = req.body;
      
      const result = await prisma.$transaction(async (tx) => {
        const org = await tx.organization.create({
          data: {
            name: orgName,
            slug,
            currency,
            taxRate: parseFloat(taxRate) || 16,
          }
        });

        const user = await tx.user.create({
          data: {
            id: `user-${Date.now()}`,
            email,
            name: email.split('@')[0],
            organizationId: org.id,
            role: 'ADMIN'
          }
        });

        return { user, org };
      });

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/onboarding/import-csv", rbacMiddleware(['ADMIN']), async (req: any, res) => {
    try {
      const { products } = req.body; // Array of product objects
      const service = createTenantService(req.user.organizationId, req.user.id);
      
      const imported = [];
      for (const p of products) {
        const product = await service.createProduct({
          sku: p.sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: p.name,
          price: parseFloat(p.price) || 0,
          stock: parseInt(p.stock) || 0,
          minStock: parseInt(p.minStock) || 5,
          category: p.category || 'General'
        });
        imported.push(product);
      }
      
      res.json({ count: imported.length });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // API Routes
  app.get("/api/me", async (req: any, res) => {
    const service = createTenantService(req.user.organizationId, req.user.id);
    const user = await service.getCurrentUser();
    res.json(user);
  });

  app.get("/api/inventory", rbacMiddleware(['ADMIN', 'MANAGER', 'CASHIER']), async (req: any, res) => {
    const service = createTenantService(req.user.organizationId, req.user.id);
    const products = await service.getProducts();
    res.json(products);
  });

  app.get("/api/dashboard/stats", rbacMiddleware(['ADMIN', 'MANAGER']), async (req: any, res) => {
    const service = createTenantService(req.user.organizationId, req.user.id);
    const stats = await service.getDashboardStats();
    res.json(stats);
  });

  app.post("/api/inventory", rbacMiddleware(['ADMIN', 'MANAGER']), async (req: any, res) => {
    try {
      const service = createTenantService(req.user.organizationId, req.user.id);
      const product = await service.createProduct(req.body);
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/pos/checkout", rbacMiddleware(['ADMIN', 'CASHIER']), async (req: any, res) => {
    try {
      const service = createTenantService(req.user.organizationId, req.user.id);
      const invoice = await service.processSale(req.body);
      res.json(invoice);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/pos/session", rbacMiddleware(['ADMIN', 'CASHIER']), async (req: any, res) => {
    const service = createTenantService(req.user.organizationId, req.user.id);
    const session = await service.getActiveSession();
    res.json(session);
  });

  app.post("/api/pos/session/open", rbacMiddleware(['ADMIN', 'CASHIER']), async (req: any, res) => {
    try {
      const service = createTenantService(req.user.organizationId, req.user.id);
      const session = await service.openSession(req.body.openingAmount);
      res.json(session);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/pos/session/close", rbacMiddleware(['ADMIN', 'CASHIER']), async (req: any, res) => {
    try {
      const service = createTenantService(req.user.organizationId, req.user.id);
      const session = await service.closeSession(req.body.sessionId, req.body.closingAmount);
      res.json(session);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/payroll", rbacMiddleware(['ADMIN', 'MANAGER']), async (req: any, res) => {
    const service = createTenantService(req.user.organizationId, req.user.id);
    const payrolls = await service.getPayroll();
    res.json(payrolls);
  });

  app.post("/api/payroll", rbacMiddleware(['ADMIN', 'MANAGER']), async (req: any, res) => {
    try {
      const service = createTenantService(req.user.organizationId, req.user.id);
      const payroll = await service.createPayroll(req.body);
      res.json(payroll);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/payroll/:id/pay", rbacMiddleware(['ADMIN']), async (req: any, res) => {
    try {
      const service = createTenantService(req.user.organizationId, req.user.id);
      const payroll = await service.payPayroll(req.params.id);
      res.json(payroll);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/employees", rbacMiddleware(['ADMIN', 'MANAGER']), async (req: any, res) => {
    const service = createTenantService(req.user.organizationId, req.user.id);
    const employees = await service.getEmployees();
    res.json(employees);
  });

  app.post("/api/employees", rbacMiddleware(['ADMIN', 'MANAGER']), async (req: any, res) => {
    try {
      const service = createTenantService(req.user.organizationId, req.user.id);
      const employee = await service.createEmployee(req.body);
      res.json(employee);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/audit-logs", rbacMiddleware(['ADMIN']), async (req: any, res) => {
    const service = createTenantService(req.user.organizationId, req.user.id);
    const logs = await service.getAuditLogs();
    res.json(logs);
  });

  app.get("/api/admin/users", rbacMiddleware(['ADMIN']), async (req: any, res) => {
    const service = createTenantService(req.user.organizationId, req.user.id);
    const users = await service.getUsers();
    res.json(users);
  });
  
  app.get("/api/providers", rbacMiddleware(['ADMIN', 'MANAGER']), async (req: any, res) => {
    const service = createTenantService(req.user.organizationId, req.user.id);
    const providers = await service.getProviders();
    res.json(providers);
  });

  app.post("/api/providers", rbacMiddleware(['ADMIN', 'MANAGER']), async (req: any, res) => {
    try {
      const service = createTenantService(req.user.organizationId, req.user.id);
      const provider = await service.createProvider(req.body);
      res.json(provider);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/purchases", rbacMiddleware(['ADMIN', 'MANAGER']), async (req: any, res) => {
    const service = createTenantService(req.user.organizationId, req.user.id);
    const pos = await service.getPurchaseOrders();
    res.json(pos);
  });

  app.post("/api/purchases", rbacMiddleware(['ADMIN', 'MANAGER']), async (req: any, res) => {
    try {
      const service = createTenantService(req.user.organizationId, req.user.id);
      const po = await service.createPurchaseOrder(req.body);
      res.json(po);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/purchases/:id/receive", rbacMiddleware(['ADMIN', 'MANAGER']), async (req: any, res) => {
    try {
      const service = createTenantService(req.user.organizationId, req.user.id);
      const po = await service.receivePurchaseOrder(req.params.id, req.body.items);
      res.json(po);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/accounts-payable", rbacMiddleware(['ADMIN', 'MANAGER']), async (req: any, res) => {
    const service = createTenantService(req.user.organizationId, req.user.id);
    const ap = await service.getAccountsPayable();
    res.json(ap);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nexus ERP running on http://localhost:${PORT}`);
  });
}

startServer();

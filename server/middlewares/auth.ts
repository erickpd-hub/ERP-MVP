import { Request, Response, NextFunction } from 'express';

export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    // Mock user for development
    req.user = {
      id: 'mock-user-id',
      email: 'admin@nexus.erp',
      role: 'ADMIN',
      organizationId: 'mock-org-id',
    };
    return next();
  }

  // In production, verify Supabase JWT here
  // const { data: { user } } = await supabase.auth.getUser(token)
  // req.user = user
  next();
};

export const rbacMiddleware = (allowedRoles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (allowedRoles.includes(user.role)) return next();
    res.status(403).json({ error: 'Forbidden' });
  };
};

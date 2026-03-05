import { PrismaClient } from '@prisma/client';

// Patrón globalThis: evita múltiples instancias en hot-reload de desarrollo
// y es compatible con el entorno serverless de Vercel
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export { prisma };
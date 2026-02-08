import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Verificar conexión a la base de datos
try {
  await prisma.$connect();
  console.log('✅ Conectado a la base de datos PostgreSQL');
} catch (error) {
  console.error('❌ Error conectando a la base de datos:', error.message);
  process.exit(1);
}

export { prisma };
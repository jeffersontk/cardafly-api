import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  console.log('Seed inicial (opcional)…');
}
main().finally(async () => prisma.$disconnect());

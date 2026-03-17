const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Prisma connected to database successfully');
    const users = await prisma.user.count();
    console.log(`Current user count: ${users}`);
  } catch (error) {
    console.error('❌ Prisma connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

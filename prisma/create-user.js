const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createFounder() {
  const hashedPassword = await bcrypt.hash('password123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'admin@nexpulselabs.com' },
    update: {},
    create: {
      name: 'Founder NexPulseLabs',
      email: 'admin@nexpulselabs.com',
      password: hashedPassword,
    },
  });
  console.log('✅ Default Account Created Successfully!');
  console.log('📧 Email: admin@nexpulselabs.com');
  console.log('🔑 Password: password123');
}

createFounder().finally(() => prisma.$disconnect());
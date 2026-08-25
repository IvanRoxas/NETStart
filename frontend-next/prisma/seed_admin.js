const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv/config');

// Using the same approach as NextAuth connection
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding master admin account...");
  
  let seedPassword = process.env.ADMIN_SEED_PASSWORD;
  if (!seedPassword) {
    seedPassword = 'dev_admin_temp_2026';
    console.warn('\x1b[33m%s\x1b[0m', 'WARNING: process.env.ADMIN_SEED_PASSWORD is not set.');
    console.warn('\x1b[33m%s\x1b[0m', 'Falling back to temporary development password: dev_admin_temp_2026');
    console.warn('\x1b[33m%s\x1b[0m', 'Please configure ADMIN_SEED_PASSWORD in your production environment.');
  }

  const hashedPassword = await bcrypt.hash(seedPassword, 10);
  
  const admin = await prisma.systemAdmin.upsert({
    where: { username: 'NETStart_Admin' },
    update: {
      password: hashedPassword,
      failedLoginAttempts: 0,
      lockedUntil: null
    },
    create: {
      username: 'NETStart_Admin',
      password: hashedPassword,
      failedLoginAttempts: 0,
      lockedUntil: null
    }
  });

  console.log(`SystemAdmin account upserted: ${admin.username}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

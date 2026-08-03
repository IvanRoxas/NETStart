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
  
  const hashedPassword = await bcrypt.hash('admin_secure_2026', 10);
  
  const admin = await prisma.systemAdmin.upsert({
    where: { username: 'admin_netstart' },
    update: {
      password: hashedPassword
    },
    create: {
      username: 'admin_netstart',
      password: hashedPassword
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

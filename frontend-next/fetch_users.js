require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const users = await prisma.user.findMany();
  console.log("Users in DB:");
  
  if (users.length > 0) {
    const targetUser = users[0];
    const newPassword = "Password123!";
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: targetUser.id },
      data: { password: hashedPassword }
    });
    
    console.log(`Reset password for ${targetUser.email} to: ${newPassword}`);
  } else {
    console.log("No users found. Creating a default user.");
    const newPassword = "password123";
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const newUser = await prisma.user.create({
      data: {
        email: "test@example.com",
        name: "Test User",
        password: hashedPassword
      }
    });
    console.log(`Created new user ${newUser.email} with password: ${newPassword}`);
  }
}

main().catch(console.error).finally(() => process.exit(0));

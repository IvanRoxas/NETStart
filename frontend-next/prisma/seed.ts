import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Load environment configuration (.env first, override with .env.local if present)
dotenv.config();
dotenv.config({ path: ".env.local", override: true });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ ERROR: DATABASE_URL is not set in your environment (.env or .env.local).");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting NETStart database seeding...\n");

  let studentsCreated = 0;
  let studentsExisting = 0;

  let teachersCreated = 0;
  let teachersExisting = 0;

  let adminsCreated = 0;
  let adminsExisting = 0;

  // ----------------------------------------------------
  // 1. Seed 10 Student Accounts
  // ----------------------------------------------------
  console.log("Seeding student accounts...");
  for (let i = 1; i <= 10; i++) {
    const username = `team ${i}`;
    const email = `team${i}@gmail.com`;
    const rawPassword = `team ${i}`;
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const existingStudent = await prisma.user.findUnique({
      where: { email },
    });

    if (existingStudent) {
      studentsExisting++;
    } else {
      studentsCreated++;
    }

    // Idempotent upsert keyed on email (does not overwrite existing data)
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: username,
        displayName: username,
        password: hashedPassword,
        emailVerified: new Date(),
        isVerified: true,
        studentId: `TEAM-${String(i).padStart(2, "0")}`,
        activeTitle: "Novice Explorer",
        showcasedBadges: ["b_create_account"],
        image: "/assets/global/badges/Profile.svg",
      },
    });
  }

  // ----------------------------------------------------
  // 2. Seed 3 Teacher Accounts (Admin side: SystemAdmin)
  // ----------------------------------------------------
  console.log("Seeding teacher accounts...");
  for (let i = 1; i <= 3; i++) {
    const username = `teacher ${i}`;
    const rawPassword = `teacher ${i}`;
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const existingTeacher = await prisma.systemAdmin.findUnique({
      where: { username },
    });

    if (existingTeacher) {
      teachersExisting++;
    } else {
      teachersCreated++;
    }

    // Idempotent upsert keyed on username (SystemAdmin unique identifier)
    await prisma.systemAdmin.upsert({
      where: { username },
      update: {},
      create: {
        username,
        displayName: `Teacher ${i}`,
        password: hashedPassword,
        role: "TEACHER",
        isActive: true,
      },
    });
  }

  // ----------------------------------------------------
  // 3. Ensure Master Admin Account Exists
  // ----------------------------------------------------
  console.log("Checking master admin account...");
  const adminUsername = "NETStart_Admin";
  const existingAdmin = await prisma.systemAdmin.findUnique({
    where: { username: adminUsername },
  });

  if (existingAdmin) {
    adminsExisting++;
  } else {
    adminsCreated++;
    const adminPassword = process.env.ADMIN_SEED_PASSWORD || "NETStart2026!";
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

    await prisma.systemAdmin.create({
      data: {
        username: adminUsername,
        password: hashedAdminPassword,
        role: "SUPER_ADMIN",
        isActive: true,
      },
    });
  }

  // ----------------------------------------------------
  // 4. Output Summary Report
  // ----------------------------------------------------
  console.log("\n=========================================");
  console.log("📊 NETStart Database Seeding Summary");
  console.log("=========================================");
  console.log("👥 Student Accounts (User):");
  console.log(`   - Newly Created: ${studentsCreated}`);
  console.log(`   - Already Exists: ${studentsExisting}`);
  console.log(`   - Total Processed: ${studentsCreated + studentsExisting}`);
  console.log("\n🎓 Teacher Accounts (SystemAdmin, Role: TEACHER):");
  console.log(`   - Newly Created: ${teachersCreated}`);
  console.log(`   - Already Exists: ${teachersExisting}`);
  console.log(`   - Total Processed: ${teachersCreated + teachersExisting}`);
  console.log("\n🔐 Super Admin (SystemAdmin, Role: SUPER_ADMIN):");
  console.log(`   - Newly Created: ${adminsCreated}`);
  console.log(`   - Already Exists: ${adminsExisting}`);
  console.log("=========================================");
  console.log("✅ Seeding completed successfully!\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

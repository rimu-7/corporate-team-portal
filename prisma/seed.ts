import { hashPassword } from "@/app/lib/auth";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  const teams = await Promise.all([
    prisma.team.create({
      data: {
        name: "Engineering",
        description: "Software development",
        code: "ENG-2024",
      },
    }),
    prisma.team.create({
      data: {
        name: "Marketing",
        description: "Marketing and sales",
        code: "MKT-2024",
      },
    }),
    prisma.team.create({
      data: {
        name: "Operations",
        description: "Business operations team",
        code: "OPT-2024",
      },
    }),
  ]);

  // sample users
  const sampleUser = [
    {
      name: "John Developer",
      email: "john@company.com",
      team: teams[0],
      role: Role.MANAGER,
    },
    {
      name: "Jesse Designer",
      email: "jesse@company.com",
      team: teams[0],
      role: Role.USER,
    },
    {
      name: "Bob Marketer",
      email: "bob@company.com",
      team: teams[1],
      role: Role.MANAGER,
    },
    {
      name: "Alice Sales",
      email: "alice@company.com",
      team: teams[1],
      role: Role.USER,
    },
  ];

  for (const userData of sampleUser) {
    await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        password: await hashPassword("12345678"),
        role: userData.role,
        teamId: userData.team.id,
      },
    });
  }

  console.log("Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.log("Seeding failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
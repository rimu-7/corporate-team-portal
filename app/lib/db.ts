import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();


// 3. Database Check Function
export async function CheckDBConnection(): Promise<boolean> {
  try {
    // Attempt a simple query to verify connection
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection error:", error);
    return false;
  }
}
import { getCurrentUser, userPermission } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !userPermission(currentUser, Role.ADMIN)) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 403 }
      );
    }

    const teams = await prisma.team.findMany({
      select: {
        id: true,
        name: true,
        // add other fields if you want
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(teams);
  } catch (error) {
    console.error("Failed to fetch teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}

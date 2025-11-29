import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { Prisma, Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: "You are not authorized to access user information." },
        { status: 401 }
      );
    }

    const { searchParams } = request.nextUrl;
    const queryTeamId = searchParams.get("teamId");
    const queryRole = searchParams.get("role");

    // We use an AND array to safely combine "Permissions" and "Filters"
    // This prevents a user from overwriting their restrictions via query params
    const filters: Prisma.UserWhereInput[] = [];

    // --- 1. PERMISSION LOGIC ---
    if (user.role === "ADMIN") {
      // Admin sees everything, no base restrictions added
    } else if (user.role === "MANAGER") {
      // Manager: (My Team) OR (Any Regular User)
      filters.push({
        OR: [
          { teamId: user.teamId },
          { role: Role.USER }
        ]
      });
    } else {
      // Regular User: Must be in own team AND cannot see Admins
      filters.push({ teamId: user.teamId });
      filters.push({ role: { not: Role.ADMIN } });
    }

    // --- 2. QUERY PARAMETER FILTERS ---
    if (queryTeamId) {
      filters.push({ teamId: queryTeamId });
    }

    if (queryRole) {
      // Type guard: Ensure the string provided is actually a valid Role enum
      if (Object.values(Role).includes(queryRole as Role)) {
        filters.push({ role: queryRole as Role });
      }
    }

    // --- 3. FETCH ---
    const users = await prisma.user.findMany({
      where: {
        AND: filters, // Combines all logic safely
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // FIXED: Return 'users' (the list), not 'user' (the current session)
    return NextResponse.json(users);

  } catch (error) {
    console.error("Fetch users error:", error);
    return NextResponse.json(
      { error: "Internal server error, something went wrong" },
      { status: 500 }
    );
  }
}
import { getCurrentUser, userPermission } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;
    const currentUser = await getCurrentUser();

    // 1. Check Admin Permission
    // Changed status to 403 (Forbidden) as the user is logged in but lacks permission
    if (!currentUser || !userPermission(currentUser, Role.ADMIN)) {
      return NextResponse.json(
        {
          error:
            "You are not authorized to update roles. Only admins can do that.",
        },
        { status: 403 }
      );
    }

    // 2. Prevent Self-Update
    if (userId === currentUser.id) {
      return NextResponse.json(
        {
          error: "You can not change your own role",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const role = body.role;

    // 3. Validate Role
    // FIXED: Removed the stray "}" that was causing a syntax error in your code
    const validRoles = [Role.USER, Role.MANAGER];

    // Check if role exists and is in the allowed list
    // Changed status to 400 (Bad Request) because the input data is invalid
    if (!role || !validRoles.includes(role as Role)) {
      return NextResponse.json(
        {
          error: "Invalid role provided. Allowed roles are: USER, MANAGER",
        },
        { status: 400 }
      );
    }

    // 4. Update User
    const updateUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: role as Role, // Cast to Role enum after validation
      },
      include: {
        team: true,
      },
    });

    return NextResponse.json({
      user: updateUser,
      message: `The user role is updated to ${role}`,
    });
  } catch (error) {
    console.log("Role assignment error", error);

    // Prisma "Record not found" check
    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error, something went wrong",
      },
      { status: 500 }
    );
  }
}

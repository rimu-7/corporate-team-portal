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

    // 1. Authorization Check
    if (!currentUser || !userPermission(currentUser, Role.ADMIN)) {
      return NextResponse.json(
        { error: "You are not authorized to assign teams. Only admins can do that." },
        { status: 403 } // 403 Forbidden is more appropriate for permission issues
      );
    }

    // 2. Parse Body safely
    const body = await request.json();
    const { teamId } = body;

    // 3. Validation Logic
    // If teamId is provided (string), verify it exists.
    // If teamId is null/empty string, we allow it (this means remove team).
    if (teamId && typeof teamId === "string") {
      const team = await prisma.team.findUnique({
        where: { id: teamId },
      });

      if (!team) {
        return NextResponse.json(
          { error: "The provided Team ID does not exist." },
          { status: 404 }
        );
      }
    }

    // 4. Prepare the value for Prisma
    // If teamId is a valid string, use it.
    // If teamId is null, undefined, or empty string "", treat it as null (Disconnect team)
    const teamUpdateValue = teamId ? teamId : null;

    // 5. Update User
    const updateUser = await prisma.user.update({
      where: { id: userId },
      data: {
        teamId: teamUpdateValue,
      },
      include: {
        team: true,
      },
    });

    return NextResponse.json({
      user: updateUser,
      message: teamUpdateValue
        ? `User successfully assigned to ${updateUser.team?.name}`
        : "User successfully removed from the team",
    });

  } catch (error) {
    console.error("Team assignment error:", error);
    
    // Handle Prisma "Record Not Found" explicitly
    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      return NextResponse.json(
        { error: "User to update was not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
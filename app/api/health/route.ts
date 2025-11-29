import { CheckDBConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const isConnected = await CheckDBConnection();
  if (!isConnected) {
    return NextResponse.json(
      {
        status: "error",
        message: "Database connection failed",
      },
      { status: 503 }
    );
  }

  return NextResponse.json(
    {
      status: "true",
      message: "Database Connected",
    },
    { status: 200 }
  );
}

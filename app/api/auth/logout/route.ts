import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    {
      message: "User logout successfully",
    },
    { status: 200 }
  );

  // OPTION 1: The Modern Way (Cleaner)
  response.cookies.delete("token"); 

  /* OPTION 2: The Manual Way
     MUST add path: "/" if the original cookie was set for the whole app.
  */
  // response.cookies.set("token", "", {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === "production",
  //   path: "/", // <--- THIS IS CRITICAL
  //   sameSite: "lax",
  //   maxAge: 0,
  // });

  return response;
}
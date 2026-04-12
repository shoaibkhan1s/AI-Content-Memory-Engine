import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    {
      success: true,
      message: "Logged out successfully",
    },
    {
      status: 200,
    },
  );

  // Delete the auth cookie by setting it to empty with maxAge = 0
  // maxAge: 0 tells the browser "this cookie is already expired, delete it"

  response.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}

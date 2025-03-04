import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Clear the auth cookie by setting maxAge to 0
  response.cookies.set("auth", "", { 
    path: "/", 
    httpOnly: true,
    sameSite: "strict", 
    maxAge: 0 // Expire immediately
  });
  
  console.log("Logout API - Cookie cleared: auth");
  return response;
}
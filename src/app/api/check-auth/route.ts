import { NextResponse } from "next/server";
import { cookies } from "next/headers"; // Import cookies helper

export async function GET() {
  const cookieStore = cookies(); // Get synchronous cookie store
  const authCookie = cookieStore.get("auth"); // Access 'auth' cookie
  const isAuthenticated = authCookie?.value === "true";
  console.log("Check Auth API - Cookie:", authCookie, "Authenticated:", isAuthenticated);
  return NextResponse.json({ isAuthenticated });
}
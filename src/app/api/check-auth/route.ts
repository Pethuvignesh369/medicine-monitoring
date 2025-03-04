import { NextResponse } from "next/server";
import { cookies } from "next/headers"; // Import cookies helper

export async function GET() {
  // In Next.js 15, cookies() returns a Promise that needs to be awaited
  const cookieStore = await cookies(); // Await the Promise
  const authCookie = cookieStore.get("auth"); // Access 'auth' cookie
  const isAuthenticated = authCookie?.value === "true";
  console.log("Check Auth API - Cookie:", authCookie, "Authenticated:", isAuthenticated);
  return NextResponse.json({ isAuthenticated });
}
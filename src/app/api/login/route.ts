import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  // Hardcoded for simplicity—replace with DB check later
  const validUsername = "admin";
  const validPassword = "password";

  if (username === validUsername && password === validPassword) {
    // Set a simple cookie to mark user as authenticated
    const response = NextResponse.json({ success: true });
    response.cookies.set("auth", "true", { path: "/", httpOnly: true, secure: true, sameSite: "strict", maxAge: 60 * 60 * 24 * 7 }); // 7 days
    return response;
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}
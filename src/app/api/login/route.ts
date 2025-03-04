import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  const validUsername = "admin";
  const validPassword = "password";

  if (username === validUsername && password === validPassword) {
    const response = NextResponse.json({ success: true });
    response.cookies.set("auth", "true", { 
      path: "/", 
      httpOnly: true,
      sameSite: "strict", 
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    console.log("Login API - Cookie set: auth=true");
    return response;
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}
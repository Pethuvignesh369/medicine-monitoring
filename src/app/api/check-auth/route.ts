import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    // In Next.js 15, cookies() returns a Promise that needs to be awaited
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("auth");
    const isAuthenticated = authCookie?.value === "true";
    
    console.log("Check Auth API - Cookie:", authCookie, "Authenticated:", isAuthenticated);
    
    // Create response with authentication status
    const response = NextResponse.json({ isAuthenticated });
    
    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    
    return response;
  } catch (error) {
    console.error("Error in check-auth API:", error);
    
    // Create error response
    const errorResponse = NextResponse.json(
      { isAuthenticated: false, error: "Failed to check authentication" },
      { status: 500 }
    );
    
    // Add cache control headers to prevent caching
    errorResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    errorResponse.headers.set('Pragma', 'no-cache');
    errorResponse.headers.set('Expires', '0');
    errorResponse.headers.set('Surrogate-Control', 'no-store');
    
    return errorResponse;
  }
}
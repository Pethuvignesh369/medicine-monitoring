import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const facilities = await prisma.facility.findMany();
    return NextResponse.json(facilities);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch facilities" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received Data:", body); // Debugging ✅

    const { name, type } = body;

    if (!name || !type) {
      return NextResponse.json({ error: "Name and Type are required" }, { status: 400 });
    }

    const newFacility = await prisma.facility.create({
      data: { name, type },
    });

    return NextResponse.json(newFacility, { status: 201 });
  } catch (error) {
    console.error("Error creating facility:", error); // Debugging ✅
    return NextResponse.json({ error: "Failed to create facility" }, { status: 500 });
  }
}

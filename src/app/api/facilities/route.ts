import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const facilities = await prisma.facility.findMany();
    return NextResponse.json(facilities);
  } catch (error) {
    console.error("Error fetching facilities:", error);
    return NextResponse.json({ error: "Failed to fetch facilities" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload: request body must be an object" }, { status: 400 });
    }

    const { name, type } = body;

    if (!name || !type) {
      return NextResponse.json({ error: "Missing required fields: name and type" }, { status: 400 });
    }

    const facility = await prisma.facility.create({
      data: { name, type },
    });

    return NextResponse.json(facility, { status: 201 });
  } catch (error) {
    console.error("Error adding facility:", error);
    return NextResponse.json({ error: "Failed to add facility" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
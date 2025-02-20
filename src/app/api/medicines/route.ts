import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const medicines = await prisma.medicine.findMany();
    return NextResponse.json(medicines);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch medicines" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, stock, weeklyRequirement, expiryDate } = await req.json();

    const newMedicine = await prisma.medicine.create({
      data: {
        name,
        stock,
        weeklyRequirement,
        expiryDate: expiryDate ? new Date(expiryDate) : null, // Ensure proper date format
      },
    });

    return NextResponse.json(newMedicine, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create medicine" }, { status: 500 });
  }
}

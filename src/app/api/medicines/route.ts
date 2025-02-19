import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  const medicines = await prisma.medicine.findMany();
  return NextResponse.json(medicines);
}

export async function POST(req: Request) {
  const { name, stock, weeklyRequirement } = await req.json();
  const newMedicine = await prisma.medicine.create({
    data: { name, stock, weeklyRequirement },
  });
  return NextResponse.json(newMedicine);
}

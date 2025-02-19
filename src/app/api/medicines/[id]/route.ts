import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET a single medicine by ID
export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;

  const medicine = await prisma.medicine.findUnique({
    where: { id: Number(id) },
  });

  if (!medicine) {
    return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
  }

  return NextResponse.json(medicine);
}

// UPDATE a medicine
export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  const { name, stock, weeklyRequirement } = await req.json();

  const updatedMedicine = await prisma.medicine.update({
    where: { id: Number(id) },
    data: { name, stock, weeklyRequirement },
  });

  return NextResponse.json(updatedMedicine);
}

// DELETE a medicine
export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;

  await prisma.medicine.delete({
    where: { id: Number(id) },
  });

  return NextResponse.json({ message: "Deleted successfully" });
}

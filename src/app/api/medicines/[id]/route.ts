import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET a single medicine by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const medicine = await prisma.medicine.findUnique({
    where: { id: Number(params.id) },
  });

  if (!medicine) {
    return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
  }

  return NextResponse.json(medicine);
}

// UPDATE a medicine
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { name, stock, weeklyRequirement } = await req.json();

  const updatedMedicine = await prisma.medicine.update({
    where: { id: Number(params.id) },
    data: { name, stock, weeklyRequirement },
  });

  return NextResponse.json(updatedMedicine);
}

// DELETE a medicine
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.medicine.delete({
    where: { id: Number(params.id) },
  });

  return NextResponse.json({ message: "Deleted successfully" });
}

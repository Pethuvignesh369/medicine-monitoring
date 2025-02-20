import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET a single medicine by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const medicine = await prisma.medicine.findUnique({
    where: { id: Number(params.id) }, // Ensure ID is converted to a number
  });

  if (!medicine) {
    return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
  }

  return NextResponse.json(medicine);
}

// UPDATE a medicine
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, stock, weeklyRequirement } = await req.json();
    
    const updatedMedicine = await prisma.medicine.update({
      where: { id: Number(params.id) },
      data: { name, stock, weeklyRequirement },
    });

    return NextResponse.json({ message: "Medicine updated successfully", updatedMedicine });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update medicine" }, { status: 500 });
  }
}

// DELETE a medicine
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.medicine.delete({
      where: { id: Number(params.id) },
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete medicine" }, { status: 500 });
  }
}

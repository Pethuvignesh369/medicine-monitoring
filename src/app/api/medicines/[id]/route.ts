import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Define the correct param type for Next.js App Router
type Params = { id: string };

// GET a single medicine by ID
export async function GET(
  req: Request,
  context: { params: Params }
) {
  try {
    const medicine = await prisma.medicine.findUnique({
      where: { id: parseInt(context.params.id, 10) },
    });

    if (!medicine) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
    }

    return NextResponse.json(medicine);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// UPDATE a medicine
export async function PUT(
  req: Request,
  context: { params: Params }
) {
  try {
    const { name, stock, weeklyRequirement } = await req.json();

    const updatedMedicine = await prisma.medicine.update({
      where: { id: parseInt(context.params.id, 10) },
      data: { name, stock, weeklyRequirement },
    });

    return NextResponse.json(updatedMedicine);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update medicine" }, { status: 500 });
  }
}

// DELETE a medicine
export async function DELETE(
  req: Request,
  context: { params: Params }
) {
  try {
    await prisma.medicine.delete({
      where: { id: parseInt(context.params.id, 10) },
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete medicine" }, { status: 500 });
  }
}

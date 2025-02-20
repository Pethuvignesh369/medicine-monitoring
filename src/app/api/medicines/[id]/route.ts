import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET a single medicine by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params; // ✅ No need to await

  const medicine = await prisma.medicine.findUnique({
    where: { id: Number(id) },
  });

  if (!medicine) {
    return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
  }

  return NextResponse.json(medicine);
}

// UPDATE a medicine
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params; // ✅ Correct params usage
    const { name, stock, weeklyRequirement, expiryDate } = await req.json();

    const updatedMedicine = await prisma.medicine.update({
      where: { id: Number(id) },
      data: {
        name,
        stock,
        weeklyRequirement,
        expiryDate: expiryDate ? new Date(expiryDate) : null, // ✅ Ensure expiryDate is updated
      },
    });

    return NextResponse.json({ message: "Medicine updated successfully", updatedMedicine });
  } catch (error) {
    console.error("Update Error:", error); // ✅ Log errors for debugging
    return NextResponse.json({ error: "Failed to update medicine" }, { status: 500 });
  }
}

// DELETE a medicine
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params; // ✅ Correct params usage

    await prisma.medicine.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error); // ✅ Log errors for debugging
    return NextResponse.json({ error: "Failed to delete medicine" }, { status: 500 });
  }
}

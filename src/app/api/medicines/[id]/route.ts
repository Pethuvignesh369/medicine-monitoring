import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ GET a single medicine by ID
export async function GET(req: NextRequest, context: { params: { id?: string } }) {
  try {
    const { id } = await context.params; // ✅ Await params

    if (!id) {
      return NextResponse.json({ error: "Medicine ID is required" }, { status: 400 });
    }

    const medicine = await prisma.medicine.findUnique({
      where: { id: Number(id) },
      include: { facility: true }, // Ensure `facility` is the correct relation name
    });

    if (!medicine) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
    }

    return NextResponse.json(medicine);
  } catch (error) {
    console.error("Error fetching medicine:", error);
    return NextResponse.json({ error: "Failed to fetch medicine" }, { status: 500 });
  }
}

// ✅ UPDATE a medicine
export async function PUT(req: NextRequest, context: { params: { id?: string } }) {
  try {
    const { id } = await context.params; // ✅ Await params

    if (!id) {
      return NextResponse.json({ error: "Medicine ID is required" }, { status: 400 });
    }

    const body = await req.json();
    console.log("Updating Medicine Data:", body);

    const { name, stock, weeklyRequirement, expiryDate, facilityId } = body;

    if (!name || !stock || !weeklyRequirement || !facilityId) {
      return NextResponse.json({ error: "All fields except expiryDate are required" }, { status: 400 });
    }

    const updatedMedicine = await prisma.medicine.update({
      where: { id: Number(id) },
      data: {
        name,
        stock: Number(stock),
        weeklyRequirement: Number(weeklyRequirement),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        facilityId: Number(facilityId),
      },
      include: { facility: true }, // Include facility details
    });

    return NextResponse.json({ message: "Medicine updated successfully", updatedMedicine });
  } catch (error) {
    console.error("Error updating medicine:", error);
    return NextResponse.json({ error: "Failed to update medicine" }, { status: 500 });
  }
}

// ✅ DELETE a medicine
export async function DELETE(req: NextRequest, context: { params: { id?: string } }) {
  try {
    const { id } = await context.params; // ✅ Await params

    if (!id) {
      return NextResponse.json({ error: "Medicine ID is required" }, { status: 400 });
    }

    await prisma.medicine.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Medicine deleted successfully" });
  } catch (error) {
    console.error("Error deleting medicine:", error);
    return NextResponse.json({ error: "Failed to delete medicine" }, { status: 500 });
  }
}

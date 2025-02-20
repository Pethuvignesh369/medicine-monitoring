import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET a single facility by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const facility = await prisma.facility.findUnique({
      where: { id: Number(params.id) },
    });

    if (!facility) {
      return NextResponse.json({ error: "Facility not found" }, { status: 404 });
    }

    return NextResponse.json(facility);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch facility" }, { status: 500 });
  }
}

// UPDATE (Edit) a facility
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, type } = await req.json();

    const updatedFacility = await prisma.facility.update({
      where: { id: Number(params.id) },
      data: { name, type },
    });

    return NextResponse.json({ message: "Facility updated successfully", updatedFacility });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update facility" }, { status: 500 });
  }
}

// DELETE a facility
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.facility.delete({
      where: { id: Number(params.id) },
    });

    return NextResponse.json({ message: "Facility deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete facility" }, { status: 500 });
  }
}

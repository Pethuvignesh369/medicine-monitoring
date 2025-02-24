import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { medicineId, quantity } = await request.json();

    if (!medicineId || !quantity || quantity < 0) {
      return NextResponse.json(
        { error: "Invalid input: medicineId and non-negative quantity required" },
        { status: 400 }
      );
    }

    const medicine = await prisma.medicine.findUnique({
      where: { id: medicineId },
    });

    if (!medicine) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
    }

    if (medicine.stock < quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
    }

    const [usage] = await prisma.$transaction([
      prisma.medicineUsage.create({
        data: {
          medicineId,
          quantity,
          usageDate: new Date(),
        },
      }),
      prisma.medicine.update({
        where: { id: medicineId },
        data: { stock: medicine.stock - quantity },
      }),
    ]);

    return NextResponse.json(usage, { status: 201 });
  } catch (error) {
    console.error("Error adding medicine usage:", error);
    return NextResponse.json({ error: "Failed to add usage" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Type params as a Promise
) {
  try {
    const resolvedParams = await params; // Await the params Promise
    if (!resolvedParams || !resolvedParams.id) {
      return NextResponse.json({ error: "Missing medicine ID" }, { status: 400 });
    }

    const medicineId = parseInt(resolvedParams.id);
    if (isNaN(medicineId)) {
      return NextResponse.json({ error: "Invalid medicine ID" }, { status: 400 });
    }

    const usage = await prisma.medicineUsage.findMany({
      where: { medicineId },
      select: {
        id: true,
        quantity: true,
        usageDate: true,
        medicine: { select: { name: true } },
      },
    });

    return NextResponse.json(usage);
  } catch (error) {
    console.error("Error fetching usage:", error);
    return NextResponse.json({ error: "Failed to fetch usage" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
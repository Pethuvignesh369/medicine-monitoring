import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const medicineId = parseInt(params.id);
    const usage = await prisma.medicineUsage.findMany({
      where: { medicineId },
      select: {
        id: true,
        quantity: true,
        usageDate: true,
        medicine: { select: { name: true } }, // Include medicine name
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
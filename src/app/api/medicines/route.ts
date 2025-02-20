import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ CREATE a new medicine
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Received Medicine Data:", body);

    let { name, stock, weeklyRequirement, expiryDate, facilityId } = body;

    if (!name || !stock || !weeklyRequirement || !facilityId) {
      return NextResponse.json(
        { error: "All fields except expiryDate are required" },
        { status: 400 }
      );
    }

    facilityId = Number(facilityId);
    if (isNaN(facilityId)) {
      return NextResponse.json({ error: "Invalid facility ID" }, { status: 400 });
    }

    const parsedExpiryDate = expiryDate ? new Date(expiryDate) : null;
    if (parsedExpiryDate && isNaN(parsedExpiryDate.getTime())) {
      return NextResponse.json({ error: "Invalid expiry date format" }, { status: 400 });
    }

    const newMedicine = await prisma.medicine.create({
      data: {
        name,
        stock: Number(stock),
        weeklyRequirement: Number(weeklyRequirement),
        expiryDate: parsedExpiryDate,
        facilityId,
      },
    });

    return NextResponse.json(newMedicine, { status: 201 });
  } catch (error) {
    console.error("Error creating medicine:", error);
    return NextResponse.json({ error: "Failed to create medicine" }, { status: 500 });
  }
}

// ✅ FETCH all medicines
export async function GET() {
  try {
    const medicines = await prisma.medicine.findMany({
      orderBy: { name: "asc" },
      include: { facility: true }, // Make sure `facility` is the correct relation name
    });

    return NextResponse.json(medicines, { status: 200 });
  } catch (error) {
    console.error("Error fetching medicines:", error);
    return NextResponse.json({ error: "Failed to fetch medicines" }, { status: 500 });
  }
}

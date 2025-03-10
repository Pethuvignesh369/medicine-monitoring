import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Manual validation for medicine data
function validateMedicineData(data: any) {
  const errors: Record<string, string> = {};
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    errors.name = "Medicine name is required";
  }
  
  if (typeof data.stock !== 'number' || data.stock < 0) {
    errors.stock = "Stock cannot be negative";
  }
  
  if (typeof data.weeklyRequirement !== 'number' || data.weeklyRequirement <= 0) {
    errors.weeklyRequirement = "Weekly requirement must be positive";
  }
  
  if (data.expiryDate !== null && typeof data.expiryDate !== 'string') {
    errors.expiryDate = "Expiry date must be a string or null";
  }
  
  if (!data.facilityId || typeof data.facilityId !== 'number' || data.facilityId <= 0) {
    errors.facilityId = "Facility ID is required";
  }
  
  return Object.keys(errors).length > 0 ? { valid: false, errors } : { valid: true };
}

// Validate ID parameter
function validateIdParam(id: string) {
  if (!id || isNaN(Number(id))) {
    return { valid: false, error: "ID must be a valid number" };
  }
  return { valid: true, value: parseInt(id, 10) };
}

// Following Next.js 15 route handler format with async params
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params as required in Next.js 15
    const params = await context.params;
    const id = params.id;
    
    // Validate and parse the ID parameter
    const validatedId = validateIdParam(id);
    if (!validatedId.valid) {
      return NextResponse.json(
        { error: validatedId.error },
        { status: 400 }
      );
    }

    const medicineId = validatedId.value;
    const medicine = await prisma.medicine.findUnique({
      where: { id: medicineId },
      include: { facility: true }
    });

    if (!medicine) {
      return NextResponse.json(
        { error: "Medicine not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(medicine);
  } catch (error) {
    console.error("Error fetching medicine:", error);
    return NextResponse.json(
      { error: "Failed to fetch medicine" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params as required in Next.js 15
    const params = await context.params;
    const id = params.id;
    
    // Validate and parse the ID parameter
    const validatedId = validateIdParam(id);
    if (!validatedId.valid) {
      return NextResponse.json(
        { error: validatedId.error },
        { status: 400 }
      );
    }
    
    const medicineId = validatedId.value;

    // Parse and validate the request body
    const body = await request.json();
    const validation = validateMedicineData(body);
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.errors },
        { status: 400 }
      );
    }

    // Check if the medicine exists
    const existingMedicine = await prisma.medicine.findUnique({
      where: { id: medicineId }
    });

    if (!existingMedicine) {
      return NextResponse.json(
        { error: "Medicine not found" },
        { status: 404 }
      );
    }

    // Update the medicine
    const updatedMedicine = await prisma.medicine.update({
      where: { id: medicineId },
      data: {
        name: body.name,
        stock: body.stock,
        weeklyRequirement: body.weeklyRequirement,
        expiryDate: body.expiryDate,
        facilityId: body.facilityId
      },
      include: { facility: true }
    });

    return NextResponse.json(updatedMedicine);
  } catch (error) {
    console.error("Error updating medicine:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return NextResponse.json(
      { error: "Failed to update medicine", message: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params as required in Next.js 15
    const params = await context.params;
    const id = params.id;
    
    // Validate and parse the ID parameter
    const validatedId = validateIdParam(id);
    if (!validatedId.valid) {
      return NextResponse.json(
        { error: validatedId.error },
        { status: 400 }
      );
    }
    
    const medicineId = validatedId.value;

    // Check if the medicine exists
    const medicine = await prisma.medicine.findUnique({
      where: { id: medicineId }
    });

    if (!medicine) {
      return NextResponse.json(
        { error: "Medicine not found" },
        { status: 404 }
      );
    }

    // Check for and delete related usage records
    const usageCount = await prisma.medicineUsage.count({
      where: { medicineId }
    });

    if (usageCount > 0) {
      // Delete all associated usage records
      await prisma.medicineUsage.deleteMany({
        where: { medicineId }
      });
    }

    // Delete the medicine
    await prisma.medicine.delete({
      where: { id: medicineId }
    });

    return NextResponse.json(
      { success: true, message: "Medicine deleted successfully" }
    );
  } catch (error) {
    console.error("Error deleting medicine:", error);
    
    // More specific error handling for database errors
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return NextResponse.json(
      { error: "Failed to delete medicine", message: errorMessage },
      { status: 500 }
    );
  }
}
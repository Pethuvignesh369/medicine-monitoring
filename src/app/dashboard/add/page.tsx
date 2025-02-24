"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function AddMedicine() {
  const [medicine, setMedicine] = useState({
    name: "",
    stock: "",
    weeklyRequirement: "",
    expiryDate: "",
    facilityId: "",
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facilities, setFacilities] = useState<{ id: number; name: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const res = await fetch("/api/facilities");
        if (!res.ok) throw new Error("Failed to fetch facilities");
        const data = await res.json();
        setFacilities(data);
      } catch (error) {
        console.error("Error fetching facilities:", error);
        setErrorMessage("Failed to load facilities.");
        setTimeout(() => setErrorMessage(null), 3000);
      }
    };
    fetchFacilities();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!medicine.name || !medicine.stock || !medicine.weeklyRequirement || !medicine.facilityId) {
      setErrorMessage("Please fill all required fields.");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    const res = await fetch("/api/medicines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: medicine.name,
        stock: parseInt(medicine.stock),
        weeklyRequirement: parseInt(medicine.weeklyRequirement),
        expiryDate: medicine.expiryDate || null,
        facilityId: parseInt(medicine.facilityId),
      }),
    });

    if (!res.ok) {
      setErrorMessage("Failed to add medicine.");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    setSuccessMessage("Medicine added successfully!");
    setTimeout(() => {
      setSuccessMessage(null);
      router.push("/dashboard");
    }, 2000);
    setMedicine({ name: "", stock: "", weeklyRequirement: "", expiryDate: "", facilityId: "" });
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <Navbar />
      <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md">
        <h2 className="text-lg font-semibold mb-4">Add Veterinary Medicine</h2>
        {successMessage && (
          <Alert className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}
        {errorMessage && (
          <Alert className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Medicine Name"
            value={medicine.name}
            onChange={(e) => setMedicine({ ...medicine, name: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Stock"
            value={medicine.stock}
            onChange={(e) => setMedicine({ ...medicine, stock: e.target.value })}
            min="0"
          />
          <Input
            type="number"
            placeholder="Weekly Requirement"
            value={medicine.weeklyRequirement}
            onChange={(e) => setMedicine({ ...medicine, weeklyRequirement: e.target.value })}
            min="0"
          />
          <Input
            type="date"
            placeholder="Expiry Date"
            value={medicine.expiryDate}
            onChange={(e) => setMedicine({ ...medicine, expiryDate: e.target.value })}
          />
          <select
            value={medicine.facilityId}
            onChange={(e) => setMedicine({ ...medicine, facilityId: e.target.value })}
            className="w-full p-2 border rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>Select Facility</option>
            {facilities.map((facility) => (
              <option key={facility.id} value={facility.id}>{facility.name}</option>
            ))}
          </select>
          <div className="flex space-x-2">
            <Button type="submit" className="flex-1">Add Medicine</Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => router.push("/dashboard")}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
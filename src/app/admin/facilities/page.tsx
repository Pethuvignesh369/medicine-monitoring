"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function AddFacility() {
  const [facility, setFacility] = useState({ name: "", type: "" });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!facility.name || !facility.type) {
      setErrorMessage("Please enter a name and select a type.");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    console.log("Submitting:", facility);

    const res = await fetch("/api/facilities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(facility),
    });

    if (!res.ok) {
      console.error("Error:", await res.json());
      setErrorMessage("Failed to add facility.");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    setSuccessMessage("Facility added successfully!");
    setTimeout(() => {
      setSuccessMessage(null);
      router.push("/dashboard");
    }, 2000);
    setFacility({ name: "", type: "" });
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <Navbar />
      <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md">
        <h2 className="text-lg font-semibold mb-4">Add Veterinary Facility</h2>
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
            placeholder="Facility Name (e.g., Chennai Veterinary Dispensary)"
            value={facility.name}
            onChange={(e) => setFacility({ ...facility, name: e.target.value })}
          />
          <div>
            <label htmlFor="facilityType" className="block text-sm font-medium text-gray-700 mb-1">
              Facility Type
            </label>
            <select
              id="facilityType"
              value={facility.type}
              onChange={(e) => setFacility({ ...facility, type: e.target.value })}
              className="w-full p-2 border rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                Select Facility Type
              </option>
              <option value="Dispensary">Dispensary</option>
              <option value="Hospital">Hospital</option>
              <option value="ClinicianCenter">Clinician Center</option>
              <option value="Polyclinic">Polyclinic</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <Button type="submit" className="flex-1">Add Facility</Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => router.push("/dashboard")}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
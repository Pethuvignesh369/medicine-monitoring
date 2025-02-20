"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AddFacility() {
  const [facility, setFacility] = useState({ name: "", type: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Submitting:", facility); // Debugging ✅

    const res = await fetch("/api/facilities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(facility),
    });

    if (!res.ok) {
      console.error("Error:", await res.json());
      alert("Failed to add facility.");
      return;
    }

    alert("Facility added successfully!");
    setFacility({ name: "", type: "" }); // Reset form
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-lg font-semibold mb-4">Add Facility</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Facility Name"
          value={facility.name}
          onChange={(e) => setFacility({ ...facility, name: e.target.value })}
        />
        <Input
          placeholder="Facility Type (Hospital, Dispensary, etc.)"
          value={facility.type}
          onChange={(e) => setFacility({ ...facility, type: e.target.value })}
        />
        <Button type="submit">Add Facility</Button>
      </form>
    </div>
  );
}

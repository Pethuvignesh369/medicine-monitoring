"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
      {/* Sleek Black Footer */}
<footer className="fixed bottom-0 left-0 w-full bg-black text-white shadow-md py-2 flex justify-around border-t border-gray-700">
  <Link href="/" className="flex flex-col items-center text-xs font-semibold hover:text-gray-400 transition">
    🏠 <span>Home</span>
  </Link>
  <Link href="/dashboard" className="flex flex-col items-center text-xs font-semibold hover:text-gray-400 transition">
    📊 <span>Dashboard</span>
  </Link>
  <Link href="/dashboard/add" className="flex flex-col items-center text-xs font-semibold hover:text-gray-400 transition">
    ➕ <span>Add Medicine</span>
  </Link>
  <Link href="/admin/facilities" className="flex flex-col items-center text-xs font-semibold hover:text-gray-400 transition">
    🏢 <span>Add Facility</span>
  </Link>
</footer>
    </div>
  );
}

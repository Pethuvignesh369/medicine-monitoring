"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

type Facility = {
  id: number;
  name: string;
  type: string;
};

export default function AddMedicine() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [medicine, setMedicine] = useState({
    name: "",
    stock: "",
    weeklyRequirement: "",
    expiryDate: "",
    facilityId: "",
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  // Fetch facilities from API
  useEffect(() => {
    async function fetchFacilities() {
      const res = await fetch("/api/facilities");
      const data: Facility[] = await res.json();
      setFacilities(data);
    }
    fetchFacilities();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/medicines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(medicine),
    });

    if (res.ok) {
      setSuccessMessage("Medicine added successfully!");

      // Redirect to dashboard after 2 seconds
      setTimeout(() => router.push("/dashboard"), 2000);
    } else {
      alert("Failed to add medicine. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      {/* Success Alert */}
      {successMessage && (
        <Alert className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <Card className="p-6 border rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Add Medicine</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Medicine Name */}
          <div>
            <Label htmlFor="name">Medicine Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter medicine name"
              value={medicine.name}
              onChange={(e) => setMedicine({ ...medicine, name: e.target.value })}
              required
            />
          </div>

          {/* Stock */}
          <div>
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              placeholder="Enter stock quantity"
              value={medicine.stock}
              onChange={(e) => setMedicine({ ...medicine, stock: e.target.value })}
              required
            />
          </div>

          {/* Weekly Requirement */}
          <div>
            <Label htmlFor="weeklyRequirement">Weekly Requirement</Label>
            <Input
              id="weeklyRequirement"
              type="number"
              placeholder="Enter weekly requirement"
              value={medicine.weeklyRequirement}
              onChange={(e) =>
                setMedicine({ ...medicine, weeklyRequirement: e.target.value })
              }
              required
            />
          </div>

          {/* Expiry Date */}
          <div>
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input
              id="expiryDate"
              type="date"
              value={medicine.expiryDate}
              onChange={(e) => setMedicine({ ...medicine, expiryDate: e.target.value })}
              required
            />
          </div>

          {/* Facility Dropdown */}
          <div>
            <Label>Facility</Label>
            <Select
              onValueChange={(value: string) =>
                setMedicine({ ...medicine, facilityId: value })
              }
              value={medicine.facilityId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a facility" />
              </SelectTrigger>
              <SelectContent>
                {facilities.map((facility) => (
                  <SelectItem key={facility.id} value={facility.id.toString()}>
                    {facility.name} ({facility.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Add Medicine
            </Button>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

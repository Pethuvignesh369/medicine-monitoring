"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export default function EditMedicine() {
  const router = useRouter();
  const { id } = useParams();
  
  // State Variables
  const [name, setName] = useState("");
  const [stock, setStock] = useState<number | "">("");
  const [weeklyRequirement, setWeeklyRequirement] = useState<number | "">("");
  const [expiryDate, setExpiryDate] = useState<string | "">("");
  const [facilities, setFacilities] = useState<{ id: string; name: string }[]>([]); // ✅ Store facilities list
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null); // ✅ Store selected facility
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Medicine and Facilities
  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // Fetch facilities for dropdown
      const facilitiesRes = await fetch(`/api/facilities`);
      if (facilitiesRes.ok) {
        const facilitiesData = await facilitiesRes.json();
        setFacilities(facilitiesData);
      }

      // Fetch medicine details
      const medicineRes = await fetch(`/api/medicines/${id}`);
      if (medicineRes.ok) {
        const data = await medicineRes.json();
        setName(data.name);
        setStock(data.stock);
        setWeeklyRequirement(data.weeklyRequirement);
        setExpiryDate(data.expiryDate ? data.expiryDate.split("T")[0] : "");
        setSelectedFacility(data.facilityId || null); // ✅ Set selected facility
      }

      setLoading(false);
    }

    fetchData();
  }, [id]);

  // Handle Form Submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch(`/api/medicines/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        stock: Number(stock),
        weeklyRequirement: Number(weeklyRequirement),
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
        facilityId: selectedFacility, // ✅ Send selected facility ID
      }),
    });

    if (res.ok) {
      setSuccessMessage("Medicine updated successfully!");
      setTimeout(() => {
        router.refresh();
        router.push("/dashboard");
      }, 2000);
    }
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-4">
      {successMessage && (
        <Alert className="mb-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700 w-full max-w-md">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-gray-500 w-10 h-10" />
        </div>
      ) : (
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">Edit Medicine</h1>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Medicine Name */}
              <div>
                <label className="block text-sm font-medium mb-1">Medicine Name</label>
                <Input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium mb-1">Stock</label>
                <Input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value === "" ? "" : Number(e.target.value))}
                  required
                />
              </div>

              {/* Weekly Requirement */}
              <div>
                <label className="block text-sm font-medium mb-1">Weekly Requirement</label>
                <Input
                  type="number"
                  value={weeklyRequirement}
                  onChange={(e) =>
                    setWeeklyRequirement(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  required
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium mb-1">Expiry Date</label>
                <Input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>

              {/* Facilities Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-1">Facility</label>
                <Select
                  value={selectedFacility || ""}
                  onValueChange={(value) => setSelectedFacility(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a facility" />
                  </SelectTrigger>
                  <SelectContent>
                    {facilities.map((facility) => (
                      <SelectItem key={facility.id} value={facility.id}>
                        {facility.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Buttons */}
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Update Medicine
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

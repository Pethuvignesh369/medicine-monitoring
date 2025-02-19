"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function AddMedicine() {
  const [name, setName] = useState("");
  const [stock, setStock] = useState<number | "">("");
  const [weeklyRequirement, setWeeklyRequirement] = useState<number | "">("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/medicines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        stock: Number(stock),
        weeklyRequirement: Number(weeklyRequirement),
      }),
    });

    if (res.ok) {
      setSuccessMessage("Medicine added successfully!");
      setTimeout(() => {
        router.push("/dashboard?success=added");
      }, 2000); // Redirect after 2 seconds
    } else {
      alert("Failed to add medicine. Please try again.");
    }
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-4">
      {/* Success Message */}
      {successMessage && (
        <Alert className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 w-full max-w-md">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <h1 className="text-2xl font-bold text-center">Add Medicine</h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Medicine Name</label>
              <Input
                type="text"
                placeholder="Enter medicine name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <Input
                type="number"
                placeholder="Enter stock quantity"
                value={stock}
                onChange={(e) => setStock(e.target.value === "" ? "" : Number(e.target.value))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Weekly Requirement</label>
              <Input
                type="number"
                placeholder="Enter weekly requirement"
                value={weeklyRequirement}
                onChange={(e) => setWeeklyRequirement(e.target.value === "" ? "" : Number(e.target.value))}
                required
              />
            </div>

            <CardFooter className="flex justify-center">
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                Add Medicine
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

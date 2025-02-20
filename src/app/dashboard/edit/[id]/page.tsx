"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react"; // ✅ Import the loader icon

export default function EditMedicine() {
  const router = useRouter();
  const { id } = useParams();
  const [name, setName] = useState("");
  const [stock, setStock] = useState(0);
  const [weeklyRequirement, setWeeklyRequirement] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // ✅ Loading state

  useEffect(() => {
    async function fetchMedicine() {
      setLoading(true); // ✅ Start loading
      const res = await fetch(`/api/medicines/${id}`);
      if (res.ok) {
        const data = await res.json();
        setName(data.name);
        setStock(data.stock);
        setWeeklyRequirement(data.weeklyRequirement);
      }
      setLoading(false); // ✅ Stop loading after fetching data
    }
    fetchMedicine();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/medicines/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, stock, weeklyRequirement }),
    });

    if (res.ok) {
      setSuccessMessage("Medicine updated successfully!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000); // Redirect after 2 seconds
    }
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-4">
      {/* Success Message */}
      {successMessage && (
        <Alert className="mb-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700 w-full max-w-md">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        // ✅ Loader while fetching data
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-gray-500 w-10 h-10" />
        </div>
      ) : (
        // ✅ Show form after data is loaded
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">Edit Medicine</h1>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Medicine Name</label>
                <Input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Stock</label>
                <Input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Weekly Requirement</label>
                <Input
                  type="number"
                  value={weeklyRequirement}
                  onChange={(e) => setWeeklyRequirement(Number(e.target.value))}
                  required
                />
              </div>

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

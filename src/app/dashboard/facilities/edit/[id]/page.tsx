"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function EditFacility() {
  const router = useRouter();
  const { id } = useParams();
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const facilityTypes = ["Hospital", "Clinic", "Dispensary", "Polyclinic"];

  useEffect(() => {
    async function fetchFacility() {
      setLoading(true);
      const res = await fetch(`/api/facilities/${id}`);
      if (res.ok) {
        const data = await res.json();
        setName(data.name);
        setType(data.type);
      }
      setLoading(false);
    }
    fetchFacility();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch(`/api/facilities/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type }),
    });

    if (res.ok) {
      setSuccessMessage("Facility updated successfully!");
      setTimeout(() => {
        router.refresh();
        router.push("/dashboard/facilities");
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
        <div className="w-full max-w-md shadow-lg p-6 bg-white rounded-md">
          <h1 className="text-2xl font-bold text-center mb-4">Edit Facility</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Facility Name</label>
              <Input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Facility Type</label>
              <select
                className="w-full border px-3 py-2 rounded-md"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              >
                <option value="" disabled>Select Type</option>
                {facilityTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard/facilities")}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Update Facility
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";

const ALERT_TIMEOUT = 3000;

interface Facility {
  id: number;
  name: string;
  type: string;
}

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
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [open, setOpen] = useState(false);
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
        setTimeout(() => setErrorMessage(null), ALERT_TIMEOUT);
      }
    };
    fetchFacilities();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!medicine.name || !medicine.stock || !medicine.weeklyRequirement || !medicine.facilityId) {
      setErrorMessage("Please fill all required fields.");
      setTimeout(() => setErrorMessage(null), ALERT_TIMEOUT);
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
      setTimeout(() => setErrorMessage(null), ALERT_TIMEOUT);
      return;
    }

    setSuccessMessage("Medicine added successfully!");
    setTimeout(() => {
      setSuccessMessage(null);
      router.push("/dashboard");
    }, ALERT_TIMEOUT);
    setMedicine({ name: "", stock: "", weeklyRequirement: "", expiryDate: "", facilityId: "" });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="pt-20">
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
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {medicine.facilityId
                    ? facilities.find((f) => f.id === parseInt(medicine.facilityId))?.name
                    : "Select Facility"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search facility..." />
                  <CommandList>
                    <CommandEmpty>No facility found.</CommandEmpty>
                    {facilities.map((facility) => (
                      <CommandItem
                        key={facility.id}
                        value={`${facility.name} (${facility.type})`}
                        onSelect={() => {
                          setMedicine({
                            ...medicine,
                            facilityId: facility.id.toString(),
                          });
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            medicine.facilityId === facility.id.toString() ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {facility.name} ({facility.type})
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <div className="flex space-x-2">
              <Button type="submit" className="flex-1">Add Medicine</Button>
              <Button type="button" variant="outline" className="flex-1" onClick={() => router.push("/dashboard")}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
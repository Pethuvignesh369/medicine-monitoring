"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const MOBILE_BREAKPOINT = 768; // Same as dashboard

export default function UsageHistory() {
  const [usageData, setUsageData] = useState<
    { id: number; quantity: number; usageDate: string; medicine: { name: string } }[]
  >([]);
  const [medicineName, setMedicineName] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchUsage = async () => {
      const res = await fetch(`/api/medicines/${id}/usage`);
      if (res.ok) {
        const data = await res.json();
        setUsageData(data);
        if (data.length > 0) {
          setMedicineName(data[0].medicine.name);
        }
      }
    };
    fetchUsage();

    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="pt-20 p-4">
        <Card>
          <CardHeader className="flex flex-col md:flex-row justify-between items-center gap-2">
            <h1 className="text-2xl font-bold">Usage History for {medicineName}</h1>
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </CardHeader>
          <CardContent>
            {isMobile ? (
              <div className="space-y-4">
                {usageData.map((entry) => (
                  <Card key={entry.id} className="p-4 shadow-md">
                    <h2 className="text-lg font-bold">{entry.medicine.name}</h2>
                    <p>
                      <strong>Date:</strong>{" "}
                      {new Date(entry.usageDate).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Quantity Used:</strong> {entry.quantity}
                    </p>
                  </Card>
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medicine</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Quantity Used</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usageData.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.medicine.name}</TableCell>
                      <TableCell>
                        {new Date(entry.usageDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{entry.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
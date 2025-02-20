"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react"; 

type Medicine = {
  id: number;
  name: string;
  stock: number;
  weeklyRequirement: number;
};

// ✅ Separate component to handle search params inside Suspense
function SearchParamsComponent({ setSuccessMessage }: { setSuccessMessage: (msg: string | null) => void }) {
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  useEffect(() => {
    if (success) {
      setSuccessMessage("Medicine updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  }, [success]);

  return null;
}

export default function DashboardPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const res = await fetch("/api/medicines");
      const data = await res.json();
      setMedicines(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  function openModal(id: number) {
    setDeleteId(id);
    setIsModalOpen(true);
  }

  function closeModal() {
    setDeleteId(null);
    setIsModalOpen(false);
  }

  async function deleteMedicine() {
    if (deleteId !== null) {
      const res = await fetch(`/api/medicines/${deleteId}`, { method: "DELETE" });

      if (res.ok) {
        setMedicines((prevMedicines) => prevMedicines.filter((med) => med.id !== deleteId));
        setSuccessMessage("Medicine deleted successfully!");

        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        alert("Failed to delete the medicine. Please try again.");
      }
    }
    closeModal();
  }

  return (
    <div className="container mx-auto p-6">
      {/* ✅ Suspense Wrapper for useSearchParams() */}
      <Suspense fallback={null}>
        <SearchParamsComponent setSuccessMessage={setSuccessMessage} />
      </Suspense>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-gray-500 w-10 h-10" />
        </div>
      ) : (
        <>
          {successMessage && (
            <Alert className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <Card className="shadow-lg">
            <CardHeader className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Medicine Dashboard</h1>
              <Link href="/dashboard/add">
                <Button className="bg-green-600 hover:bg-green-700">+ Add Medicine</Button>
              </Link>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Weekly Requirement</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medicines.length > 0 ? (
                    medicines.map((med) => (
                      <TableRow key={med.id}>
                        <TableCell>{med.name}</TableCell>
                        <TableCell>{med.stock}</TableCell>
                        <TableCell>{med.weeklyRequirement}</TableCell>
                        <TableCell>
                          <Badge className={getBadgeColor(med.stock, med.weeklyRequirement)}>
                            {getStockStatus(med.stock, med.weeklyRequirement)}
                          </Badge>
                        </TableCell>
                        <TableCell className="space-x-2">
                          <Link href={`/dashboard/edit/${med.id}?success=updated`}>
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          </Link>
                          <Button size="sm" variant="destructive" onClick={() => openModal(med.id)}>
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                        No medicines found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Delete Confirmation Modal */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
              </DialogHeader>
              <p>Are you sure you want to delete this medicine?</p>
              <DialogFooter className="flex justify-end space-x-2">
                <Button variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={deleteMedicine}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}

// Helper functions for status
function getStockStatus(stock: number, weeklyRequirement: number) {
  return stock < weeklyRequirement ? "Low Stock" : "Sufficient";
}

function getBadgeColor(stock: number, weeklyRequirement: number) {
  return stock < weeklyRequirement ? "bg-red-600 text-white" : "bg-green-600 text-white";
}

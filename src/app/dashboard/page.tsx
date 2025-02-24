"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, Package, AlertTriangle, CalendarX, XCircle, FileText, FileSpreadsheet } from "lucide-react";
import MedicineStockChart from "@/components/MedicineStockChart";
import { Pagination } from "@/components/ui/pagination";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import Navbar from "@/components/Navbar";

const ITEMS_PER_PAGE = 5;
const MOBILE_BREAKPOINT = 768;
const ALERT_TIMEOUT = 3000;
const EXPIRY_WARNING_DAYS = 7;

interface Facility {
  id: number;
  name: string;
  type: string;
}

interface Medicine {
  id: number;
  name: string;
  stock: number;
  weeklyRequirement: number;
  expiryDate: string | null;
  facility: Facility;
}

export default function VeterinaryMedicineDashboard() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [facilityFilter, setFacilityFilter] = useState<string>("All");
  const [usageInputs, setUsageInputs] = useState<{ [key: number]: string }>({});

  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/medicines");
        if (!res.ok) throw new Error('Failed to fetch veterinary medicine data');
        const data = await res.json();
        if (mounted) {
          setMedicines(data);
        }
      } catch (error) {
        console.error("Error fetching veterinary medicines:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      mounted = false;
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const exportToPDF = useCallback(() => {
    const doc = new jsPDF();
    const currentDate = new Date();

    const filteredMeds = facilityFilter === "All" ? medicines : medicines.filter(med => med.facility.type === facilityFilter);

    const tableData = {
      totalStock: filteredMeds.reduce((sum, med) => sum + med.stock, 0),
      nonExpired: filteredMeds.filter(med => !med.expiryDate || new Date(med.expiryDate) >= currentDate),
      expired: filteredMeds.filter(med => med.expiryDate && new Date(med.expiryDate) < currentDate)
    };

    doc.text("Veterinary Medicine Inventory Report", 14, 10);
    doc.text(`Total Stock Across ${facilityFilter === "All" ? "All Facilities" : facilityFilter}: ${tableData.totalStock}`, 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [["Name", "Stock", "Weekly Requirement", "Expiry Date", "Facility"]],
      body: tableData.nonExpired.map(med => [
        med.name,
        med.stock,
        med.weeklyRequirement,
        med.expiryDate ? formatDate(med.expiryDate) : "N/A",
        med.facility.name
      ]),
    });

    if (tableData.expired.length) {
      doc.addPage();
      autoTable(doc, {
        startY: 20,
        head: [["Name", "Stock", "Expiry Date", "Facility"]],
        body: tableData.expired.map(med => [
          med.name,
          med.stock,
          med.expiryDate ? formatDate(med.expiryDate) : "N/A",
          med.facility.name
        ]),
      });
    }

    doc.save(`veterinary_medicine_inventory_${getTimestamp()}.pdf`);
  }, [medicines, facilityFilter]);

  const exportToExcel = useCallback(() => {
    const filteredMeds = facilityFilter === "All" ? medicines : medicines.filter(med => med.facility.type === facilityFilter);

    const totalStock = filteredMeds.reduce((sum, med) => sum + med.stock, 0);
    const currentDate = new Date();
    const expired = filteredMeds.filter(med => med.expiryDate && new Date(med.expiryDate) < currentDate);
    const nonExpired = filteredMeds.filter(med => !med.expiryDate || new Date(med.expiryDate) >= currentDate);

    const data = [
      { Name: `Total Stock Across ${facilityFilter === "All" ? "All Facilities" : facilityFilter}`, Stock: totalStock },
      { Name: "Available Medicines" },
      ...nonExpired.map(med => ({
        Name: med.name,
        Stock: med.stock,
        "Weekly Requirement": med.weeklyRequirement,
        "Expiry Date": med.expiryDate ? formatDate(med.expiryDate) : "N/A",
        Facility: med.facility.name,
      })),
      ...(expired.length ? [{ Name: "Expired Medicines" }] : []),
      ...expired.map(med => ({
        Name: med.name,
        Stock: med.stock,
        "Weekly Requirement": "",
        "Expiry Date": med.expiryDate ? formatDate(med.expiryDate) : "N/A",
        Facility: med.facility.name,
      }))
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Veterinary Inventory");
    XLSX.writeFile(workbook, `veterinary_medicine_inventory_${getTimestamp()}.xlsx`);
  }, [medicines, facilityFilter]);

  const handleDelete = useCallback(async () => {
    if (deleteId === null) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/medicines/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        setMedicines(prev => prev.filter(med => med.id !== deleteId));
        setSuccessMessage("Medicine removed successfully!");
        setTimeout(() => setSuccessMessage(null), ALERT_TIMEOUT);
        setIsModalOpen(false);
        setDeleteId(null);
      } else {
        throw new Error("Failed to delete");
      }
    } catch (error) {
      alert("Failed to remove the medicine. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [deleteId]);

  const handleUsageSubmit = async (medicineId: number) => {
    const quantity = parseInt(usageInputs[medicineId] || "0", 10);
    if (isNaN(quantity) || quantity <= 0) {
      alert("Please enter a valid positive quantity");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/medicine-usage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicineId, quantity }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to log usage");
      }

      const updatedMedicines = await fetch("/api/medicines").then(r => r.json());
      setMedicines(updatedMedicines);
      setSuccessMessage(`Usage of ${quantity} units logged successfully!`);
      setTimeout(() => setSuccessMessage(null), ALERT_TIMEOUT);
      setUsageInputs(prev => ({ ...prev, [medicineId]: "" }));
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message || "Failed to log usage");
      } else {
        alert("An unexpected error occurred while logging usage");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredMedicines = useMemo(() => {
    if (facilityFilter === "All") return medicines;
    return medicines.filter(med => med.facility.type === facilityFilter);
  }, [medicines, facilityFilter]);

  const currentMedicines = useMemo(() => {
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    return filteredMedicines.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredMedicines, currentPage]);

  const totalStockValue = useMemo(() => totalStock(filteredMedicines), [filteredMedicines]);

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <Navbar />
      <div className="container mx-auto p-4">
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

            <div className="flex flex-wrap justify-center md:justify-end gap-2 mb-4">
              <Badge className="px-3 py-1 text-xs bg-blue-600 text-white flex items-center gap-1">
                <Package size={14} /> Total Stock: {totalStockValue}
              </Badge>
              <Badge className="px-3 py-1 text-xs bg-yellow-600 text-white flex items-center gap-1">
                <AlertTriangle size={14} /> Low Stock: {lowStockCount(filteredMedicines)}
              </Badge>
              <Badge className="px-3 py-1 text-xs bg-orange-500 text-white flex items-center gap-1">
                <CalendarX size={14} /> Expiring Soon: {expiringSoonCount(filteredMedicines)}
              </Badge>
              <Badge className="px-3 py-1 text-xs bg-red-600 text-white flex items-center gap-1">
                <CalendarX size={14} /> Expired: {expiredCount(filteredMedicines)}
              </Badge>
            </div>

            {filteredMedicines.length > 0 && <MedicineStockChart medicines={filteredMedicines} />}

            <Card className="shadow-lg mt-4">
              <CardHeader className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold">Veterinary Medicine Dashboard</h1>
                <div className="flex flex-col md:flex-row items-center gap-2">
                  <Link href="/dashboard/add">
                    <Button className="bg-green-600 hover:bg-green-700">+ Add Medicine</Button>
                  </Link>
                  <select 
                    value={facilityFilter} 
                    onChange={(e) => setFacilityFilter(e.target.value)}
                    className="p-2 border rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">All Facilities</option>
                    <option value="Dispensary">Dispensaries</option>
                    <option value="Hospital">Hospitals</option>
                    <option value="ClinicianCenter">Clinician Centers</option>
                    <option value="Polyclinic">Polyclinics</option>
                  </select>
                  <Button 
                    className="bg-blue-500 hover:bg-blue-600 px-3 py-1 text-xs" 
                    size="sm" 
                    onClick={exportToPDF}
                  >
                    <FileText size={14} className="mr-1" /> Export as PDF
                  </Button>
                  <Button 
                    className="bg-green-500 hover:bg-green-600 px-3 py-1 text-xs" 
                    size="sm" 
                    onClick={exportToExcel}
                  >
                    <FileSpreadsheet size={14} className="mr-1" /> Export as Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isMobile ? (
                  <div className="space-y-4">
                    {currentMedicines.map((med) => (
                      <Card key={med.id} className="p-4 shadow-md">
                        <h2 className="text-lg font-bold">{med.name}</h2>
                        <p><strong>Stock:</strong> {med.stock}</p>
                        <p><strong>Weekly Requirement:</strong> {med.weeklyRequirement}</p>
                        <p className={getExpiryColor(med.expiryDate)}>
                          <strong>Expiry Date:</strong> {med.expiryDate ? formatDate(med.expiryDate) : "N/A"}
                        </p>
                        <p><strong>Facility:</strong> {med.facility.name}</p>
                        <Badge className={getBadgeColor(med.stock, med.weeklyRequirement, med.expiryDate)}>
                          {getStockStatus(med.stock, med.weeklyRequirement, med.expiryDate)}
                        </Badge>
                        <div className="mt-2 space-x-2">
                          <Link href={`/dashboard/edit/${med.id}`}>
                            <Button size="sm" variant="outline">Edit</Button>
                          </Link>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => {
                              setIsModalOpen(true);
                              setDeleteId(med.id);
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="Today’s Usage"
                            value={usageInputs[med.id] || ""}
                            onChange={(e) => setUsageInputs(prev => ({ ...prev, [med.id]: e.target.value }))}
                            className="w-24"
                            min="0"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleUsageSubmit(med.id)}
                            disabled={!usageInputs[med.id] || parseInt(usageInputs[med.id]) <= 0}
                          >
                            Log Usage
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Weekly Requirement</TableHead>
                          <TableHead>Expiry Date</TableHead>
                          <TableHead>Facility</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Today’s Usage</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentMedicines.map((med) => (
                          <TableRow key={med.id}>
                            <TableCell>{med.name}</TableCell>
                            <TableCell>{med.stock}</TableCell>
                            <TableCell>{med.weeklyRequirement}</TableCell>
                            <TableCell className={getExpiryColor(med.expiryDate)}>
                              {med.expiryDate ? formatDate(med.expiryDate) : "N/A"}
                            </TableCell>
                            <TableCell>{med.facility.name}</TableCell>
                            <TableCell>
                              <Badge className={getBadgeColor(med.stock, med.weeklyRequirement, med.expiryDate)}>
                                {getStockStatus(med.stock, med.weeklyRequirement, med.expiryDate)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  placeholder="Usage"
                                  value={usageInputs[med.id] || ""}
                                  onChange={(e) => setUsageInputs(prev => ({ ...prev, [med.id]: e.target.value }))}
                                  className="w-20"
                                  min="0"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleUsageSubmit(med.id)}
                                  disabled={!usageInputs[med.id] || parseInt(usageInputs[med.id]) <= 0}
                                >
                                  Log
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="space-x-2">
                              <Link href={`/dashboard/edit/${med.id}`}>
                                <Button size="sm" variant="outline">Edit</Button>
                              </Link>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={() => {
                                  setIsModalOpen(true);
                                  setDeleteId(med.id);
                                }}
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                <div className="container mx-auto p-4 pb-2"/>
                <Pagination 
                  currentPage={currentPage} 
                  totalItems={filteredMedicines.length} 
                  itemsPerPage={ITEMS_PER_PAGE} 
                  setPage={setCurrentPage} 
                />
              </CardContent>
            </Card>
          </>
        )}

        <Dialog 
          open={isModalOpen} 
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) setDeleteId(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to remove this veterinary medicine?</p>
            <DialogFooter className="mt-4 flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsModalOpen(false);
                  setDeleteId(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });

const getStockStatus = (stock: number, weeklyRequirement: number, expiryDate: string | null): string =>
  expiryDate && new Date(expiryDate) < new Date() ? "Expired" : stock < weeklyRequirement ? "Low Stock" : "Sufficient";

const getBadgeColor = (stock: number, weeklyRequirement: number, expiryDate: string | null): string =>
  expiryDate && new Date(expiryDate) < new Date() ? "bg-red-600 text-white" : stock < weeklyRequirement ? "bg-yellow-600 text-white" : "bg-green-600 text-white";

const getExpiryColor = (expiryDate: string | null): string =>
  !expiryDate ? "text-gray-500" : new Date(expiryDate) < new Date() ? "text-red-600 font-bold" : "text-green-600";

const totalStock = (medicines: Medicine[]): number =>
  medicines.reduce((total, med) => total + med.stock, 0);

const lowStockCount = (medicines: Medicine[]): number =>
  medicines.filter(med => med.stock < med.weeklyRequirement).length;

const expiringSoonCount = (medicines: Medicine[]): number => {
  const today = new Date();
  return medicines.filter(med => 
    med.expiryDate && 
    new Date(med.expiryDate) > today && 
    new Date(med.expiryDate) <= new Date(today.setDate(today.getDate() + EXPIRY_WARNING_DAYS))
  ).length;
};

const expiredCount = (medicines: Medicine[]): number =>
  medicines.filter(med => med.expiryDate && new Date(med.expiryDate) < new Date()).length;

const getTimestamp = (): string =>
  new Date().toISOString().replace(/[:.-]/g, "_");
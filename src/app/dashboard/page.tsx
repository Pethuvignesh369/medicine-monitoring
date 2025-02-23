"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Package, AlertTriangle, CalendarX, XCircle, FileText, FileSpreadsheet } from "lucide-react";
import MedicineStockChart from "@/components/MedicineStockChart";
import { Pagination } from "@/components/ui/pagination";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

type Facility = {
  id: number;
  name: string;
  type: string;
};

type Medicine = {
  id: number;
  name: string;
  stock: number;
  weeklyRequirement: number;
  expiryDate: string | null;
  facility: Facility | string;
};

export default function DashboardPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [alerts, setAlerts] = useState<{ id: number; message: string }[]>([]);
  const itemsPerPage = 5;
  const router = useRouter();

  useEffect(() => {
    fetchMedicines();
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  async function fetchMedicines() {
    setLoading(true);
    try {
      const res = await fetch("/api/medicines");
      const data = await res.json();
      setMedicines(data);
      generateAlerts(data);
    } catch (error) {
      console.error("Error fetching medicines:", error);
    }
    setLoading(false);
  }

  function generateAlerts(medicines: Medicine[]) {
    let newAlerts: { id: number; message: string }[] = [];
    medicines.forEach((med) => {
      if (med.expiryDate && new Date(med.expiryDate) < new Date()) {
        newAlerts.push({ id: med.id, message: `⚠️ ${med.name} is expired!` });
      } else if (med.stock < med.weeklyRequirement) {
        newAlerts.push({ id: med.id, message: `⚠️ ${med.name} is running low on stock!` });
      }
    });
    setAlerts(newAlerts);
  }

  function getTimestamp() {
    const now = new Date();
    return now.toISOString().replace(/[:.-]/g, "_"); // Replace special characters
  }

  function exportToPDF() {
    const doc = new jsPDF();
    doc.text("Medicine Inventory Report", 14, 10);
  
    // Calculate total stock
    const totalStock = medicines.reduce((sum, med) => sum + med.stock, 0);
  
    // Categorize medicines
    const currentDate = new Date();
    const expiredMedicines = medicines.filter(med => med.expiryDate && new Date(med.expiryDate) < currentDate);
    const nonExpiredMedicines = medicines.filter(med => med.expiryDate && new Date(med.expiryDate) >= currentDate);
  
    // Add total stock info
    doc.text(`Total Stock: ${totalStock}`, 14, 20);
  
    // Add non-expired medicines
    doc.text("Available Medicines:", 14, 30);
    autoTable(doc, {
      startY: 35,
      head: [["Name", "Stock", "Weekly Requirement", "Expiry Date", "Facility"]],
      body: nonExpiredMedicines.map((med) => [
        med.name,
        med.stock,
        med.weeklyRequirement,
        med.expiryDate ? formatDate(med.expiryDate) : "N/A",
        typeof med.facility === "object" ? med.facility.name : med.facility,
      ]),
    });
  
    // Add expired medicines
    if (expiredMedicines.length > 0) {
      doc.addPage();
      doc.text("Expired Medicines:", 14, 10);
      autoTable(doc, {
        startY: 20,
        head: [["Name", "Stock", "Expiry Date", "Facility"]],
        body: expiredMedicines.map((med) => [
          med.name,
          med.stock,
          med.expiryDate ? formatDate(med.expiryDate) : "N/A",
          typeof med.facility === "object" ? med.facility.name : med.facility,
        ]),
      });
    }
  
    const filename = `medicine_inventory_${getTimestamp()}.pdf`;
    doc.save(filename);
  }
  
  function exportToExcel() {
    const totalStock = medicines.reduce((sum, med) => sum + med.stock, 0);
    const currentDate = new Date();
    const expiredMedicines = medicines.filter(med => med.expiryDate && new Date(med.expiryDate) < currentDate);
    const nonExpiredMedicines = medicines.filter(med => med.expiryDate && new Date(med.expiryDate) >= currentDate);
  
    // Prepare worksheet data
    let data = [
      { Name: "Total Stock", Stock: totalStock, "Weekly Requirement": "", "Expiry Date": "", Facility: "" },
      { Name: "Available Medicines", Stock: "", "Weekly Requirement": "", "Expiry Date": "", Facility: "" },
      ...nonExpiredMedicines.map(med => ({
        Name: med.name,
        Stock: med.stock,
        "Weekly Requirement": med.weeklyRequirement,
        "Expiry Date": med.expiryDate ? formatDate(med.expiryDate) : "N/A",
        Facility: typeof med.facility === "object" ? med.facility.name : med.facility,
      })),
    ];
  
    if (expiredMedicines.length > 0) {
      data.push({ Name: "Expired Medicines", Stock: "", "Weekly Requirement": "", "Expiry Date": "", Facility: "" });
      data = data.concat(
        expiredMedicines.map(med => ({
          Name: med.name,
          Stock: med.stock,
          "Weekly Requirement": "",
          "Expiry Date": med.expiryDate ? formatDate(med.expiryDate) : "N/A",
          Facility: typeof med.facility === "object" ? med.facility.name : med.facility,
        }))
      );
    }
  
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Medicine Inventory");
    const filename = `medicine_inventory_${getTimestamp()}.xlsx`;
    XLSX.writeFile(workbook, filename);
  }
  

  function dismissAlert(id: number) {
    setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
  }

  function checkScreenSize() {
    setIsMobile(window.innerWidth < 768);
  }

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
        fetchMedicines();
        setSuccessMessage("Medicine deleted successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        alert("Failed to delete the medicine. Please try again.");
      }
    }
    closeModal();
  }

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMedicines = medicines.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="container mx-auto p-4">

      
      {/* Automated Alerts Section */}
      {alerts.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-bold mb-2">🚨 Automated Alerts</h2>
          {alerts.map((alert) => (
            <Alert 
              key={alert.id} 
              className="flex items-center justify-between bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 mb-2"
            >
              <div>
                <AlertTitle>Alert</AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => dismissAlert(alert.id)}
              >
                <XCircle className="w-5 h-5 text-gray-600" />
              </Button>
            </Alert>
          ))}

        </div>
      )}

      {/* Export Buttons */}
      <div className="flex justify-end space-x-2 mb-4">
  <Button 
    className="bg-blue-500 hover:bg-blue-600 px-3 py-1 text-sm" 
    size="sm" 
    onClick={exportToPDF}
  >
    <FileText size={14} className="mr-1" /> Export as PDF
  </Button>
  <Button 
    className="bg-green-500 hover:bg-green-600 px-3 py-1 text-sm" 
    size="sm" 
    onClick={exportToExcel}
  >
    <FileSpreadsheet size={14} className="mr-1" /> Export as Excel
  </Button>
</div>

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

          

          {/* Statistics Badges */}
          <div className="flex flex-wrap justify-center md:justify-end gap-2 mb-4">
            <Badge className="px-3 py-1 text-xs bg-blue-600 text-white flex items-center gap-1">
              <Package size={14} /> <span>Total Stock:</span> {totalStock(medicines)}
            </Badge>
            <Badge className="px-3 py-1 text-xs bg-yellow-600 text-white flex items-center gap-1">
              <AlertTriangle size={14} /> <span>Low Stock:</span> {lowStockCount(medicines)}
            </Badge>
            <Badge className="px-3 py-1 text-xs bg-red-600 text-white flex items-center gap-1">
              <CalendarX size={14} /> <span>Expiring Soon:</span> {expiringSoonCount(medicines)}
            </Badge>
            <Badge className="px-3 py-1 text-xs bg-gray-800 text-white flex items-center gap-1">
              <CalendarX size={14} /> <span>Expired:</span> {expiredCount(medicines)}
            </Badge>
          </div>

          {medicines.length > 0 && <MedicineStockChart medicines={medicines} />}

          <Card className="shadow-lg">
            <CardHeader className="flex flex-col md:flex-row md:justify-between md:items-center">
              <h1 className="text-xl md:text-2xl font-bold">Medicine Dashboard</h1>
              
              <Link href="/dashboard/add">
                <Button className="bg-green-600 hover:bg-green-700 mt-2 md:mt-0">+ Add Medicine</Button>
              </Link>
            </CardHeader>

            <CardContent>
              {/* Mobile View - Card List */}
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
                      <p><strong>Facility:</strong> {typeof med.facility === "object" ? med.facility.name : med.facility}</p>
                      <Badge className={getBadgeColor(med.stock, med.weeklyRequirement, med.expiryDate)}>
                        {getStockStatus(med.stock, med.weeklyRequirement, med.expiryDate)}
                      </Badge>
                      <div className="mt-2 space-x-2">
                        <Link href={`/dashboard/edit/${med.id}`}>
                          <Button size="sm" variant="outline">Edit</Button>
                        </Link>
                        <Button size="sm" variant="destructive" onClick={() => openModal(med.id)}>Delete</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                // Desktop View - Table
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
                          <TableCell>
                            {typeof med.facility === "object" ? med.facility.name : med.facility}
                          </TableCell>
                          <TableCell>
                            <Badge className={getBadgeColor(med.stock, med.weeklyRequirement, med.expiryDate)}>
                              {getStockStatus(med.stock, med.weeklyRequirement, med.expiryDate)}
                            </Badge>
                          </TableCell>
                          <TableCell className="space-x-2">
                            <Link href={`/dashboard/edit/${med.id}`}>
                              <Button size="sm" variant="outline">Edit</Button>
                            </Link>
                            <Button size="sm" variant="destructive" onClick={() => openModal(med.id)}>
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <Pagination currentPage={currentPage} totalItems={medicines.length} itemsPerPage={itemsPerPage} setPage={setCurrentPage} />
              
            </CardContent>
          </Card>
          <div className="container mx-auto p-4 pb-16"/> {/* Added pb-16 for spacing */} 
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this medicine?</p>
          <DialogFooter className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteMedicine}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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

// ✅ Helper functions
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function getStockStatus(stock: number, weeklyRequirement: number, expiryDate: string | null) {
  return expiryDate && new Date(expiryDate) < new Date() ? "Expired" : stock < weeklyRequirement ? "Low Stock" : "Sufficient";
}

function getBadgeColor(stock: number, weeklyRequirement: number, expiryDate: string | null) {
  return expiryDate && new Date(expiryDate) < new Date() ? "bg-red-600 text-white" : stock < weeklyRequirement ? "bg-yellow-600 text-white" : "bg-green-600 text-white";
}

function getExpiryColor(expiryDate: string | null) {
  return !expiryDate ? "text-gray-500" : new Date(expiryDate) < new Date() ? "text-red-600 font-bold" : "text-green-600";
}

function totalStock(medicines: Medicine[]) {
  return medicines.reduce((total, med) => total + med.stock, 0);
}

function lowStockCount(medicines: Medicine[]) {
  return medicines.filter(med => med.stock < med.weeklyRequirement).length;
}

function expiringSoonCount(medicines: Medicine[]) {
    const today = new Date();
    return medicines.filter(med => 
      med.expiryDate && 
      new Date(med.expiryDate) > today && // Should not be expired
      new Date(med.expiryDate) <= new Date(today.setDate(today.getDate() + 7)) // Expiring within 7 days
    ).length;
  }

function expiredCount(medicines: Medicine[]) {
    return medicines.filter(med => med.expiryDate && new Date(med.expiryDate) < new Date()).length;
  }


"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Activity, Loader2, FileText, FileSpreadsheet, Edit2, Trash2, BarChart2, Home, PlusCircle, Building2, ChevronLeft, ChevronRight, CheckCircle, Plus, Pill, AlertTriangle, Clock, ChevronDown, Package, Calendar, Check, BarChart, Settings } from "lucide-react";
import MedicineStockChart from "@/components/MedicineStockChart";
import StockMetricsChart from "@/components/StockMetricsChart";
import { Pagination } from "@/components/ui/pagination";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";

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
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();

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

  // Fixed delete handler with better error handling and response processing
  const handleDelete = useCallback(async () => {
    if (deleteId === null) return;
    setLoading(true);
    setDeleteError(null);
    
    try {
      const res = await fetch(`/api/medicines/${deleteId}`, { 
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        }
      });
      
      // Parse the response to get more detailed error messages
      const data = await res.json();
      
      if (res.ok) {
        setMedicines(prev => prev.filter(med => med.id !== deleteId));
        setSuccessMessage("Medicine removed successfully!");
        setTimeout(() => setSuccessMessage(null), ALERT_TIMEOUT);
        setIsModalOpen(false);
        setDeleteId(null);
      } else {
        // Use the error message from the server if available
        throw new Error(data.error || "Failed to delete medicine");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to remove the medicine";
      setDeleteError(errorMessage);
      console.error("Delete error:", error);
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

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = (expiry.getTime() - today.getTime()) / (1000 * 3600 * 24);
    return diffDays > 0 && diffDays <= EXPIRY_WARNING_DAYS;
  };

  const filteredByFacility = useMemo(() => {
    if (facilityFilter === "All") return medicines;
    return medicines.filter(med => med.facility.type === facilityFilter);
  }, [medicines, facilityFilter]);

  const filteredMedicines = useMemo(() => {
    let filteredList: Medicine[] = filteredByFacility;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredList = filteredList.filter(med => 
        med.name.toLowerCase().includes(query) ||
        med.facility.name.toLowerCase().includes(query)
      );
    }

    return filteredList;
  }, [filteredByFacility, searchQuery]);

  const currentMedicines = useMemo(() => {
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    return filteredMedicines.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredMedicines, currentPage]);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Enhanced Sidebar (Desktop Only) */}
      {!isMobile && (
        <div
          className={cn(
            "fixed top-0 left-0 h-full bg-gradient-to-b from-blue-900 to-teal-800 text-white shadow-lg z-20 transition-all duration-300 ease-in-out",
            isSidebarExpanded ? "w-64" : "w-20"
          )}
        >
          {/* Sidebar Header */}
          <div className={cn(
            "flex items-center p-4 border-b border-teal-700/50",
            isSidebarExpanded ? "justify-between" : "justify-center"
          )}>
            {isSidebarExpanded ? (
              <div className="flex items-center space-x-2">
                <Activity className="w-6 h-6 text-teal-300" />
                <h2 className="text-xl font-bold">VetMed</h2>
              </div>
            ) : (
              <Activity className="w-8 h-8 text-teal-300" />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              className="text-white hover:bg-white/10 rounded-full p-1"
            >
              {isSidebarExpanded ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </Button>
          </div>

          {/* Navigation Section */}
          <div className="py-6">
            <div className="px-4 mb-2">
              <p className={cn(
                "text-xs uppercase tracking-wider text-teal-300/70",
                !isSidebarExpanded && "text-center"
              )}>
                {isSidebarExpanded ? "Main Navigation" : "Menu"}
              </p>
            </div>
            
            <nav className="space-y-1 px-3">
              {/* Home */}
              <Link
                href="/"
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group relative",
                  pathname === "/" 
                    ? "bg-white/20 text-white" 
                    : "hover:bg-white/10 text-white/80 hover:text-white",
                  !isSidebarExpanded && "justify-center p-3"
                )}
              >
                <div className={cn(
                  "relative flex items-center justify-center",
                  pathname === "/" && "text-teal-300"
                )}>
                  <Home className={cn("w-5 h-5")} />
                  {!isSidebarExpanded && pathname === "/" && (
                    <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-teal-400"></span>
                  )}
                </div>
                {isSidebarExpanded && <span>Home</span>}
                
                {/* Tooltip for collapsed state */}
                {!isSidebarExpanded && (
                  <div className="absolute left-full ml-2 rounded bg-gray-900 px-2 py-1 text-xs font-medium text-gray-100 opacity-0 shadow group-hover:opacity-100 whitespace-nowrap z-50">
                    Home
                  </div>
                )}
              </Link>
              
              {/* Dashboard */}
              <Link
                href="/dashboard"
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group relative",
                  pathname === "/dashboard" 
                    ? "bg-white/20 text-white" 
                    : "hover:bg-white/10 text-white/80 hover:text-white",
                  !isSidebarExpanded && "justify-center p-3"
                )}
              >
                <div className={cn(
                  "relative flex items-center justify-center",
                  pathname === "/dashboard" && "text-teal-300"
                )}>
                  <BarChart2 className="w-5 h-5" />
                  {!isSidebarExpanded && pathname === "/dashboard" && (
                    <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-teal-400"></span>
                  )}
                </div>
                {isSidebarExpanded && <span>Dashboard</span>}
                
                {/* Tooltip for collapsed state */}
                {!isSidebarExpanded && (
                  <div className="absolute left-full ml-2 rounded bg-gray-900 px-2 py-1 text-xs font-medium text-gray-100 opacity-0 shadow group-hover:opacity-100 whitespace-nowrap z-50">
                    Dashboard
                  </div>
                )}
              </Link>
              
              {/* Add Medicine */}
              <Link
                href="/dashboard/add"
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group relative",
                  pathname === "/dashboard/add" 
                    ? "bg-white/20 text-white" 
                    : "hover:bg-white/10 text-white/80 hover:text-white",
                  !isSidebarExpanded && "justify-center p-3"
                )}
              >
                <div className={cn(
                  "relative flex items-center justify-center",
                  pathname === "/dashboard/add" && "text-teal-300"
                )}>
                  <PlusCircle className="w-5 h-5" />
                  {!isSidebarExpanded && pathname === "/dashboard/add" && (
                    <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-teal-400"></span>
                  )}
                </div>
                {isSidebarExpanded && <span>Add Medicine</span>}
                
                {/* Tooltip for collapsed state */}
                {!isSidebarExpanded && (
                  <div className="absolute left-full ml-2 rounded bg-gray-900 px-2 py-1 text-xs font-medium text-gray-100 opacity-0 shadow group-hover:opacity-100 whitespace-nowrap z-50">
                    Add Medicine
                  </div>
                )}
              </Link>
            </nav>
            
            {/* Admin Section */}
            <div className="mt-8 px-4 mb-2">
              <p className={cn(
                "text-xs uppercase tracking-wider text-teal-300/70",
                !isSidebarExpanded && "text-center"
              )}>
                {isSidebarExpanded ? "Administration" : "Admin"}
              </p>
            </div>
            
            <nav className="space-y-1 px-3">
              {/* Facilities */}
              <Link
                href="/admin/facilities/view"
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group relative",
                  pathname === "/admin/facilities" 
                    ? "bg-white/20 text-white" 
                    : "hover:bg-white/10 text-white/80 hover:text-white",
                  !isSidebarExpanded && "justify-center p-3"
                )}
              >
                <div className={cn(
                  "relative flex items-center justify-center",
                  pathname === "/admin/facilities" && "text-teal-300"
                )}>
                  <Building2 className="w-5 h-5" />
                  {!isSidebarExpanded && pathname === "/admin/facilities" && (
                    <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-teal-400"></span>
                  )}
                </div>
                {isSidebarExpanded && <span>Facilities</span>}
                
                {/* Tooltip for collapsed state */}
                {!isSidebarExpanded && (
                  <div className="absolute left-full ml-2 rounded bg-gray-900 px-2 py-1 text-xs font-medium text-gray-100 opacity-0 shadow group-hover:opacity-100 whitespace-nowrap z-50">
                    Facilities
                  </div>
                )}
              </Link>
            </nav>
          </div>
          
          {/* User Profile Section */}
          <div className={cn(
            "absolute bottom-0 left-0 right-0 border-t border-teal-700/50 p-4",
            isSidebarExpanded ? "flex items-center justify-between" : "flex flex-col items-center"
          )}>
            <div className={cn(
              "flex items-center",
              !isSidebarExpanded && "flex-col space-y-1"
            )}>
              <div className="h-8 w-8 rounded-full bg-teal-200 flex items-center justify-center text-teal-800 font-semibold text-sm">
                A
              </div>
              {isSidebarExpanded && <span className="ml-2 text-sm">Admin User</span>}
            </div>
            
            {isSidebarExpanded ? (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 rounded-full"
              >
                <Settings className="w-4 h-4" />
              </Button>
            ) : null}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {isMobile && <Navbar />}
        <div className={cn(
          "p-4",
          isMobile ? "pt-20" : (isSidebarExpanded ? "pt-0 ml-72 pl-4" : "pt-0 ml-24 pl-4") // Adjusted margins and added padding-left
        )}>
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

              {/* Charts */}
              {filteredMedicines.length > 0 && (
                <div className="mt-6">
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="flex-1">
                      <MedicineStockChart medicines={filteredMedicines} />
                    </div>
                    <div className="flex-1">
                      <StockMetricsChart medicines={filteredMedicines} />
                    </div>
                  </div>
                </div>
              )}

              <Card className="shadow-lg mt-4 border-t-4 border-t-blue-600">
                <CardHeader className="pb-2">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-800">Veterinary Medicine Dashboard</h1>
                      <p className="text-gray-500 text-sm mt-1">Manage and track your inventory across facilities</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <select 
                          value={facilityFilter} 
                          onChange={(e) => setFacilityFilter(e.target.value)}
                          className="p-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full sm:w-40"
                        >
                          <option value="All">All Facilities</option>
                          <option value="Dispensary">Dispensaries</option>
                          <option value="Hospital">Hospitals</option>
                          <option value="ClinicianCenter">Clinician Centers</option>
                          <option value="Polyclinic">Polyclinics</option>
                        </select>
                        <div className="w-full sm:w-64">
                          <Input
                            type="text"
                            placeholder="Search medicines..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="p-2 border rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full placeholder-gray-400"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Link href="/dashboard/add" className="w-full sm:w-auto">
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                            <Plus size={16} className="mr-1" /> Add Medicine
                          </Button>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="border-gray-300 w-full sm:w-auto">
                              <FileText size={16} className="mr-1" /> Export <ChevronDown size={14} className="ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={exportToPDF}>
                              <FileText size={14} className="mr-2" /> Export as PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={exportToExcel}>
                              <FileSpreadsheet size={14} className="mr-2" /> Export as Excel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Stats summary row */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-none shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-gray-500 text-sm">Total Medicines</p>
                            <p className="text-2xl font-bold text-blue-800">{filteredMedicines.length}</p>
                          </div>
                          <div className="bg-blue-200 p-2 rounded-full">
                            <Pill className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-red-50 to-red-100 border-none shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-gray-500 text-sm">Low Stock</p>
                            <p className="text-2xl font-bold text-red-800">
                              {filteredMedicines.filter(med => med.stock < med.weeklyRequirement).length}
                            </p>
                          </div>
                          <div className="bg-red-200 p-2 rounded-full">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-none shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-gray-500 text-sm">Expiring Soon</p>
                            <p className="text-2xl font-bold text-amber-800">
                              {filteredMedicines.filter(med => isExpiringSoon(med.expiryDate)).length}
                            </p>
                          </div>
                          <div className="bg-amber-200 p-2 rounded-full">
                            <Clock className="w-5 h-5 text-amber-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-none shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-gray-500 text-sm">Healthy Stock</p>
                            <p className="text-2xl font-bold text-green-800">
                              {filteredMedicines.filter(med => 
                                med.stock >= med.weeklyRequirement && !isExpiringSoon(med.expiryDate)
                              ).length}
                            </p>
                          </div>
                          <div className="bg-green-200 p-2 rounded-full">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {isMobile ? (
                    <div className="space-y-4">
                      {currentMedicines.map((med) => (
                        <Card key={med.id} className="shadow-sm border-l-4 overflow-hidden transition-all duration-200 hover:shadow-md">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center mb-3">
                              <h2 className="text-lg font-bold text-gray-800">{med.name}</h2>
                              <Badge className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                getBadgeColor(med.stock, med.weeklyRequirement, med.expiryDate)
                              )}>
                                {getStockStatus(med.stock, med.weeklyRequirement, med.expiryDate)}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <Package className="w-4 h-4 text-blue-600" />
                                  <p className="text-gray-600 font-medium">Current Stock</p>
                                </div>
                                <p className={cn(
                                  "text-lg font-bold",
                                  med.stock < med.weeklyRequirement ? "text-red-600" : "text-blue-700"
                                )}>
                                  {med.stock}
                                </p>
                              </div>
                              
                              <div className="bg-purple-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <BarChart className="w-4 h-4 text-purple-600" />
                                  <p className="text-gray-600 font-medium">Weekly Need</p>
                                </div>
                                <p className="text-lg font-bold text-purple-700">{med.weeklyRequirement}</p>
                              </div>
                              
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <Calendar className="w-4 h-4 text-gray-600" />
                                  <p className="text-gray-600 font-medium">Expiry Date</p>
                                </div>
                                <p className={cn(
                                  "text-lg font-bold", 
                                  getExpiryColor(med.expiryDate)
                                )}>
                                  {med.expiryDate ? formatDate(med.expiryDate) : "N/A"}
                                </p>
                              </div>
                              
                              <div className="bg-green-50 p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <Building2 className="w-4 h-4 text-green-600" />
                                  <p className="text-gray-600 font-medium">Facility</p>
                                </div>
                                <p className="text-lg font-bold text-green-700">{med.facility.name}</p>
                              </div>
                            </div>
                            
                            <div className="border-t pt-3">
                              <p className="text-sm text-gray-500 mb-2">Log today's usage:</p>
                              <div className="flex items-center gap-2 mb-3">
                                <Input
                                  type="number"
                                  placeholder="Usage"
                                  value={usageInputs[med.id] || ""}
                                  onChange={(e) => setUsageInputs(prev => ({ ...prev, [med.id]: e.target.value }))}
                                  className="w-24 bg-gray-50 border-gray-300"
                                  min="0"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleUsageSubmit(med.id)}
                                  disabled={!usageInputs[med.id] || parseInt(usageInputs[med.id]) <= 0}
                                  className="bg-teal-600 hover:bg-teal-700"
                                >
                                  <Check className="w-4 h-4 mr-1" /> Log
                                </Button>
                              </div>
                              
                              <div className="flex flex-wrap gap-2">
                                <Link href={`/dashboard/edit/${med.id}`}>
                                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                                    <Edit2 className="w-4 h-4" /> Edit
                                  </Button>
                                </Link>
                                <Link href={`/dashboard/usage/${med.id}`}>
                                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                                    <BarChart2 className="w-4 h-4" /> Usage History
                                  </Button>
                                </Link>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={() => {
                                    setIsModalOpen(true);
                                    setDeleteId(med.id);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" /> Delete
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <TooltipProvider>
                      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-50">
                                <TableHead className="font-semibold">Medicine Name</TableHead>
                                <TableHead className="font-semibold">Stock</TableHead>
                                <TableHead className="font-semibold">Weekly Req.</TableHead>
                                <TableHead className="font-semibold">Expiry Date</TableHead>
                                <TableHead className="font-semibold">Facility</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                                <TableHead className="font-semibold">Usage</TableHead>
                                <TableHead className="font-semibold">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {currentMedicines.map((med) => (
                                <TableRow key={med.id} className="hover:bg-gray-50 transition-colors">
                                  <TableCell className="font-medium">{med.name}</TableCell>
                                  <TableCell className={cn(
                                    "font-medium",
                                    med.stock < med.weeklyRequirement ? "text-red-600" : "text-blue-600"
                                  )}>
                                    {med.stock}
                                  </TableCell>
                                  <TableCell>{med.weeklyRequirement}</TableCell>
                                  <TableCell className={getExpiryColor(med.expiryDate)}>
                                    {med.expiryDate ? formatDate(med.expiryDate) : "N/A"}
                                  </TableCell>
                                  <TableCell>{med.facility.name}</TableCell>
                                  <TableCell>
                                    <Badge className={cn(
                                      "rounded-full text-xs font-medium",
                                      getBadgeColor(med.stock, med.weeklyRequirement, med.expiryDate)
                                    )}>
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
                                        className="w-20 h-8 text-sm"
                                        min="0"
                                      />
                                      <Button
                                        size="sm"
                                        className="h-8 bg-teal-600 hover:bg-teal-700"
                                        onClick={() => handleUsageSubmit(med.id)}
                                        disabled={!usageInputs[med.id] || parseInt(usageInputs[med.id]) <= 0}
                                      >
                                        Log
                                      </Button>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Link href={`/dashboard/edit/${med.id}`}>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-blue-100">
                                              <Edit2 className="w-4 h-4 text-blue-600" />
                                            </Button>
                                          </Link>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Edit medicine</p>
                                        </TooltipContent>
                                      </Tooltip>
                                      
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Link href={`/dashboard/usage/${med.id}`}>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-green-100">
                                              <BarChart2 className="w-4 h-4 text-green-600" />
                                            </Button>
                                          </Link>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>View usage history</p>
                                        </TooltipContent>
                                      </Tooltip>
                                      
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            className="h-8 w-8 rounded-full hover:bg-red-100"
                                            onClick={() => {
                                              setIsModalOpen(true);
                                              setDeleteId(med.id);
                                            }}
                                          >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Delete medicine</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </TooltipProvider>
                  )}
                  
                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredMedicines.length)} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredMedicines.length)} of {filteredMedicines.length} items
                    </p>
                    <Pagination 
                      currentPage={currentPage} 
                      totalItems={filteredMedicines.length} 
                      itemsPerPage={ITEMS_PER_PAGE} 
                      setPage={setCurrentPage} 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Confirmation Modal */}
              <Dialog 
                open={isModalOpen} 
                onOpenChange={(open) => {
                  setIsModalOpen(open);
                  if (!open) {
                    setDeleteId(null);
                    setDeleteError(null); // Clear any error when closing
                  }
                }}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Delete</DialogTitle>
                  </DialogHeader>
                  <p>Are you sure you want to remove this veterinary medicine? This action cannot be undone.</p>
                  
                  {deleteError && (
                    <Alert className="mt-2 bg-red-100 border-l-4 border-red-500 text-red-700">
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{deleteError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <DialogFooter className="mt-4 flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsModalOpen(false);
                        setDeleteId(null);
                        setDeleteError(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDelete}
                      disabled={loading} // Disable the button during loading state
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
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

const getTimestamp = (): string =>
  new Date().toISOString().replace(/[:.-]/g, "_");
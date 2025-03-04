"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Edit2, Trash2, PlusCircle, Building2, Loader2 } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import Navbar from "@/components/Navbar";

const ITEMS_PER_PAGE = 10;

interface Facility {
  id: number;
  name: string;
  type: string;
}

export default function FacilitiesView() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
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
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  const handleDelete = async () => {
    if (deleteId === null) return;
    
    try {
      const res = await fetch(`/api/facilities/${deleteId}`, { method: "DELETE" });
      
      if (res.ok) {
        setFacilities(prevFacilities => 
          prevFacilities.filter(facility => facility.id !== deleteId)
        );
        setSuccessMessage("Facility deleted successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error("Failed to delete facility");
      }
    } catch (error) {
      console.error("Error deleting facility:", error);
      alert("Failed to delete facility. It may have medicines associated with it.");
    } finally {
      setIsModalOpen(false);
      setDeleteId(null);
    }
  };

  const getFacilityTypeColor = (type: string) => {
    switch (type) {
      case "Hospital":
        return "bg-blue-100 text-blue-800";
      case "Dispensary":
        return "bg-green-100 text-green-800";
      case "ClinicianCenter":
        return "bg-purple-100 text-purple-800";
      case "Polyclinic":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatFacilityType = (type: string) => {
    if (type === "ClinicianCenter") return "Clinician Center";
    return type;
  };

  // Filter facilities based on search query
  const filteredFacilities = facilities.filter(facility => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      facility.name.toLowerCase().includes(query) ||
      formatFacilityType(facility.type).toLowerCase().includes(query)
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredFacilities.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentFacilities = filteredFacilities.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="pt-24 px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Success Message */}
          {successMessage && (
            <Alert className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <Card className="shadow-lg">
            <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Facilities Management</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Manage veterinary facilities across Tamil Nadu
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search facilities..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1); // Reset to first page on search
                    }}
                    className="w-full px-4 py-2 pl-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 absolute left-2.5 top-2.5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                
                <Link href="/admin/facilities">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center whitespace-nowrap">
                    <PlusCircle size={16} className="mr-2" /> Add New Facility
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="animate-spin text-gray-500 w-10 h-10" />
                </div>
              ) : filteredFacilities.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-800">
                    {searchQuery ? "No matching facilities found" : "No facilities found"}
                  </h3>
                  <p className="text-gray-500 mt-2">
                    {searchQuery 
                      ? "Try adjusting your search terms" 
                      : "Add your first facility to get started"}
                  </p>
                  {!searchQuery && (
                    <Link href="/admin/facilities" className="mt-4 inline-block">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center">
                        <PlusCircle size={16} className="mr-2" /> Add Facility
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <TooltipProvider>
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="font-semibold">ID</TableHead>
                            <TableHead className="font-semibold">Name</TableHead>
                            <TableHead className="font-semibold">Type</TableHead>
                            <TableHead className="font-semibold text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentFacilities.map((facility) => (
                            <TableRow key={facility.id} className="hover:bg-gray-50 transition-colors">
                              <TableCell className="font-medium">{facility.id}</TableCell>
                              <TableCell>{facility.name}</TableCell>
                              <TableCell>
                                <span 
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getFacilityTypeColor(facility.type)}`}
                                >
                                  {formatFacilityType(facility.type)}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Link href={`/dashboard/facilities/edit/${facility.id}`}>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full hover:bg-blue-100">
                                          <Edit2 className="w-4 h-4 text-blue-600" />
                                        </Button>
                                      </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Edit facility</p>
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
                                          setDeleteId(facility.id);
                                        }}
                                      >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Delete facility</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TooltipProvider>
                  </div>
                
                  {/* Pagination */}
                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Showing {filteredFacilities.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredFacilities.length)} of {filteredFacilities.length} facilities
                    </p>
                    <Pagination 
                      currentPage={currentPage} 
                      totalItems={filteredFacilities.length} 
                      itemsPerPage={ITEMS_PER_PAGE} 
                      setPage={setCurrentPage} 
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
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
          <p>Are you sure you want to delete this facility? This will remove all associated data and cannot be undone.</p>
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
  );
}
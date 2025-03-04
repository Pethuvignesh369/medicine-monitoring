"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Loader2, ArrowLeft, Building, Home, Edit2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const ALERT_TIMEOUT = 3000;

interface Facility {
  id: number;
  name: string;
  type: string;
}

export default function EditFacility() {
  const [facility, setFacility] = useState({ name: "", type: "" });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { id } = useParams();

  const facilityTypes = ["Dispensary", "Hospital", "ClinicianCenter", "Polyclinic"];

  useEffect(() => {
    const fetchFacility = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/facilities/${id}`);
        if (!res.ok) throw new Error("Failed to fetch facility");
        const data = await res.json();
        setFacility({
          name: data.name,
          type: data.type,
        });
      } catch (error) {
        console.error("Error fetching facility:", error);
        setErrorMessage("Failed to load facility data.");
        setTimeout(() => setErrorMessage(null), ALERT_TIMEOUT);
      } finally {
        setLoading(false);
      }
    };
    fetchFacility();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!facility.name || !facility.type) {
      setErrorMessage("Please fill all required fields.");
      setTimeout(() => setErrorMessage(null), ALERT_TIMEOUT);
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`/api/facilities/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: facility.name, type: facility.type }),
      });

      if (!res.ok) throw new Error("Failed to update facility");

      setSuccessMessage("Facility updated successfully!");
      setTimeout(() => {
        setSuccessMessage(null);
        router.push("/admin/facilities/view");
      }, ALERT_TIMEOUT);
    } catch (error) {
      setErrorMessage("Failed to update facility.");
      setTimeout(() => setErrorMessage(null), ALERT_TIMEOUT);
    } finally {
      setIsSubmitting(false);
    }
  };

  const IconInput = ({ 
    id, 
    placeholder, 
    value, 
    onChange, 
    type = "text", 
    icon: Icon
  }: {
    id: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    icon: any;
  }) => (
    <div className="relative group">
      <div className="absolute left-3 top-2.5 hidden sm:block">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <div className="absolute left-3 top-2.5 sm:hidden">
        <Icon className="h-4 w-4 text-gray-400" />
      </div>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        className="sm:pl-10 pl-9 bg-gray-50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
        value={value}
        onChange={onChange}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <div className="pt-24 px-4 pb-8">
        <div className="max-w-xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-gray-500 w-10 h-10" />
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center">
                <Button 
                  variant="ghost" 
                  className="p-1 sm:p-2 mr-2" 
                  onClick={() => router.push("/admin/facilities/view")}
                >
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                </Button>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Edit Facility</h1>
              </div>

              <AnimatePresence>
                {(successMessage || errorMessage) && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6"
                  >
                    {successMessage && (
                      <Alert className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 text-green-700 shadow-md rounded-lg">
                        <div className="flex items-center">
                          <div className="bg-green-100 p-2 rounded-full mr-3">
                            <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                          </div>
                          <div>
                            <AlertTitle className="font-semibold text-green-800 text-sm sm:text-base">Success</AlertTitle>
                            <AlertDescription className="text-sm">{successMessage}</AlertDescription>
                          </div>
                        </div>
                      </Alert>
                    )}
                    {errorMessage && (
                      <Alert className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-700 shadow-md rounded-lg">
                        <AlertTitle className="font-semibold text-red-800 text-sm sm:text-base">Error</AlertTitle>
                        <AlertDescription className="text-sm">{errorMessage}</AlertDescription>
                      </Alert>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
                <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-600 to-teal-500 text-white">
                  <h2 className="text-base sm:text-lg font-semibold flex items-center">
                    <Edit2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> 
                    Edit Facility
                  </h2>
                  <p className="text-blue-100 text-xs sm:text-sm mt-1">Update facility details</p>
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 sm:space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    {/* Facility Name */}
                    <div>
                      <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Facility Name <span className="text-red-500">*</span>
                      </label>
                      <IconInput 
                        id="name"
                        placeholder="Enter facility name"
                        value={facility.name}
                        onChange={(e) => setFacility({ ...facility, name: e.target.value })}
                        icon={Building}
                      />
                    </div>

                    {/* Facility Type */}
                    <div>
                      <label htmlFor="type" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Facility Type <span className="text-red-500">*</span>
                      </label>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            id="type"
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between bg-gray-50 border-gray-300 hover:bg-gray-100 h-10"
                          >
                            <div className="flex items-center text-left overflow-hidden">
                              <Home className="flex-shrink-0 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                              <span className="truncate text-sm">
                                {facility.type || "Select Type"}
                              </span>
                            </div>
                            <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 shadow-xl rounded-lg border border-gray-200">
                          <Command className="rounded-lg border-0">
                            <CommandInput placeholder="Search type..." className="py-2 text-sm" />
                            <CommandList>
                              <CommandEmpty>No type found.</CommandEmpty>
                              {facilityTypes.map((type) => (
                                <CommandItem
                                  key={type}
                                  value={type}
                                  className="py-2 px-3 cursor-pointer"
                                  onSelect={() => {
                                    setFacility({ ...facility, type });
                                    setOpen(false);
                                  }}
                                >
                                  <div className="flex items-center">
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        facility.type === type ? "text-blue-600" : "opacity-0"
                                      )}
                                    />
                                    <p className="font-medium text-sm">{type}</p>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="flex gap-3 sm:gap-4 pt-2 sm:pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1 border-gray-300 hover:bg-gray-100 text-gray-700 text-xs sm:text-sm h-10" 
                      onClick={() => router.push("/admin/facilities/view")}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white transition-all duration-200 text-xs sm:text-sm h-10"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin mr-2 h-3 w-3 sm:h-4 sm:w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full"></div>
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Edit2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          <span>Save Changes</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
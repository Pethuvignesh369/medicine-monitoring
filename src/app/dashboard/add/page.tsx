"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Calendar, PlusCircle, ArrowLeft, Pill, Package, Clock, Building } from "lucide-react";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";

const ALERT_TIMEOUT = 3000;

interface Facility {
  id: number;
  name: string;
  type: string;
}

// Memoized IconInput component to prevent unnecessary re-renders
const IconInput = memo(({ 
  id, 
  placeholder, 
  value, 
  onChange, 
  type = "text", 
  icon: Icon, 
  min
}: {
  id: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  icon: any;
  min?: string;
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
      min={min}
    />
  </div>
));

IconInput.displayName = "IconInput";

// Memoized status indicator component
const StockStatusIndicator = memo(({ stock, weeklyRequirement }: { stock: string, weeklyRequirement: string }) => {
  if (!stock || !weeklyRequirement) return null;
  
  const stockNum = parseInt(stock);
  const reqNum = parseInt(weeklyRequirement);
  const weeksLeft = stockNum / reqNum;
  
  const getStatusColor = () => {
    if (weeksLeft < 1) return "bg-red-400";
    if (weeksLeft < 2) return "bg-orange-400";
    if (weeksLeft < 4) return "bg-yellow-400";
    return "bg-green-400";
  };

  const getStatusText = () => {
    if (weeksLeft < 1) return "Critical";
    if (weeksLeft < 2) return "Low";
    if (weeksLeft < 4) return "Moderate";
    return "Good";
  };

  return (
    <div className="mt-3 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
      <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Projected Stock Status:</p>
      <div className="flex items-center">
        <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor()}`}></div>
        <span className="font-medium text-sm">{getStatusText()}</span>
        <span className="ml-2 text-xs text-gray-500">
          ({weeksLeft.toFixed(1)} weeks of supply)
        </span>
      </div>
    </div>
  );
});

StockStatusIndicator.displayName = "StockStatusIndicator";

// Memoized alert component
const StatusAlert = memo(({ 
  successMessage, 
  errorMessage 
}: { 
  successMessage: string | null, 
  errorMessage: string | null 
}) => {
  if (!successMessage && !errorMessage) return null;
  
  return (
    <div className="mb-6">
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
    </div>
  );
});

StatusAlert.displayName = "StatusAlert";

export default function AddMedicine() {
  // Form state
  const [name, setName] = useState("");
  const [stock, setStock] = useState("");
  const [weeklyRequirement, setWeeklyRequirement] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [facilityId, setFacilityId] = useState("");
  
  // UI state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Memoized change handlers to prevent recreation on each render
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);
  
  const handleStockChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStock(e.target.value);
  }, []);
  
  const handleWeeklyRequirementChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setWeeklyRequirement(e.target.value);
  }, []);
  
  const handleExpiryDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setExpiryDate(e.target.value);
  }, []);

  // Get selected facility name - memoized
  const selectedFacilityName = useCallback(() => {
    if (!facilityId) return "Select Facility";
    const facility = facilities.find(f => f.id === parseInt(facilityId));
    return facility?.name || "Select Facility";
  }, [facilityId, facilities]);

  // Fetch facilities on component mount
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!name || !stock || !weeklyRequirement || !facilityId) {
      setErrorMessage("Please fill all required fields.");
      setTimeout(() => setErrorMessage(null), ALERT_TIMEOUT);
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          stock: parseInt(stock),
          weeklyRequirement: parseInt(weeklyRequirement),
          expiryDate: expiryDate || null,
          facilityId: parseInt(facilityId),
        }),
      });

      if (!res.ok) throw new Error("Failed to add medicine");

      setSuccessMessage("Medicine added successfully!");
      setTimeout(() => {
        setSuccessMessage(null);
        router.push("/dashboard");
      }, ALERT_TIMEOUT);
      
      // Reset form
      setName("");
      setStock("");
      setWeeklyRequirement("");
      setExpiryDate("");
      setFacilityId("");
    } catch (error) {
      setErrorMessage("Failed to add medicine.");
      setTimeout(() => setErrorMessage(null), ALERT_TIMEOUT);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigation button handler - memoized
  const handleNavigateBack = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <div className="pt-24 px-4 pb-8">
        <div className="max-w-xl mx-auto">
          <div className="mb-6 flex items-center">
            <Button 
              variant="ghost" 
              className="p-1 sm:p-2 mr-2" 
              onClick={handleNavigateBack}
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Add New Medicine</h1>
          </div>

          <StatusAlert successMessage={successMessage} errorMessage={errorMessage} />

          <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
            <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-600 to-teal-500 text-white">
              <h2 className="text-base sm:text-lg font-semibold flex items-center">
                <Pill className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> 
                Add Veterinary Medicine
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm mt-1">Enter the details of the medicine to add to inventory</p>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Medicine Name */}
                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Medicine Name <span className="text-red-500">*</span>
                  </label>
                  <IconInput 
                    id="name"
                    placeholder="Enter medicine name"
                    value={name}
                    onChange={handleNameChange}
                    icon={Pill}
                  />
                </div>

                {/* Stock */}
                <div>
                  <label htmlFor="stock" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Current Stock <span className="text-red-500">*</span>
                  </label>
                  <IconInput
                    id="stock"
                    type="number"
                    placeholder="Enter stock quantity"
                    value={stock}
                    onChange={handleStockChange}
                    min="0"
                    icon={Package}
                  />
                </div>

                {/* Weekly Requirement */}
                <div>
                  <label htmlFor="weeklyRequirement" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Weekly Requirement <span className="text-red-500">*</span>
                  </label>
                  <IconInput
                    id="weeklyRequirement"
                    type="number"
                    placeholder="Enter weekly requirement"
                    value={weeklyRequirement}
                    onChange={handleWeeklyRequirementChange}
                    min="0"
                    icon={Clock}
                  />
                </div>

                {/* Expiry Date */}
                <div>
                  <label htmlFor="expiryDate" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <IconInput
                    id="expiryDate"
                    type="date"
                    placeholder="Select expiry date"
                    value={expiryDate}
                    onChange={handleExpiryDateChange}
                    icon={Calendar}
                  />
                </div>

                {/* Facility */}
                <div>
                  <label htmlFor="facility" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Facility <span className="text-red-500">*</span>
                  </label>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        id="facility"
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between bg-gray-50 border-gray-300 hover:bg-gray-100 h-10"
                      >
                        <div className="flex items-center text-left overflow-hidden">
                          <Building className="flex-shrink-0 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                          <span className="truncate text-sm">
                            {selectedFacilityName()}
                          </span>
                        </div>
                        <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0 shadow-xl rounded-lg border border-gray-200">
                      <Command className="rounded-lg border-0">
                        <CommandInput placeholder="Search facility..." className="py-2 text-sm" />
                        <CommandList>
                          <CommandEmpty>No facility found.</CommandEmpty>
                          {facilities.map((facility) => (
                            <CommandItem
                              key={facility.id}
                              value={`${facility.name} (${facility.type})`}
                              className="py-2 px-3 cursor-pointer"
                              onSelect={() => {
                                setFacilityId(facility.id.toString());
                                setOpen(false);
                              }}
                            >
                              <div className="flex items-center">
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    facilityId === facility.id.toString() ? "text-blue-600" : "opacity-0"
                                  )}
                                />
                                <div>
                                  <p className="font-medium text-sm">{facility.name}</p>
                                  <p className="text-xs text-gray-500">{facility.type}</p>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Stock Status Indicator */}
              {stock && weeklyRequirement && (
                <StockStatusIndicator stock={stock} weeklyRequirement={weeklyRequirement} />
              )}

              <div className="flex gap-3 sm:gap-4 pt-2 sm:pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 border-gray-300 hover:bg-gray-100 text-gray-700 text-xs sm:text-sm h-10" 
                  onClick={handleNavigateBack}
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
                      <PlusCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Add Medicine</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
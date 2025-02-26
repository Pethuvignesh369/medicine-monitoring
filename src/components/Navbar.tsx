"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Bell, Home, BarChart2, PlusCircle, Building } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

// Define interfaces for type safety
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

interface AlertItem {
  id: number;
  message: string;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/medicines");
        if (!res.ok) throw new Error(`Failed to fetch medicines: ${res.status}`);
        const medicines: Medicine[] = await res.json();
        const newAlerts = medicines.reduce((acc: AlertItem[], med: Medicine) => {
          if (med.expiryDate && new Date(med.expiryDate) < new Date()) {
            acc.push({ id: med.id, message: `⚠️ ${med.name} is expired at ${med.facility.name}!` });
          } else if (med.stock < med.weeklyRequirement) {
            acc.push({ id: med.id, message: `⚠️ ${med.name} is running low at ${med.facility.name}!` });
          }
          return acc;
        }, []);
        setAlerts(newAlerts);
      } catch (error) {
        console.error("Error fetching alerts:", error);
      }
    };

    fetchData();
  }, []);

  const dismissAlert = (id: number) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const navLinks = [
    { path: "/", label: "Home", icon: <Home className="w-5 h-5" /> },
    { path: "/dashboard", label: "Dashboard", icon: <BarChart2 className="w-5 h-5" /> },
    { path: "/dashboard/add", label: "Add Medicine", icon: <PlusCircle className="w-5 h-5" /> },
    { path: "/admin/facilities", label: "Facilities", icon: <Building className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-blue-800 via-teal-700 to-blue-800 text-white shadow-lg z-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Brand with animated gradient */}
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-2xl">💊</span>
            <span className="text-xl font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-teal-200 group-hover:from-teal-200 group-hover:to-white transition-all duration-500">
              VetMed Monitor
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`relative px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 ${
                  pathname === link.path
                    ? "bg-white/20 text-white font-medium"
                    : "hover:bg-white/10 text-white/80 hover:text-white"
                }`}
              >
                {link.icon}
                <span>{link.label}</span>
                {pathname === link.path && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-300 rounded-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Notification Bell and Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative">
              <button
                className="p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-opacity-50"
                onClick={() => setIsAlertsOpen(!isAlertsOpen)}
                aria-label="Toggle alerts"
              >
                <Bell className="w-5 h-5" />
                {alerts.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs flex items-center justify-center min-w-5 h-5 rounded-full animate-pulse">
                    {alerts.length}
                  </Badge>
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-opacity-50"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-3 space-y-1 pb-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      pathname === link.path
                        ? "bg-white/15 text-white"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.icon}
                    <span className="font-medium">{link.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Alerts Panel */}
      <AnimatePresence>
        {isAlertsOpen && alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 right-4 flex flex-col gap-2 z-20 max-w-md max-h-96 overflow-y-auto p-2"
          >
            {alerts.map((alert) => (
              <Alert
                key={alert.id}
                className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 shadow-lg rounded-md"
              >
                <div className="flex justify-between items-center">
                  <AlertDescription className="font-medium">{alert.message}</AlertDescription>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-600 hover:text-gray-800 hover:bg-yellow-200/50 rounded-full"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Alert>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
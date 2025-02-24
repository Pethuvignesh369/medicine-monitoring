"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Bell } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false); // Mobile menu toggle
  const [isAlertsOpen, setIsAlertsOpen] = useState(false); // Alerts toggle
  const [alerts, setAlerts] = useState<{ id: number; message: string }[]>([]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleAlerts = () => setIsAlertsOpen(!isAlertsOpen);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/medicines");
        if (!res.ok) throw new Error("Failed to fetch medicines");
        const medicines = await res.json();
        const newAlerts = medicines.reduce((acc: { id: number; message: string }[], med: any) => {
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

  return (
    <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-blue-900 via-teal-800 to-blue-900 text-white shadow-lg py-4 z-10">
      <div className="container mx-auto flex justify-between items-center px-4 md:px-6">
        {/* Brand Name */}
        <Link href="/" className="text-xl font-bold tracking-wide hover:text-teal-300 transition-colors">
          VetMed Monitor
        </Link>

        {/* Navigation Links and Notification Icon */}
        <div className="flex items-center gap-4">
          {/* Navigation Links */}
          <div
            className={`${
              isOpen ? "flex" : "hidden"
            } md:flex flex-col md:flex-row items-center gap-4 md:gap-6 absolute md:static top-16 left-0 w-full md:w-auto bg-blue-900 md:bg-transparent p-4 md:p-0 transition-all duration-300 ease-in-out`}
          >
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 hover:scale-105 transition-all duration-200"
              onClick={() => setIsOpen(false)}
            >
              <span className="text-lg">🏠</span>
              <span className="text-sm font-medium">Home</span>
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 hover:scale-105 transition-all duration-200"
              onClick={() => setIsOpen(false)}
            >
              <span className="text-lg">📊</span>
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <Link
              href="/dashboard/add"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 hover:scale-105 transition-all duration-200"
              onClick={() => setIsOpen(false)}
            >
              <span className="text-lg">➕</span>
              <span className="text-sm font-medium">Add Medicine</span>
            </Link>
            <Link
              href="/admin/facilities"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 hover:scale-105 transition-all duration-200"
              onClick={() => setIsOpen(false)}
            >
              <span className="text-lg">🏢</span>
              <span className="text-sm font-medium">Add Facility</span>
            </Link>
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              className="focus:outline-none"
              onClick={toggleAlerts}
              aria-label="Toggle alerts"
            >
              <Bell className="w-6 h-6 hover:text-teal-300 transition-colors" />
              {alerts.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-600 text-white text-xs">
                  {alerts.length}
                </Badge>
              )}
            </button>
          </div>

          {/* Hamburger Menu Button (Mobile Only) */}
          <button
            className="md:hidden focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Toast Alerts (Toggled by Bell Icon) */}
      {isAlertsOpen && (
        <div className="fixed top-16 right-4 flex flex-col gap-2 z-20">
          {alerts.map((alert) => (
            <Alert
              key={alert.id}
              className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-3 w-72 shadow-md animate-fade-in"
            >
              <div className="flex justify-between items-center">
                <AlertDescription>{alert.message}</AlertDescription>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-600 hover:text-gray-800"
                  onClick={() => dismissAlert(alert.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Alert>
          ))}
        </div>
      )}
    </nav>
  );
}

// CSS for fade-in animation
const styles = `
  @keyframes fadeIn {
    0% { opacity: 0; transform: translateY(-10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
"use client";

import React from "react";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { PlusCircle, LayoutDashboard, Building2, Bell, TrendingUp, Calendar, Search, Package, AlertTriangle, Clock, Eye, LineChart, CircleCheck, Database, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  const router = useRouter();
  const [hoverCard, setHoverCard] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  // Check auth status on mount
  useEffect(() => {
    const authCookie = document.cookie.split("; ").find(row => row.startsWith("auth="));
    const authenticated = authCookie?.split("=")[1] === "true";
    console.log("Homepage - Authenticated:", authenticated);
    setIsAuthenticated(authenticated);
  }, []);

  // Auto rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCardHover = (index: number | null): void => {
    setHoverCard(index);
  };

  const cards = [
    {
      title: "Add Medicine",
      description: "Add a new medicine to the database with expiry tracking.",
      icon: <PlusCircle className="w-8 h-8" />,
      color: "bg-gradient-to-br from-green-400 to-green-600",
      textColor: "text-white",
      path: "/dashboard/add",
    },
    {
      title: "View Dashboard",
      description: "View all medicines and manage stock levels easily.",
      icon: <LayoutDashboard className="w-8 h-8" />,
      color: "bg-gradient-to-br from-blue-400 to-blue-600",
      textColor: "text-white",
      path: "/dashboard",
    },
    {
      title: "View Facilities",
      description: "View and manage all healthcare facilities in the system.",
      icon: <Eye className="w-8 h-8" />,
      color: "bg-gradient-to-br from-indigo-400 to-indigo-600",
      textColor: "text-white",
      path: "/admin/facilities/view",
    },
    {
      title: "Add Facility",
      description: "Add a new healthcare facility to the system.",
      icon: <Building2 className="w-8 h-8" />,
      color: "bg-gradient-to-br from-purple-400 to-purple-600",
      textColor: "text-white",
      path: "/admin/facilities",
    }
  ];

  const features = [
    {
      title: "Real-time Medicine Tracking",
      description: "Monitor medicine stock levels across all facilities in real-time, with automatic alerts for low inventory.",
      icon: <LineChart className="w-12 h-12 text-blue-500" />,
      color: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      title: "Expiry Date Management",
      description: "Never miss expiration dates with our advanced tracking system that provides timely notifications for upcoming expirations.",
      icon: <Calendar className="w-12 h-12 text-red-500" />,
      color: "bg-red-50",
      borderColor: "border-red-200",
    },
    {
      title: "Centralized Facility Management",
      description: "Easily manage multiple healthcare facilities from a single dashboard with customized access controls.",
      icon: <Building2 className="w-12 h-12 text-purple-500" />,
      color: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      title: "Comprehensive Analytics",
      description: "Gain insights into medicine usage patterns and optimize inventory with detailed analytics and reporting tools.",
      icon: <BarChart className="w-12 h-12 text-green-500" />,
      color: "bg-green-50",
      borderColor: "border-green-200",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">
              Medicine Monitoring System
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Efficiently manage your medicine inventory, track expiry dates, and monitor stock levels across all your facilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {cards.map((card, index) => (
              <div 
                key={index}
                className="transform transition-all duration-300 hover:-translate-y-2"
                onMouseEnter={() => handleCardHover(index)}
                onMouseLeave={() => handleCardHover(null)}
              >
                <Card 
                  className={`h-full cursor-pointer shadow-md hover:shadow-xl overflow-hidden border-0 ${hoverCard === index ? 'ring-2 ring-offset-2 ring-gray-200' : ''}`}
                  onClick={() => router.push(card.path)}
                >
                  <div className={`${card.color} py-6 px-4 flex items-center justify-center`}>
                    <div className="bg-white/20 p-3 rounded-full">
                      {React.cloneElement(card.icon, { className: `${card.textColor}` })}
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <h2 className="text-xl font-semibold">{card.title}</h2>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{card.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Feature Spotlight Section */}
          <div className="mt-16 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Feature Spotlight</h2>
              <p className="text-gray-600 mt-2">Discover how our system can transform your medicine management</p>
            </div>
            
            <div className="relative">
              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
                {features.map((feature, index) => (
                  <button
                    key={index}
                    className={`text-left p-4 rounded-lg transition-all duration-300 border ${
                      activeFeature === index 
                        ? `${feature.color} ${feature.borderColor} shadow-md` 
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveFeature(index)}
                  >
                    <h3 className="font-medium text-sm md:text-base truncate">{feature.title}</h3>
                  </button>
                ))}
              </div>
              
              {/* Active Feature Detail */}
              <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100 transition-all duration-500">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <div className={`p-4 rounded-full ${features[activeFeature].color}`}>
                    {features[activeFeature].icon}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{features[activeFeature].title}</h3>
                    <p className="text-gray-600">{features[activeFeature].description}</p>
                    
                    <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3">
                      <Button 
                        onClick={() => router.push(isAuthenticated ? "/dashboard" : "/login")}
                        className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white"
                      >
                        Get Started
                      </Button>
                    
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Section */}
          <div className="mt-12 bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-50">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Quick Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Total Medicines Card */}
              <div className="bg-gradient-to-br from-sky-400 to-blue-400 p-4 rounded-xl shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white font-medium">Total Medicines</p>
                  <Package className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white mt-2">248</p>
              </div>

              {/* Low Stock Card */}
              <div className="bg-gradient-to-br from-pink-400 to-rose-400 p-4 rounded-xl shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white font-medium">Low Stock</p>
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white mt-2">12</p>
              </div>

              {/* Expiring Soon Card */}
              <div className="bg-gradient-to-br from-yellow-400 to-orange-400 p-4 rounded-xl shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white font-medium">Expiring Soon</p>
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white mt-2">8</p>
              </div>

              {/* Facilities Card */}
              <div className="bg-gradient-to-br from-teal-400 to-emerald-400 p-4 rounded-xl shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white font-medium">Facilities</p>
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white mt-2">4</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
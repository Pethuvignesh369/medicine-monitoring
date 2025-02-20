"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { PlusCircle, LayoutDashboard, Building2 } from "lucide-react"; // Added `Building2` icon

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Welcome to Medicine Monitoring</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-md">
        {/* Add Medicine Card */}
        <Card
          className="cursor-pointer transition-transform transform hover:scale-105"
          onClick={() => router.push("/dashboard/add")}
        >
          <CardHeader className="flex items-center space-x-3">
            <PlusCircle className="text-green-600 w-8 h-8" />
            <h2 className="text-lg font-semibold">Add Medicine</h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Click here to add a new medicine to the database.</p>
          </CardContent>
        </Card>

        {/* View Dashboard Card */}
        <Card
          className="cursor-pointer transition-transform transform hover:scale-105"
          onClick={() => router.push("/dashboard")}
        >
          <CardHeader className="flex items-center space-x-3">
            <LayoutDashboard className="text-blue-600 w-8 h-8" />
            <h2 className="text-lg font-semibold">View Dashboard</h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">View all medicines and manage stocks easily.</p>
          </CardContent>
        </Card>

        {/* Add Facility Card */}
        <Card
          className="cursor-pointer transition-transform transform hover:scale-105"
          onClick={() => router.push("/admin/facilities")}
        >
          <CardHeader className="flex items-center space-x-3">
            <Building2 className="text-purple-600 w-8 h-8" />
            <h2 className="text-lg font-semibold">Add Facility</h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Click here to add a new facility to the system.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Cell,
  ReferenceLine,
} from "recharts";

type Facility = {
  id: number;
  name: string;
  type: string;
};

type Medicine = {
  name: string;
  stock: number;
  weeklyRequirement: number;
  expiryDate: string | null;
  facility: Facility;
};

type MedicineStockChartProps = {
  medicines: Medicine[];
};

// Custom type for Legend payload based on Recharts' expectations
type LegendPayload = {
  value: string;
  type: "square" | "line" | "circle" | "cross" | "diamond" | "star" | "triangle" | "wye" | "rect";
  id: string;
  color: string;
};

// Facility-based color mapping
const facilityColors: { [key: string]: string } = {
  Dispensary: "#34D399", // Green
  Hospital: "#4F46E5",    // Blue
  "Clinician Center": "#FBBF24", // Yellow
  Polyclinic: "#A855F7",  // Purple
  Expired: "#FF0000",     // Red
  "Expiring Soon": "#F472B6", // Pink
};

// Check if medicine is expiring soon (within 7 days)
const isExpiringSoon = (expiryDate: string | null) => {
  if (!expiryDate) return false;
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = (expiry.getTime() - today.getTime()) / (1000 * 3600 * 24);
  return diffDays > 0 && diffDays <= 7;
};

export default function MedicineStockChart({ medicines }: MedicineStockChartProps) {
  const chartData = medicines.map((med) => {
    const isExpired = med.expiryDate ? new Date(med.expiryDate) < new Date() : false;
    const expiringSoon = isExpiringSoon(med.expiryDate);
    return {
      name: med.name.length > 10 ? med.name.slice(0, 10) + "..." : med.name,
      stock: med.stock,
      weeklyRequirement: med.weeklyRequirement,
      fullName: med.name,
      expiryDate: med.expiryDate,
      facility: med.facility.name,
      color: isExpired
        ? facilityColors["Expired"]
        : expiringSoon
        ? facilityColors["Expiring Soon"]
        : facilityColors[med.facility.type] || "#EC4899", // Default color if type not found
    };
  });

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 text-white p-2 rounded shadow-lg text-xs">
          <p><strong>{data.fullName}</strong></p>
          <p>Stock: {data.stock}</p>
          <p>Weekly Requirement: {data.weeklyRequirement}</p>
          <p>Expiry: {data.expiryDate ? formatDate(data.expiryDate) : "N/A"}</p>
          <p>Facility: {data.facility}</p>
        </div>
      );
    }
    return null;
  };

  // Generate dynamic legend payload with custom LegendPayload type
  const legendPayload: LegendPayload[] = [
    { value: "Dispensary", type: "square", id: "Dispensary", color: facilityColors["Dispensary"] },
    { value: "Hospital", type: "square", id: "Hospital", color: facilityColors["Hospital"] },
    { value: "Clinician Center", type: "square", id: "Clinician Center", color: facilityColors["Clinician Center"] },
    { value: "Polyclinic", type: "square", id: "Polyclinic", color: facilityColors["Polyclinic"] },
    { value: "Expiring Soon", type: "square", id: "Expiring Soon", color: facilityColors["Expiring Soon"] },
    { value: "Expired", type: "square", id: "Expired", color: facilityColors["Expired"] },
  ];

  return (
    <div className="w-full p-3 bg-white shadow-md rounded-lg border min-h-[300px]">
      <h2 className="text-md font-semibold mb-2 text-gray-700 text-center">📊 Medicine Stock Overview</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} margin={{ top: 10, right: 15, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.8} stroke="#B0BEC5" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 9 }} 
            angle={-35} 
            textAnchor="end" 
            dy={10} 
            interval={0} 
          />
          <YAxis 
            tick={{ fontSize: 10 }} 
            label={{ value: "Units", angle: -90, position: "insideLeft", fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            payload={legendPayload}
            wrapperStyle={{ fontSize: "10px", bottom: 0 }}
            verticalAlign="bottom"
          />
          <Bar dataKey="stock" name="Stock" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
          <ReferenceLine 
            y={chartData.reduce((sum, d) => sum + d.weeklyRequirement, 0) / chartData.length} 
            stroke="#888" 
            strokeDasharray="5 5" 
            label={{ value: "Avg Weekly Req", position: "top", fontSize: 10 }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Helper function to format date
const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
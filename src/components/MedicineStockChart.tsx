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

type LegendPayload = {
  value: string;
  type: "square" | "line" | "circle" | "cross" | "diamond" | "star" | "triangle" | "wye" | "rect";
  id: string;
  color: string;
};

// Enhanced professional color palette matching the previous component
const facilityColors: { [key: string]: string } = {
  Dispensary: "#4CAF50",      // Green
  Hospital: "#2196F3",        // Blue
  "Clinician Center": "#FF9800", // Orange
  Polyclinic: "#9C27B0",      // Purple
  "Expiring Soon": "#FFC107", // Amber/Yellow
  Expired: "#F44336",         // Red
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
      name: med.name.length > 12 ? med.name.slice(0, 12) + "..." : med.name,
      stock: med.stock,
      weeklyRequirement: med.weeklyRequirement,
      fullName: med.name,
      expiryDate: med.expiryDate,
      facility: med.facility.name,
      facilityType: med.facility.type,
      color: isExpired
        ? facilityColors["Expired"]
        : expiringSoon
        ? facilityColors["Expiring Soon"]
        : facilityColors[med.facility.type] || "#607D8B", // Default slate blue if type not found
    };
  });

  // Custom Tooltip with improved styling
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 text-white p-3 rounded-md shadow-lg text-sm border border-gray-700">
          <p className="font-semibold mb-1">{data.fullName}</p>
          <div className="space-y-1 mt-2">
            <p>Stock: <span className="font-medium">{data.stock}</span></p>
            <p>Weekly Req: <span className="font-medium">{data.weeklyRequirement}</span></p>
            <p>Expiry: <span className="font-medium">{data.expiryDate ? formatDate(data.expiryDate) : "N/A"}</span></p>
            <p>Facility: <span className="font-medium">{data.facility}</span> ({data.facilityType})</p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Generate dynamic legend payload
  const legendPayload: LegendPayload[] = [
    { value: "Dispensary", type: "square", id: "Dispensary", color: facilityColors["Dispensary"] },
    { value: "Hospital", type: "square", id: "Hospital", color: facilityColors["Hospital"] },
    { value: "Clinician Center", type: "square", id: "Clinician Center", color: facilityColors["Clinician Center"] },
    { value: "Polyclinic", type: "square", id: "Polyclinic", color: facilityColors["Polyclinic"] },
    { value: "Expiring Soon", type: "square", id: "Expiring Soon", color: facilityColors["Expiring Soon"] },
    { value: "Expired", type: "square", id: "Expired", color: facilityColors["Expired"] },
  ];

  // Calculate average weekly requirement for reference line
  const avgWeeklyReq = chartData.length > 0 
    ? chartData.reduce((sum, d) => sum + d.weeklyRequirement, 0) / chartData.length 
    : 0;

  return (
    <div className="w-full p-4 bg-white shadow-md rounded-lg border border-gray-200 min-h-[320px] h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">📊 Medicine Stock Overview</h2>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} margin={{ top: 10, right: 15, left: 0, bottom: 50 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.6} stroke="#E0E0E0" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 10 }} 
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
            wrapperStyle={{ fontSize: "11px", bottom: -10 }}
            verticalAlign="bottom"
            iconSize={12}
            iconType="circle"
          />
          <Bar dataKey="stock" name="Stock" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
          <ReferenceLine 
            y={avgWeeklyReq} 
            stroke="#555555" 
            strokeDasharray="5 5" 
            strokeWidth={1.5}
            label={{ 
              value: "Avg Weekly Requirement", 
              position: "top", 
              fill: "#333333",
              fontSize: 11,
              fontWeight: 500
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Helper function to format date
const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString("en-GB", { 
    day: "2-digit", 
    month: "2-digit", 
    year: "numeric" 
  });
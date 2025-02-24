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
} from "recharts";

type MedicineStockChartProps = {
  medicines: { name: string; stock: number; expiryDate: string | null }[];
};

// Function to generate distinct colors for available medicines
const generateColor = (index: number) => {
  const colors = ["#4F46E5", "#34D399", "#FBBF24", "#F472B6", "#A855F7", "#EC4899"];
  return colors[index % colors.length]; // Cycle through colors
};

export default function MedicineStockChart({ medicines }: MedicineStockChartProps) {
  const chartData = medicines.map((med, index) => {
    const isExpired = med.expiryDate ? new Date(med.expiryDate) < new Date() : false; // Handle null expiryDate
    return {
      name: med.name.length > 10 ? med.name.slice(0, 10) + "..." : med.name, // Shorten names
      stock: med.stock,
      color: isExpired ? "#FF0000" : generateColor(index), // Red for expired, colored otherwise
    };
  });

  return (
    <div className="w-full p-3 bg-white shadow-md rounded-lg border">
      <h2 className="text-md font-semibold mb-2 text-gray-700 text-center">📊 Medicine Stock Overview</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />

          {/* ✅ Fixed X-Axis Labels for Mobile */}
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 9 }} // Smaller font for mobile
            angle={-35} // Tilt for better readability
            textAnchor="end" // Align properly
            dy={10} // Adjust position
            interval={0} // Show all labels
          />

          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ fontSize: "12px" }} />

          {/* ✅ Smaller Legend for Expired Items
          <Legend
            payload={[{ value: "Expired", type: "circle", color: "#FF0000" }]}
            wrapperStyle={{ fontSize: "9px", marginTop: "-10px" }} // Adjust legend size
          /> */}

          {/* ✅ Bar Chart with Custom Colors */}
          <Bar dataKey="stock" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

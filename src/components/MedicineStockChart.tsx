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
    const isExpired = med.expiryDate ? new Date(med.expiryDate) < new Date() : false;
    return {
      name: med.name.length > 10 ? med.name.slice(0, 10) + "..." : med.name,
      stock: med.stock,
      color: isExpired ? "#FF0000" : generateColor(index),
    };
  });

  return (
    <div className="w-full p-3 bg-white shadow-md rounded-lg border">
      <h2 className="text-md font-semibold mb-2 text-gray-700 text-center">📊 Medicine Stock Overview</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 40 }}>
          
          {/* ✅ Improved Grid Lines (More Visible) */}
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.8} stroke="#B0BEC5" />

          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 9 }} 
            angle={-35} 
            textAnchor="end" 
            dy={10} 
            interval={0} 
          />

          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ fontSize: "12px" }} />

          {/* <Legend
            payload={[{ value: "Expired", type: "circle", color: "#FF0000" }]}
            wrapperStyle={{ fontSize: "9px", marginTop: "-10px" }}
          /> */}

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

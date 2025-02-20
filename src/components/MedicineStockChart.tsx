"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from "recharts";

type MedicineStockChartProps = {
  medicines: { name: string; stock: number }[];
};

// Function to generate distinct colors
const generateColor = (index: number) => {
  const colors = ["#4F46E5", "#FF6B6B", "#34D399", "#FBBF24", "#F472B6", "#A855F7", "#EC4899"];
  return colors[index % colors.length]; // Cycle through colors
};

export default function MedicineStockChart({ medicines }: MedicineStockChartProps) {
  const chartData = medicines.map((med, index) => ({
    name: med.name.length > 8 ? med.name.slice(0, 8) + "..." : med.name, // Shorten names for better display
    stock: med.stock,
    color: generateColor(index), // Assign unique color
  }));

  return (
    <div className="w-full p-3 bg-white shadow-md rounded-lg border">
      <h2 className="text-md font-semibold mb-2 text-gray-700 text-center">📊 Medicine Stock Overview</h2>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-15} dy={5} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip contentStyle={{ fontSize: "12px" }} />
          <Legend wrapperStyle={{ fontSize: "10px" }} />

          {/* ✅ Single Bar with Custom Fill Colors */}
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

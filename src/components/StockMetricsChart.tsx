"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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

type StockMetricsChartProps = {
  medicines: Medicine[];
};

// Enhanced professional color palette
const metricColors: { [key: string]: string } = {
  "Total Stock": "#4CAF50",     // Green - healthy/sufficient
  "Low Stock": "#FFC107",       // Amber - warning
  "Expiring Soon": "#2196F3",   // Blue - informational alert
  "Expired": "#F44336",         // Red - critical alert
};

// Check if medicine is expiring soon (within 7 days)
const isExpiringSoon = (expiryDate: string | null) => {
  if (!expiryDate) return false;
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = (expiry.getTime() - today.getTime()) / (1000 * 3600 * 24);
  return diffDays > 0 && diffDays <= 7;
};

export default function StockMetricsChart({ medicines }: StockMetricsChartProps) {
  const [isPieChart, setIsPieChart] = useState(false);

  const totalStock = medicines.reduce((sum, med) => sum + med.stock, 0);
  const lowStockCount = medicines.filter(med => med.stock < med.weeklyRequirement).length;
  const expiringSoonCount = medicines.filter(med => isExpiringSoon(med.expiryDate)).length;
  const expiredCount = medicines.filter(med => med.expiryDate && new Date(med.expiryDate) < new Date()).length;

  const chartData = [
    { name: "Total Stock", value: totalStock, color: metricColors["Total Stock"] },
    { name: "Low Stock", value: lowStockCount, color: metricColors["Low Stock"] },
    { name: "Expiring Soon", value: expiringSoonCount, color: metricColors["Expiring Soon"] },
    { name: "Expired", value: expiredCount, color: metricColors["Expired"] },
  ];

  // Custom Tooltip with improved styling
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 text-white p-3 rounded-md shadow-lg text-sm border border-gray-700">
          <p className="font-semibold mb-1">{data.name}</p>
          <p>Count: {data.value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full p-4 bg-white shadow-md rounded-lg border border-gray-200 min-h-[320px] h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">📊 Stock Metrics</h2>
        <div className="flex items-center gap-3">
          <Label htmlFor="chart-toggle" className="text-sm font-medium text-gray-700">
            {isPieChart ? "Pie Chart" : "Bar Chart"}
          </Label>
          <Switch
            id="chart-toggle"
            checked={isPieChart}
            onCheckedChange={setIsPieChart}
            className="data-[state=checked]:bg-blue-600"
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        {isPieChart ? (
          <>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={30}
                    labelLine={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 flex items-center">
              <ul className="space-y-3 w-full">
                {chartData.map((item) => (
                  <li key={item.name} className="flex items-center gap-3">
                    <span
                      className="w-5 h-5 rounded-md"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-gray-800">
                      {item.name}: <span className="font-bold">{item.value}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ top: 10, right: 15, left: 0, bottom: 40 }}>
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
                label={{ value: "Count", angle: -90, position: "insideLeft", fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" name="Metrics" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
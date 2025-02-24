"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-blue-900 via-teal-800 to-blue-900 text-white shadow-lg py-4 z-10">
      <div className="container mx-auto flex justify-between items-center px-4 md:px-6">
        {/* Brand Name */}
        <Link href="/" className="text-xl font-bold tracking-wide hover:text-teal-300 transition-colors">
          VetMed Monitor
        </Link>

        {/* Navigation Links */}
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 hover:scale-105 transition-all duration-200"
          >
            <span className="text-lg">🏠</span>
            <span className="text-sm font-medium">Home</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 hover:scale-105 transition-all duration-200"
          >
            <span className="text-lg">📊</span>
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <Link
            href="/dashboard/add"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 hover:scale-105 transition-all duration-200"
          >
            <span className="text-lg">➕</span>
            <span className="text-sm font-medium">Add Medicine</span>
          </Link>
          <Link
            href="/admin/facilities"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 hover:scale-105 transition-all duration-200"
          >
            <span className="text-lg">🏢</span>
            <span className="text-sm font-medium">Add Facility</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
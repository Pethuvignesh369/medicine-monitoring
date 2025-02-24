"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-blue-900 via-teal-800 to-blue-900 text-white shadow-lg py-4 z-10">
      <div className="container mx-auto flex justify-between items-center px-4 md:px-6">
        {/* Brand Name */}
        <Link href="/" className="text-xl font-bold tracking-wide hover:text-teal-300 transition-colors">
          VetMed Monitor
        </Link>

        {/* Hamburger Menu Button (Mobile Only) */}
        <button
          className="md:hidden focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Navigation Links */}
        <div
          className={`${
            isOpen ? "flex" : "hidden"
          } md:flex flex-col md:flex-row items-center gap-6 md:gap-8 absolute md:static top-16 left-0 w-full md:w-auto bg-gradient-to-r from-blue-900 via-teal-800 to-blue-900 md:bg-transparent p-4 md:p-0 transition-all duration-300 ease-in-out`}
        >
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1 hover:text-teal-300 hover:scale-105 transition-all duration-200 rounded-full"
            onClick={() => setIsOpen(false)}
          >
            <span className="text-lg">🏠</span>
            <span className="text-sm font-medium">Home</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-1 hover:text-teal-300 hover:scale-105 transition-all duration-200 rounded-full"
            onClick={() => setIsOpen(false)}
          >
            <span className="text-lg">📊</span>
            <span className="text-sm font-medium">Dashboard</span>
          </Link>
          <Link
            href="/dashboard/add"
            className="flex items-center gap-2 px-3 py-1 hover:text-teal-300 hover:scale-105 transition-all duration-200 rounded-full"
            onClick={() => setIsOpen(false)}
          >
            <span className="text-lg">➕</span>
            <span className="text-sm font-medium">Add Medicine</span>
          </Link>
          <Link
            href="/admin/facilities"
            className="flex items-center gap-2 px-3 py-1 hover:text-teal-300 hover:scale-105 transition-all duration-200 rounded-full"
            onClick={() => setIsOpen(false)}
          >
            <span className="text-lg">🏢</span>
            <span className="text-sm font-medium">Add Facility</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
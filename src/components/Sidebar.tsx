// src/components/Sidebar.tsx
import React from "react";
import {
  Home,
  Search,
  FileText,
  BarChart3,
  Settings,
  Activity,
  UserPlus,
  Users,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard" },
    { id: "viewer", label: "QC Viewer", icon: Search, path: "/viewer" },
    { id: "register", label: "Register patient", icon: UserPlus, path: "/register" },
    { id: "patients", label: "Patients", icon: Users, path: "/patients" },
    { id: "reports", label: "Reports", icon: FileText, path: "/reports" },
    { id: "analytics", label: "Analytics", icon: BarChart3, path: "/analytics" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" }, // placeholder
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-gray-900">CXR QC</h1>
            <p className="text-xs text-gray-500">Quality Control</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-600">DR</span>
          </div>
          <div>
            <p className="text-sm text-gray-900">Dr. Radiologist</p>
            <p className="text-xs text-gray-500">Radiology Dept.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

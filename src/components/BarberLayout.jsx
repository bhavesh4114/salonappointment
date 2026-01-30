import React from 'react'
import { Outlet } from "react-router-dom";
import BarberSidebar from "./BarberSidebar";

const BarberLayout = () => {
  return (
    <div className="flex min-h-screen">
      <BarberSidebar />
      {/* Main content: flex-1 fills remaining space, ml-64 offsets sidebar width */}
      <main className="flex-1 ml-64 relative z-10 overflow-hidden">
        <div className="h-screen overflow-y-auto bg-gray-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default BarberLayout;

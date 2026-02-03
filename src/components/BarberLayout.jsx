import React from 'react'
import { Outlet } from "react-router-dom";
import BarberSidebar from "./BarberSidebar";

/** Fixed sidebar width; main content uses this + gap for alignment */
const SIDEBAR_WIDTH_PX = 240
const SIDEBAR_GAP_PX = 16

const BarberLayout = () => {
  return (
    <div className="flex min-h-screen w-full">
      <BarberSidebar />
      <main
        className="flex-1 min-w-0 flex flex-col bg-gray-50"
        style={{
          marginLeft: SIDEBAR_WIDTH_PX,
          paddingLeft: SIDEBAR_GAP_PX,
          minHeight: '100vh',
        }}
      >
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default BarberLayout;

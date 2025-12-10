// context/SidebarContext.jsx
"use client";

import { createContext, useState } from "react";

export const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);
  const openSidebar = () => setIsSidebarOpen(true);

  return (
    <SidebarContext.Provider
      value={{ isSidebarOpen, toggleSidebar, closeSidebar, openSidebar }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

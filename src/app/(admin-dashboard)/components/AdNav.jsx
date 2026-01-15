import React, { useContext } from "react";
import Image from "next/image";
import logo from "@/assets/images/logo.png";
import { Menu, CircleUserRound, X } from "lucide-react";
import Link from "next/link";
import { SidebarContext } from "../../../../context/SidebarContext";

const AdNav = () => {
  const { isSidebarOpen, toggleSidebar } = useContext(SidebarContext);
  return (
    <div>
      <header className="engheader">
        {/* Desktop Logo */}
        <Link href="/admin-dashboard" className="engnavonelogo">
          <Image src={logo} alt="logo" width={120} />
        </Link>

        {/* Mobile Menu */}
        <div className="engside-logo-menu" onClick={toggleSidebar}>
          <button className="menu-toggle-btn">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Image src={logo} alt="logo" width={120} />
        </div>
        <div className="eng-head-icon">
          <CircleUserRound /> Admin
        </div>
      </header>
    </div>
  );
};

export default AdNav;

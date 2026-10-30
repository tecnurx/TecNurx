import React, { useContext } from "react";
import Image from "next/image";
import logo from "@/assets/images/logo.png";
import { Menu, CircleUserRound, X } from "lucide-react";
import { SidebarContext } from "../../../../context/SidebarContext";
import Link from "next/link";

const EngNav = () => {
  const { isSidebarOpen, toggleSidebar } = useContext(SidebarContext);

  return (
    <div>
      <header className="engheader">
        {/* Desktop Logo */}
        <Link href="/engineer-dashboard" className="engnavonelogo">
          <Image src={logo} alt="TecNurx" width={120} height={29} priority />
        </Link>

        {/* Mobile Menu */}
        <div className="engside-logo-menu">
          <button
            type="button"
            className="menu-toggle-btn"
            onClick={toggleSidebar}
            aria-label="Toggle navigation menu"
          >
            {isSidebarOpen ? (
              <X size={20} color="#111111" strokeWidth={2.2} />
            ) : (
              <Menu size={20} color="#111111" strokeWidth={2.2} />
            )}
          </button>
          <Link
            href="/engineer-dashboard"
            style={{ display: "flex", alignItems: "center" }}
          >
            <Image src={logo} alt="TecNurx" width={115} height={28} priority />
          </Link>
        </div>

        {/* User Badge */}
        <div
          className="eng-head-icon"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            fontWeight: "700",
            color: "#111827",
            padding: "6px 10px",
            borderRadius: "8px",
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          }}
        >
          <CircleUserRound size={24} color="#ffc400" style={{ flexShrink: 0 }} />
          <span className="eng-user-label">Engineer</span>
        </div>
      </header>
    </div>
  );
};

export default EngNav;

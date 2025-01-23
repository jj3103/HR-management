// src/components/Layout.js
import React, { useState } from 'react';
import NavBar from './NavBar';
import SideNavbar from './SideNavbar';
import '../css/NavBar.css';

const Layout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="layout">
      <SideNavbar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div className={`main-container ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <NavBar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

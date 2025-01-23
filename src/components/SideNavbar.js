// src/components/SideNavbar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import {FaWpforms, } from 'react-icons/fa';
import { IoIosAddCircleOutline } from "react-icons/io";
import { SiGoogleclassroom,  SiTableau, SiReacttable, SiCaddy } from "react-icons/si";
import { CiBank } from "react-icons/ci";
import { BiRepost, BiTachometer, BiSelectMultiple } from "react-icons/bi";
import { BsColumnsGap, BsBank } from "react-icons/bs";
import { GrDocumentPerformance } from "react-icons/gr";
import { MdOutlineManageHistory, MdOutlineCoPresent } from "react-icons/md";
import { CgUserAdd,CgPerformance } from "react-icons/cg";
import { PiNumpadDuotone } from "react-icons/pi";
import { TbSquareToggle } from "react-icons/tb";
import { TiDocumentAdd } from "react-icons/ti";
import { FiDatabase } from "react-icons/fi";
import { AiOutlineFileProtect } from "react-icons/ai";
import { AiOutlineBarChart } from "react-icons/ai";

import '../css/NavBar.css';

const SideNavbar = ({ isCollapsed, toggleSidebar }) => {
  const menuItems = [
    { icon: BiTachometer, label: 'Dashboard', path: '/dashboard' },
    { icon: FiDatabase, label: 'Personnel List', path: '/personnel-list' },
    { icon: SiGoogleclassroom, label: 'Course List', path: '/course-list' },
    { icon: BiRepost, label: 'Posting', path: '/postings' },
    { icon: AiOutlineFileProtect, label: 'Leave', path: '/leavetable' },
    { icon: SiTableau, label: 'Disciplinary', path: '/discplinarytable' },
    { icon: SiReacttable, label: 'Qualification', path: '/qualificationtable' },
    { icon: GrDocumentPerformance, label: 'Promotion', path: '/promotionTable' },
    {icon: BiSelectMultiple, label: 'Qualified Personnel', path: '/QualifiedPersonnelTable'},
    {icon: BsBank, label: 'Bank Details', path: '/bankdetails'},
    {icon: AiOutlineBarChart, label: 'Graphs', path: '/graph'},
    { icon: AiOutlineFileProtect, label: 'Leave Management', path: '/leavemanagement' },
    

  ];

  const addItems = [
    { icon: IoIosAddCircleOutline, label: 'Personnel', path: '/add-personnel' },
    { icon: FaWpforms, label: 'Course', path: '/course-form' },
    { icon: CgUserAdd, label: 'Posting', path: '/postingform' },
    { icon: PiNumpadDuotone, label: 'Add Leave', path: '/leaveform' },
    { icon: TiDocumentAdd, label: 'Qualification Form', path: '/qualificationform' },
    { icon: SiCaddy, label: 'Disciplinary Action', path: '/discplinaryactions' },
    { icon: CgPerformance, label: 'Promotion Form', path: '/PersonnelPromotionRequirementForm' },
    { icon: BsColumnsGap, label: 'Additional Columns', path: '/additional-columns' },
    {icon: CiBank, label: 'Bank Details Form', path: '/bankdetailsform'}

  ];

  return (
    <nav className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <img src='indianarmy.png' alt='army-logo' className='sidebar-logo' width={40} />
        <span className="brand-name">HR Hub</span>
        <button onClick={toggleSidebar} className="toggle-btn">
          <TbSquareToggle style={{ fontSize: '24px' }} />
        </button>
      </div>
      <div className="sidebar-content">
        <div className="menu-section">
          <h6 className="menu-label">MAIN</h6>
          {menuItems.map((item, index) => (
            <NavLink key={index} to={item.path} className="menu-item" activeClassName="active">
              <item.icon className="menu-icon" />
              <span className="menu-text">{item.label}</span>
            </NavLink>
          ))}
        </div>
        <div className="menu-section">
          <h6 className="menu-label">Add Form</h6>
          {addItems.map((item, index) => (
            <NavLink key={index} to={item.path} className="menu-item" activeClassName="active">
              <item.icon className="menu-icon" />
              <span className="menu-text">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default SideNavbar;
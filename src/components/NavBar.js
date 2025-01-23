import React, { useContext } from 'react';
import { Navbar, Nav, Dropdown, Image } from 'react-bootstrap';
import { IoMdNotifications } from "react-icons/io";
import { MdManageAccounts } from "react-icons/md";
import { TbSubtask } from "react-icons/tb";
import { GrUserAdmin, GrUserNew } from "react-icons/gr";
import { HiOutlineLogout } from "react-icons/hi";
import { RiUserForbidFill } from "react-icons/ri";
import { BiLogIn } from "react-icons/bi";
import '../css/NavBar.css';
import { AuthContext } from '../context/authContext';

const NavBar = () => {
    const { isLoggedIn, userRole, userEmail, logout } = useContext(AuthContext);


    return (
        <Navbar expand="lg" className="border-bottom navbar-back">
            <Nav className="me-auto"></Nav>
            <Nav className="ml-auto navbar-icons">
                <Nav.Link href="/notification" className="me-3 position-relative">
                    <IoMdNotifications className="icon" />
                    <span className="notification-dot"></span>
                </Nav.Link>
                <div className="divider"></div>
                {isLoggedIn ? (
                    <>
                        <Dropdown align="end">
                            <Dropdown.Toggle variant="link" id="dropdown-basic" className="d-flex align-items-center profile-dropdown-toggle">
                                <Image
                                    src="http://localhost:5000/uploads/photo-profile.jpg"
                                    roundedCircle
                                    className="profile-image me-2"
                                />
                                <div className='navbar-pc'>
                                    <div className="profile-name">{userEmail}</div>
                                    <div className="profile-role">{userRole}</div>
                                </div>
                            </Dropdown.Toggle>

                            <Dropdown.Menu className="dropdown-menu-right">
                                <Dropdown.Item href="/manageadmin" className='navbar-txt'>
                                    <GrUserAdmin style={{ fontSize: '24px' }} /> Manage Admin
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={logout} className='navbar-logout'>
                                    <HiOutlineLogout style={{ fontSize: '24px' }} /> Logout
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </>
                ) : (
                    <Dropdown align="end">
                        <Dropdown.Toggle variant="link" id="dropdown-basic" className="d-flex align-items-center profile-dropdown-toggle">
                            <RiUserForbidFill className='icon' />
                        </Dropdown.Toggle>

                        <Dropdown.Menu className="dropdown-menu-right" style={{ marginTop: '13px' }}>
                            <Dropdown.Item href="/login" className='navbar-nu'>
                                <BiLogIn style={{ fontSize: '24px' }} /> Login
                            </Dropdown.Item>
                            <Dropdown.Item href="/register" className='navbar-nu'>
                                <GrUserNew style={{ fontSize: '24px' }} /> Sign Up
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                )}
            </Nav>
        </Navbar>
    );
};

export default NavBar;

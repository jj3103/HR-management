import React, { createContext, useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for the toast

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        const checkLoginStatus = () => {
            const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
            setIsLoggedIn(loggedIn);

            const storedEmail = localStorage.getItem('userEmail');
            setUserEmail(storedEmail);

            const role = localStorage.getItem('role');
            setUserRole(role);
        };

        checkLoginStatus();
    }, []);

    const logout = () => {
        handleLogout();
    }
    const handleLogout = async () => {
        const id = localStorage.getItem('id');
        try {
            // Make API call to the backend for logout
            const response = await axios.post('http://localhost:5000/users/logout', { id });

            if (response.status === 200) {
                // Successfully logged out
                ResetStorage();

                // Show success toast notification
                toast.success('Logout successful!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });

            } else {
                throw new Error('Failed to logout');
            }
        } catch (error) {
            // Handle error during logout
            console.error('Logout Error:', error);
            toast.error('Logout failed. Please try again.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    };

    const ResetStorage = () => {

        // Clear the stored user data
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('role');
        localStorage.removeItem('id');
        localStorage.removeItem('service_number');

        // Update the state
        setIsLoggedIn(false);
        setUserEmail('');
        setUserRole('');

    };



    return (
        <AuthContext.Provider value={{ isLoggedIn, userEmail, userRole, setIsLoggedIn, setUserEmail, setUserRole, logout }}>
            {children}
            <ToastContainer />
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };

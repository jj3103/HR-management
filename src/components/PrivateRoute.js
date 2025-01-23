// src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';  // Import toast

const PrivateRoute = ({ element: Component, ...rest }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn');

  if (isLoggedIn === 'true') {
    return <Component {...rest} />;
  } else {
    toast.error("You don't have access to this page.");
    return <Navigate to="/login" replace />;
  }
};

export default PrivateRoute;
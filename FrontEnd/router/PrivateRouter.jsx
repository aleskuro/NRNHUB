import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  // Check if the user object exists and has an authentication flag (adjust based on your state)
  const isAuthenticated = user && user.isAuthenticated; // Example: adjust based on your user object

  if (isAuthenticated) {
    return children;
  }

  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute;
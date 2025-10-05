import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode, JwtPayload } from "jwt-decode";

interface CustomJwtPayload extends JwtPayload {
  role?: string;
}

interface PrivateRouteProps {
  children: ReactNode;
  role?: string; 
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, role }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/main" replace />;
  }

  try {
    const decoded = jwtDecode<CustomJwtPayload>(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp && decoded.exp < currentTime) {
      localStorage.removeItem("token");
      return <Navigate to="/main" replace />;
    }

    if (role && decoded.role !== role) {
      return <Navigate to="/main" replace />;
    }
  } catch (error) {
    return <Navigate to="/main" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;

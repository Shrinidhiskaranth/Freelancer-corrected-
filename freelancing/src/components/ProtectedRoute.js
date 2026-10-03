import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// role: "CLIENT" | "FREELANCER"
// requireProfileComplete: if true, redirects to complete-profile when profile isn't done yet
function ProtectedRoute({ children, role, requireProfileComplete }) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (role && user.role !== role) {
        return <Navigate to="/" replace />;
    }

    if (requireProfileComplete && !user.profileCompleted) {
        const redirectPath = user.role === "CLIENT" ? "/client/complete-profile" : "/freelancer/complete-profile";
        return <Navigate to={redirectPath} replace />;
    }

    return children;
}

export default ProtectedRoute;

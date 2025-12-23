import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate("/login");
        }
        if (!loading && user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
            // Redirect if role not authorized
            navigate("/");
        }
    }, [user, loading, navigate, allowedRoles]);

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return user ? children : null;
};

export default ProtectedRoute;

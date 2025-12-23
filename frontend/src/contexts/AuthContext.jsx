import { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/axios";
import { toast } from "react-toastify";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const { data } = await api.get("/auth/me");
                setUser(data.data.user);
            } catch (err) {
                console.error("Auth check failed:", err);
                localStorage.removeItem("token");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post("/auth/login", { email, password });
            const { token, user } = response.data;

            localStorage.setItem("token", token);
            setUser(user);
            toast.success("Welcome back!");
            return true;
        } catch (err) {
            toast.error(err.response?.data?.message || "Login failed");
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        toast.info("Logged out");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

import { useState } from "react";
import { loginUserApi } from "../api/auth"; 
import { AuthContext } from "./AuthContext";
import { jwtDecode } from "jwt-decode";

export function AuthProvider({ children }) {
  // 1. Initialize token state directly
  const [token, setToken] = useState(() => localStorage.getItem("access_token"));

  // 2. LAZY INITIALIZATION: Figure out the user before the first render!
  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem("access_token");
    if (savedToken) {
      try {
        const decoded = jwtDecode(savedToken);
        // Return the decoded user immediately as the initial state
        return { email: decoded.sub, role: decoded.role };
      } catch (error) {
        console.error("Invalid token format", error);
        localStorage.removeItem("access_token"); // Clean up mangled tokens
        return null;
      }
    }
    return null;
  });

  const logout = () => {
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null); 
  };

  const login = async (email, password) => {
    const res = await loginUserApi({ email, password }); 
    const jwt = res.data.access_token; 

    localStorage.setItem("access_token", jwt);
    setToken(jwt);
    
    const decoded = jwtDecode(jwt);
    setUser({ email: decoded.sub, role: decoded.role });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
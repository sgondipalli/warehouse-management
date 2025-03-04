import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    token: null,
    roles: [], // ✅ Ensure roles is an empty array initially
  });

  // ✅ Login function
  const login = async (email, password) => {
    try {
      const response = await fetch("http://localhost:5001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        setAuthState({
          isAuthenticated: true,
          user: data.user,
          token: data.token,
          roles: data.roles || [], // ✅ Ensure roles is an array
        });
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error.message);
      throw error;
    }
  };

  // ✅ Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setAuthState({ isAuthenticated: false, user: null, token: null, roles: [] }); // ✅ Reset roles on logout
  };

  return (
    <AuthContext.Provider value={{ authState, setAuthState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

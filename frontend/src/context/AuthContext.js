import { createContext, useState, useContext, useEffect, useCallback } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    roles: [],
    token: localStorage.getItem("token") || null,
  });

  // ✅ Logout function
  const logout = useCallback(() => {
    console.log("🔴 Logging out...");
    localStorage.removeItem("token");
    setAuthState({ isAuthenticated: false, user: null, roles: [], token: null });
  }, []);

  // ✅ Fetch user details from backend (Includes `logout` dependency)
  const fetchUser = useCallback(
    async (token) => {
      try {
        const response = await fetch("http://localhost:5001/auth/me", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          logout(); // 🔹 Call logout on failure
          return;
        }

        const data = await response.json();
        setAuthState({
          isAuthenticated: true,
          user: data.user,
          roles: Array.isArray(data.roles) ? data.roles : [],
          token,
        });
      } catch (error) {
        console.error("Error fetching user:", error);
        logout();
      }
    },
    [logout] // 🔹 Now `logout` is included as a dependency
  );

  // ✅ Load user on page refresh
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUser(token);
    }
  }, [fetchUser]); // ✅ No more warnings 🚀

  // ✅ Login function
  const login = async (email, password, navigate) => {
    try {
      const response = await fetch("http://localhost:5001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");
  
      console.log("✅ Login Successful. User:", data.user);
  
      // ✅ Store token in localStorage
      localStorage.setItem("token", data.token);
  
      // ✅ Update Auth State
      setAuthState({
        isAuthenticated: true,
        user: data.user,
        roles: Array.isArray(data.roles) ? data.roles : [], // ✅ Ensure roles is an array
        token: data.token,
      });
  
      // ✅ Redirect after login
      navigate("/dashboard");  // Change this to your required route
  
      return data;
    } catch (error) {
      console.error("❌ Login Error:", error.message);
      throw error;
    }
  };
  

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

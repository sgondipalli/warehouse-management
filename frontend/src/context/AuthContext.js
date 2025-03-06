import { createContext, useState, useContext, useEffect, useCallback } from "react";
import { OktaAuth } from "@okta/okta-auth-js";


const AuthContext = createContext();

// Configure Okta
const oktaAuth = new OktaAuth({
  issuer: "https://dev-69702302.okta.com/oauth2/default",
  clientId: "0oanp201ksS11SXU85d7",
  redirectUri: "http://localhost:3000/auth/callback",
});


export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    roles: [],
    token: localStorage.getItem("token") || null,
  });

  /** 🔹 Logout Function for BOTH Email/Password & Okta */
  const logout = useCallback(async () => {
    console.log("Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    try {
      await oktaAuth.signOut(); // Logout from Okta
    } catch (error) {
      console.error("Okta Logout Error:", error);
    }

    setAuthState({ isAuthenticated: false, user: null, roles: [], token: null });
  }, []);

  /** 🔹 Fetch user details from backend (For Email/Password Authentication) */
  const fetchUser = useCallback(
    async (token) => {
      try {
        const response = await fetch("http://localhost:5001/auth/me", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          logout();
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
    [logout]
  );

  /** 🔹 Handle Email/Password Login */
  const login = async (email, password, navigate) => {
    try {
      const response = await fetch("http://localhost:5001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      console.log("Login Successful. User:", data.user);

      // Store token in localStorage
      localStorage.setItem("token", data.token);

      // Update Auth State
      setAuthState({
        isAuthenticated: true,
        user: data.user,
        roles: Array.isArray(data.roles) ? data.roles : [],
        token: data.token,
      });

      navigate("/dashboard"); // Redirect after login

      return data;
    } catch (error) {
      console.error("Login Error:", error.message);
      throw error;
    }
  };

  /** 🔹 Login with Okta */
  const loginWithOkta = async () => {
    await oktaAuth.signInWithRedirect();
  };

  /** 🔹 Handle Okta Authentication Callback */
  const handleOktaCallback = async (navigate) => {
    try {
      const tokens = await oktaAuth.token.parseFromUrl();
      if (tokens.idToken) {
        localStorage.setItem("token", tokens.idToken.idToken);
        setAuthState({
          isAuthenticated: true,
          user: tokens.idToken.claims,
          roles: [], // Okta roles can be fetched via API if needed
          token: tokens.idToken.idToken,
        });
        navigate("/dashboard"); // Redirect after successful login
      }
    } catch (error) {
      console.error("Okta Authentication Error:", error);
    }
  };

  /** 🔹 Restore Session on Refresh */
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("token");

      if (token && !authState.isAuthenticated) {
        try {
          const sessionExists = await oktaAuth.session.exists();
          if (sessionExists) {
            const userInfo = await oktaAuth.getUser();
            setAuthState({
              isAuthenticated: true,
              user: userInfo,
              roles: [], // Fetch roles if needed
              token,
            });
          } else {
            fetchUser(token);
          }
        } catch (error) {
          console.error("Session Restore Error:", error);
          logout();
        }
      }
    };

    restoreSession();
  }, [authState.isAuthenticated, fetchUser, logout]);

  return (
    <AuthContext.Provider value={{ authState, login, loginWithOkta, logout, handleOktaCallback }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

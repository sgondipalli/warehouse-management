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

  const [loading, setLoading] = useState(true);
  /** Logout Function for BOTH Email/Password & Okta */
  const logout = useCallback(async () => {
    console.log("Logging out...");
    console.log("Token in localStorage before logout:", localStorage.getItem("token"));
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    try {
      await oktaAuth.signOut(); // Logout from Okta
    } catch (error) {
      console.error("Okta Logout Error:", error);
    }

    setAuthState({ isAuthenticated: false, user: null, roles: [], token: null });
    window.location.href = "/login";
  }, []);

  /** Fetch user details from backend (For Email/Password Authentication) */
  const fetchUser = useCallback(
    async (token) => {
      try {
        console.log("Fetching user with token:", token);

        const response = await fetch("http://localhost:5001/auth/me", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          console.log("Token is invalid or expired. Logging out...");
          logout();
          return;
        }

        const data = await response.json();
        console.log("User data received:", data);
        setAuthState({
          isAuthenticated: true,
          user: {
            id: data.user.id,
            username: data.user.username,
            email: data.user.email,
            firstName: data.user.firstName, 
            lastName: data.user.lastName,    
          },
          roles: Array.isArray(data.roles) ? data.roles : [],
          token,
        });
        
        setLoading(false);
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

  /** Restore Session on Refresh */
  const restoreSession = async () => {
    const token = localStorage.getItem("token");
    console.log("Restoring session with token:", token);

    if (token) {
      try {
        console.log("Checking backend session first...");
        await fetchUser(token);
        return;
      } catch (error) {
        console.log("Backend session failed. Checking Okta session...");
      }

      try {
        const sessionExists = await oktaAuth.session.exists();
        if (sessionExists) {
          const userInfo = await oktaAuth.getUser();
          console.log("User authenticated via Okta session:", userInfo);

          setAuthState({
            isAuthenticated: true,
            user: userInfo,
            roles: [],
            token,
          });
        }
      } catch (error) {
        console.error("Okta session restore failed:", error);
      }
    }

    setLoading(false); // Ensure loading state updates if session is not restored
  };

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    console.log("Auth state updated:", authState);
  }, [authState]);

  return (
    <AuthContext.Provider value={{ authState, login, loginWithOkta, logout, handleOktaCallback, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
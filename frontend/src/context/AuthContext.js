import { createContext, useState, useContext, useEffect, useCallback } from "react";
import { OktaAuth } from "@okta/okta-auth-js";
import axios from "axios";

const AuthContext = createContext();

const oktaAuth = new OktaAuth({
  issuer: "https://dev-69702302.okta.com/oauth2/default",
  clientId: "0oanp201ksS11SXU85d7",
  redirectUri: "http://localhost:3000/auth/callback",
});

const api = axios.create({
  baseURL: "http://localhost:5001",
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: token => {
              originalRequest.headers["Authorization"] = "Bearer " + token;
              resolve(api(originalRequest));
            },
            reject: err => reject(err),
          });
        });
      }

      isRefreshing = true;

      try {
        const res = await api.get("/auth/refresh");
        const { accessToken: newToken, user, roles } = res.data;

        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("roles", JSON.stringify(roles));
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        processQueue(null, newToken);
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        window.dispatchEvent(new Event("sessionExpired"));
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    roles: [],
    token: localStorage.getItem("token") || null,
  });
  const [loading, setLoading] = useState(true);
  const [wasRestored, setWasRestored] = useState(false);
  const [lastActive, setLastActive] = useState(Date.now());

  const logout = useCallback(async (navigate) => {
    localStorage.clear();
    try {
      await api.post("/auth/logout");
      await oktaAuth.signOut();
    } catch (err) {
      console.error("Logout error", err);
    }
    setAuthState({ isAuthenticated: false, user: null, roles: [], token: null });
    window.dispatchEvent(new CustomEvent("authStateSync"));
    if (navigate) navigate("/login", { replace: true });
  }, []);

  const fetchUser = useCallback(async (token) => {
    const res = await api.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { user, roles } = res.data;
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("roles", JSON.stringify(roles));
    setAuthState({
      isAuthenticated: true,
      user,
      roles,
      token,
    });
  }, []);

  const login = async (email, password, navigate) => {
    const res = await api.post("/auth/login", { email, password });
    const { accessToken, user, roles } = res.data;
    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("roles", JSON.stringify(roles));
    api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    setAuthState({ isAuthenticated: true, user, roles, token: accessToken });
    window.dispatchEvent(new CustomEvent("authStateSync"));
    navigate("/dashboard");
  };

  const loginWithOkta = async () => {
    await oktaAuth.signInWithRedirect();
  };

  // const handleOktaCallback = async (navigate) => {
  //   try {
  //     const tokens = await oktaAuth.token.parseFromUrl();
  //     if (tokens.idToken) {
  //       const token = tokens.idToken.idToken;
  //       localStorage.setItem("token", token);
  //       setAuthState({ isAuthenticated: true, user: tokens.idToken.claims, roles: [], token });
  //       navigate("/dashboard");
  //     }
  //   } catch (err) {
  //     console.error("Okta callback error", err);
  //   }
  // };

  const restoreSession = useCallback(async () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const roles = JSON.parse(localStorage.getItem("roles"));

    try {
      if (token && token.split('.').length === 3 && user) {
        // Good token
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setAuthState({ isAuthenticated: true, user, roles, token });
        setWasRestored(true);
      } else {
        // Bad token -> try refresh
        const res = await api.get("/auth/refresh");
        const { token: newToken, user: refreshedUser, roles: refreshedRoles } = res.data;
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(refreshedUser));
        localStorage.setItem("roles", JSON.stringify(refreshedRoles));
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        setAuthState({
          isAuthenticated: true,
          user: refreshedUser,
          roles: refreshedRoles,
          token: newToken,
        });
        setWasRestored(true);
      }
    } catch {
      localStorage.clear();
      setAuthState({ isAuthenticated: false, user: null, roles: [], token: null });
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    const syncHandler = () => {
      restoreSession();
    };
    window.addEventListener("authStateSync", syncHandler);
    window.addEventListener("storage", syncHandler);
    return () => {
      window.removeEventListener("authStateSync", syncHandler);
      window.removeEventListener("storage", syncHandler);
    };
  }, [restoreSession]);

  useEffect(() => {
    const interval = setInterval(() => setLastActive(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const isExpiringSoon = () => {
    const exp = JSON.parse(atob(authState.token?.split(".")[1] || "{}"))?.exp;
    if (!exp) return false;
    const secondsLeft = exp - Math.floor(Date.now() / 1000);
    return secondsLeft < 60 * 3;
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        loginWithOkta,
        logout,
        // handleOktaCallback,
        loading,
        wasRestored,
        lastActive,
        isExpiringSoon,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001",
  withCredentials: true, // include cookies in all requests
});

api.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.get("http://localhost:5001/auth/refresh", {
          withCredentials: true,
        });
        const newToken = res.data.token;
        localStorage.setItem("token", newToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;

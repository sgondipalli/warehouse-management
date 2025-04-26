// components/ToastProvider.js
import React, { useState, useEffect } from "react";

const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timeout = setTimeout(onClose, 4000);
    return () => clearTimeout(timeout);
  }, [onClose]);

  return (
    <div style={{
      position: "fixed", bottom: "20px", right: "20px",
      backgroundColor: "#333", color: "#fff", padding: "12px 20px",
      borderRadius: "6px", boxShadow: "0px 2px 6px rgba(0,0,0,0.3)"
    }}>
      {message}
    </div>
  );
};

const ToastProvider = () => {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const handleRefresh = () => setMessage("🔄 Session refreshed silently");
    const handleExpired = () => setMessage("⚠️ Session expired. Please log in again.");

    window.addEventListener("sessionRefreshed", handleRefresh);
    window.addEventListener("sessionExpired", handleExpired);

    return () => {
      window.removeEventListener("sessionRefreshed", handleRefresh);
      window.removeEventListener("sessionExpired", handleExpired);
    };
  }, []);

  if (!message) return null;

  return <Toast message={message} onClose={() => setMessage(null)} />;
};

export default ToastProvider;

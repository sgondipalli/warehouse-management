import React from "react";
import ForgotPasswordForm from "../components/ForgotPasswordForm";
import styles from "../styles/ForgotPasswordForm.module.css"; // Reuse styles if needed

const ForgotPasswordPage = () => {
  return (
    <div className={styles.forgotPasswordContainer}>
      <ForgotPasswordForm />
    </div>
  );
};

export default ForgotPasswordPage;

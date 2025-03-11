import React from "react";
import styles from "../styles/Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Contact Information */}
        <div className={styles.section}>
          <h3>Contact Us</h3>
          <p><i className="fa-solid fa-location-dot"></i> AAPS Solutions Inc</p>
          <p>300 E Royal Ln, Suite #116</p>
          <p>Irving, Texas 75039, USA</p>
          <p><i className="fa-solid fa-phone"></i> +1 732-267-9913</p>
          <p><i className="fa-solid fa-envelope"></i> info@aapssol.com</p>
        </div>

        {/* Copyright Notice */}
        <div className={styles.section}>
          <p>© Copyright AAPSSOL. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

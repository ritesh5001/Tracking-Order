import React from 'react';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer__inner">
      <span className="muted">Developed by</span>
      <a
        className="footer__link"
        href="https://api.whatsapp.com/send/?phone=%2B917348228167&text=Hello%2C+I+need+a+website&type=phone_number&app_absent=0"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact NextGen Fusion on WhatsApp"
      >
        NextGen Fusion
      </a>
    </div>
  </footer>
);

export default Footer;

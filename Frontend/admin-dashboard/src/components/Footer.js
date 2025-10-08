import React from 'react';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer__inner">
      <span className="muted">© {new Date().getFullYear()} SHREE CARGO SURAT</span>
    </div>
  </footer>
);

export default Footer;

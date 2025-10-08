import React from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import './PageLayout.css';
import './Contact.css';

const Contact = () => (
  <div className="page page--contact">
    <NavBar />
    <main className="page__main">
      <div className="page__container">
        <header className="page__header">
          <span className="eyebrow">SHREE CARGO SURAT</span>
          <h1>Contact us</h1>
          <p>We’d love to help you with bookings, tracking, or any cargo queries.</p>
        </header>

        <section className="section-grid contact__grid">
          <article className="section-card contact__card">
            <span className="tag">Address</span>
            <h3>Visit our office</h3>
            <address>
              <strong>SHREE CARGO SURAT</strong><br />
              Plot No. 35, Shop No. 6, Ground Floor,<br />
              Sky App., Surat
            </address>
          </article>
          <article className="section-card contact__card">
            <span className="tag">Email</span>
            <h3>Write to us</h3>
            <a className="btn btn--primary contact__cta" href="mailto:shreecargo84@gmail.com">shreecargo84@gmail.com</a>
          </article>
          <article className="section-card contact__card">
            <span className="tag">Phone</span>
            <h3>Call us</h3>
            <a className="btn contact__cta" href="tel:+913324667834">03324667834</a>
          </article>
        </section>

        <section className="section-block contact__details">
          <h2>Service hours</h2>
          <p>Open all days. For pickups and urgent queries, please call us.</p>
          <div className="contact__channels">
            <div>
              <span className="label">Phone</span>
              <a href="tel:+913324667834">03324667834</a>
            </div>
            <div>
              <span className="label">Email</span>
              <a href="mailto:shreecargo84@gmail.com">shreecargo84@gmail.com</a>
            </div>
            <div>
              <span className="label">Office Hours</span>
              <p>9:00 AM to 8:00 PM IST</p>
            </div>
          </div>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default Contact;

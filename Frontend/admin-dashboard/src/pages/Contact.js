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
          <span className="eyebrow">Contact</span>
          <h1>Let’s build your next logistics milestone together</h1>
          <p>
            Reach out to the TrackX team for platform walkthroughs, partnership opportunities, or
            customer support. We respond within one business day.
          </p>
        </header>

        <section className="section-grid contact__grid">
          <article className="section-card contact__card">
            <span className="tag">Talk to sales</span>
            <h3>Schedule a guided demo</h3>
            <p>Share your current logistics setup and we’ll tailor a product tour to your workflows.</p>
            <a className="btn btn--primary contact__cta" href="mailto:hello@trackx.io">hello@trackx.io</a>
          </article>
          <article className="section-card contact__card">
            <span className="tag">Customer success</span>
            <h3>Get expert support</h3>
            <p>
              Our success engineers are available via live chat and email to keep your operations running
              smoothly.
            </p>
            <a className="btn contact__cta" href="mailto:support@trackx.io">support@trackx.io</a>
          </article>
          <article className="section-card contact__card">
            <span className="tag">Partnerships</span>
            <h3>Integrate with TrackX</h3>
            <p>Interested in collaborating or building on our API? We’d love to hear from you.</p>
            <a className="btn contact__cta" href="mailto:partners@trackx.io">partners@trackx.io</a>
          </article>
        </section>

        <section className="section-block contact__details">
          <h2>Prefer a quick call?</h2>
          <p>We operate globally with dedicated support in India, Europe, and North America.</p>
          <address>
            <strong>Global HQ</strong><br />
            TrackX Technologies Pvt. Ltd.<br />
            221 Innovation Drive, Bengaluru, India
          </address>
          <div className="contact__channels">
            <div>
              <span className="label">Phone</span>
              <a href="tel:+917348228167">+91 73482 28167</a>
            </div>
            <div>
              <span className="label">WhatsApp</span>
              <a
                href="https://api.whatsapp.com/send/?phone=%2B917348228167&text=Hello%2C+I+need+a+website&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
              >
                Start conversation
              </a>
            </div>
            <div>
              <span className="label">Office Hours</span>
              <p>Monday—Friday · 9:00 AM to 6:00 PM IST</p>
            </div>
          </div>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default Contact;

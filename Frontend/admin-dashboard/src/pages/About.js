import React from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import './PageLayout.css';
import './About.css';

const About = () => (
  <div className="page page--about">
    <NavBar />
    <main className="page__main">
      <div className="page__container">
        <header className="page__header">
          <span className="eyebrow">About TrackX</span>
          <h1>Integrated logistics intelligence for high-growth businesses</h1>
          <p>
            TrackX unifies shipment visibility, predictive ETAs, and proactive notifications so you can
            orchestrate global deliveries with confidence. Our platform eliminates guesswork and keeps
            your customers informed at every milestone.
          </p>
          <div className="about__stats">
            <div className="about__stat">
              <strong>99.5%</strong>
              <span>On-time updates</span>
            </div>
            <div className="about__stat">
              <strong>48+</strong>
              <span>Global carriers</span>
            </div>
            <div className="about__stat">
              <strong>15 min</strong>
              <span>Average onboarding</span>
            </div>
          </div>
        </header>

        <section className="section-grid">
          <article className="section-card">
            <span className="tag">Our mission</span>
            <h3>Deliver clarity across the supply chain</h3>
            <p>
              We combine data engineering, thoughtful design, and 24/7 support to make complex logistics
              transparent, collaborative, and customer-centric.
            </p>
          </article>
          <article className="section-card">
            <span className="tag">What we build</span>
            <h3>Experience-led tracking</h3>
            <p>
              The TrackX control tower gives operations teams a single source of truth while empowering
              end customers with branded, real-time visibility experiences.
            </p>
          </article>
          <article className="section-card">
            <span className="tag">Who we serve</span>
            <h3>Modern commerce teams</h3>
            <p>
              From direct-to-consumer startups to enterprise shippers, TrackX scales with your volume and
              integrates with the systems you already trust.
            </p>
          </article>
        </section>

        <section className="section-block about__vision">
          <h2>Crafted for resilience and speed</h2>
          <p>
            Our product and engineering squads prototype, test, and ship features in rapid sprints so your
            teams can respond faster to demand. Every release is grounded in service-level agreements and
            zero-downtime architecture.
          </p>
          <ul className="about__list">
            <li>Enterprise-grade security, encryption, and compliance baked into every workflow.</li>
            <li>Predictive insights driven by machine learning to flag delays before they happen.</li>
            <li>Configurable notifications that align with your brand voice and customer journey.</li>
          </ul>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default About;

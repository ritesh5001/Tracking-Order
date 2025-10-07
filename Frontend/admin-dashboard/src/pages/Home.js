import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import api from '../api/axios';
import './Home.css';

const NETWORK_INSIGHTS = [
  {
    title: 'Outbound hub',
    status: 'On schedule',
    detail: 'Last scan 2 minutes ago',
    tag: '+12 shipments cleared'
  },
  {
    title: 'Customs window',
    status: 'Cleared',
    detail: 'No holds detected',
    tag: 'Green lane'
  },
  {
    title: 'Final mile fleet',
    status: '8 stops left',
    detail: 'Driver C. Patel — Route 14',
    tag: 'ETA holding steady'
  }
];

const FEATURE_CARDS = [
  {
    title: 'Delivery transparency',
    copy: 'Surface real-time milestones from every carrier and spot bottlenecks before customers notice.'
  },
  {
    title: 'Exception automation',
    copy: 'Trigger playbooks when a parcel stalls, notify your team, and keep recipients in the loop.'
  },
  {
    title: 'Analytics that matter',
    copy: 'Share SLA performance, dwell time, and carrier scorecards with stakeholders in seconds.'
  }
];

const JOURNEY_STEPS = [
  {
    title: 'Scan & verify',
    copy: 'Each parcel is validated against your OMS to prevent duplicates and missing manifests.',
    time: '0-5 minutes'
  },
  {
    title: 'Hub in transit',
    copy: 'We watch dwell times across depots and flag delays so you can reroute proactively.',
    time: '30-90 minutes'
  },
  {
    title: 'Doorstep delivery',
    copy: 'Customers receive branded notifications and proof-of-delivery the moment the job is complete.',
    time: 'Same day'
  }
];

const HERO_METRICS = [
  { value: '99.7%', label: 'Scan accuracy across lanes' },
  { value: '72+', label: 'Integrated global carriers' },
  { value: '<4h', label: 'Average resolution SLA' }
];

const Home = () => {
  const [mode, setMode] = useState('tracking'); // 'tracking' | 'phone'
  const [tracking, setTracking] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [list, setList] = useState([]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setList([]);
    setLoading(true);
    try {
      if (mode === 'tracking') {
        const { data } = await api.get(`/shipment/${encodeURIComponent(tracking)}`);
        setResult(data);
      } else {
        const { data } = await api.get(`/shipment/by-phone/${encodeURIComponent(phone)}`);
        setList(data?.shipments || []);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Shipment not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <NavBar />
      <main id="home" className="home">
        <section className="hero">
          <div className="hero__glow" aria-hidden />
          <div className="hero__inner">
            <div className="hero__layout">
              <div className="hero__content">
                <span className="eyebrow">Unified logistics visibility</span>
                <h1>Track every parcel and keep promises on time.</h1>
                <p className="sub">Reliable, real-time tracking built for modern logistics teams, with actionable alerts baked in.</p>

                <div className="hero__badges">
                  <span className="badge">Live network snapshots</span>
                  <span className="badge">Proactive notifications</span>
                  <span className="badge">Customer-ready portal</span>
                </div>

                <div className="seg" role="tablist" aria-label="Tracking mode">
                  <button
                    className={`seg__btn ${mode === 'tracking' ? 'is-active' : ''}`}
                    type="button"
                    role="tab"
                    aria-selected={mode === 'tracking'}
                    onClick={() => setMode('tracking')}
                  >
                    By Tracking ID
                  </button>
                  <button
                    className={`seg__btn ${mode === 'phone' ? 'is-active' : ''}`}
                    type="button"
                    role="tab"
                    aria-selected={mode === 'phone'}
                    onClick={() => setMode('phone')}
                  >
                    By Phone Number
                  </button>
                </div>

                <form className="track" onSubmit={onSubmit}>
                  {mode === 'tracking' ? (
                    <input
                      className="track__input"
                      placeholder="Enter Tracking ID"
                      value={tracking}
                      onChange={(e) => setTracking(e.target.value)}
                      required
                    />
                  ) : (
                    <input
                      className="track__input"
                      placeholder="Enter Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  )}
                  <button className="track__btn" type="submit" disabled={loading}>
                    {loading ? 'Tracking…' : 'Track Order'}
                  </button>
                </form>

                {error && <div className="alert alert--error">{error}</div>}

                {mode === 'tracking' && result && (
                  <div className="card result">
                    <div className="row"><span>Tracking ID</span><strong>{result.trackingId}</strong></div>
                    <div className="row"><span>Status</span><strong>{result.status}</strong></div>
                    <div className="row"><span>Location</span><strong>{result.currentLocation}</strong></div>
                    {result.estimatedDelivery && (
                      <div className="row"><span>ETA</span><strong>{new Date(result.estimatedDelivery).toLocaleDateString()}</strong></div>
                    )}
                  </div>
                )}

                {mode === 'phone' && list.length > 0 && (
                  <div className="card result result--list">
                    {list.map((item, index) => (
                      <div key={item._id || index} className="result__shipment">
                        <div className="result__columns">
                          <div>
                            <span>Tracking ID</span>
                            <strong>{item.trackingId}</strong>
                          </div>
                          <div>
                            <span>Status</span>
                            <strong>{item.status}</strong>
                          </div>
                          <div>
                            <span>Location</span>
                            <strong>{item.currentLocation}</strong>
                          </div>
                          {item.estimatedDelivery && (
                            <div>
                              <span>ETA</span>
                              <strong>{new Date(item.estimatedDelivery).toLocaleDateString()}</strong>
                            </div>
                          )}
                        </div>
                        {index !== list.length - 1 && <div className="result__divider" aria-hidden />}
                      </div>
                    ))}
                  </div>
                )}

                <div className="hero__metrics" aria-label="Operations insight">
                  {HERO_METRICS.map((metric) => (
                    <div key={metric.label} className="hero__metric">
                      <strong>{metric.value}</strong>
                      <span>{metric.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <aside className="hero__panel" aria-label="Live delivery summary">
                <div className="panel-card">
                  <header className="panel-card__header">
                    <h3>Network health</h3>
                    <span className="panel-card__tag">Live feed</span>
                  </header>
                  <ul className="panel-card__list">
                    {NETWORK_INSIGHTS.map((item) => (
                      <li key={item.title} className="panel-card__item">
                        <div>
                          <p>{item.title}</p>
                          <span>{item.detail}</span>
                        </div>
                        <div className="panel-card__status">
                          <strong>{item.status}</strong>
                          <small>{item.tag}</small>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="panel-card panel-card--progress">
                  <header className="panel-card__header">
                    <h3>Today&apos;s flow</h3>
                    <span className="panel-card__tag panel-card__tag--muted">4 lanes monitored</span>
                  </header>
                  <div className="progress">
                    <div className="progress__lane">
                      <span>Air Express</span>
                      <div className="progress__bar" role="progressbar" aria-valuenow="82" aria-valuemin="0" aria-valuemax="100">
                        <span style={{ width: '82%' }} />
                      </div>
                      <small>ETA holding — 82%</small>
                    </div>
                    <div className="progress__lane">
                      <span>Regional Freight</span>
                      <div className="progress__bar" role="progressbar" aria-valuenow="64" aria-valuemin="0" aria-valuemax="100">
                        <span style={{ width: '64%' }} />
                      </div>
                      <small>Weather watchlist — 64%</small>
                    </div>
                    <div className="progress__lane">
                      <span>Last-mile Vans</span>
                      <div className="progress__bar" role="progressbar" aria-valuenow="91" aria-valuemin="0" aria-valuemax="100">
                        <span style={{ width: '91%' }} />
                      </div>
                      <small>Driver capacity green — 91%</small>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="section section--features">
          <div className="section__inner">
            <div className="section__header">
              <h2>Stay ahead of exceptions and elevate every delivery.</h2>
              <p>Monitor lanes, carriers, and service issues with a command center designed for operators.</p>
            </div>
            <div className="features__grid">
              {FEATURE_CARDS.map((card) => (
                <article key={card.title} className="feature-card">
                  <h3>{card.title}</h3>
                  <p>{card.copy}</p>
                  <button type="button" className="feature-card__link" aria-label={`Learn more about ${card.title}`}>
                    Learn more
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section--timeline">
          <div className="section__inner">
            <div className="section__header">
              <h2>From scan to doorstep — managed in one view.</h2>
              <p>We orchestrate the journey for you, so your team can focus on delighting customers.</p>
            </div>
            <div className="timeline__steps">
              {JOURNEY_STEPS.map((step, index) => (
                <article key={step.title} className="timeline__step">
                  <span className="timeline__index">{index + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                  <span className="timeline__time">{step.time}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section--cta">
          <div className="section__inner">
            <div className="cta">
              <h2>Need a dedicated logistics partner?</h2>
              <p>Connect with our specialists to map your fulfillment journey and discover what seamless tracking feels like.</p>
              <div className="cta__actions">
                <Link className="cta__btn cta__btn--primary" to="/contact">Talk to our team</Link>
                <Link className="cta__btn" to="/about">Explore our approach</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;

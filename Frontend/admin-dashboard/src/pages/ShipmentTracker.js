import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import api from '../api/axios';
import './PageLayout.css';
import './ShipmentTracker.css';

const ShipmentTracker = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState([]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setResult(null);
    setExpandedIds([]);
    setLoading(true);

    try {
      const cleanQuery = query.trim();

      if (!cleanQuery) {
        throw new Error('Please enter a tracking ID or phone number.');
      }

      const compactQuery = cleanQuery.replace(/[\s-]/g, '');
      const numericOnly = compactQuery.replace(/\D/g, '');
      const isPhoneLookup = numericOnly.length >= 6 && numericOnly.length === compactQuery.length;

      if (isPhoneLookup) {
        const { data } = await api.get(`/shipment/by-phone/${numericOnly}`);
        setResult({ type: 'phone', data });
      } else {
        const { data } = await api.get(`/shipment/${encodeURIComponent(cleanQuery)}`);
        setResult({ type: 'tracking', data });
      }
    } catch (error) {
      setErr(error?.response?.data?.message || error.message || 'Shipment not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (result?.type === 'phone') {
      const shipments = Array.isArray(result.data.shipments) ? result.data.shipments : [];
      if (result.data.count === 1 && shipments.length) {
        const first = shipments[0];
        const identifier = first?._id || first?.trackingId || 'shipment-0';
        setExpandedIds([identifier]);
      } else {
        setExpandedIds([]);
      }
    } else if (result) {
      setExpandedIds([]);
    }
  }, [result]);

  const toggleShipmentPanel = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id]
    );
  };

  const phoneShipments =
    result?.type === 'phone' && Array.isArray(result?.data?.shipments)
      ? result.data.shipments
      : [];
  const phoneShipmentCount =
    result?.type === 'phone'
      ? result?.data?.count ?? phoneShipments.length
      : 0;
  const phoneLabel =
    result?.type === 'phone'
      ? phoneShipments[0]?.customerPhone || 'this phone number'
      : 'this phone number';

  return (
    <div className="page page--track">
      <NavBar />
      <main className="page__main">
        <div className="page__container">
          <header className="page__header">
            <span className="eyebrow">Shipment Lookup</span>
            <h1>Track your shipment status in seconds</h1>
            <p>
              Enter either the tracking ID or the phone number you used when booking. We'll
              detect the right lookup automatically and show you the freshest status in seconds.
            </p>
          </header>

          <section className="section-block track-card">
            <form className="track-form" onSubmit={onSubmit}>
              <div className="track-form__row">
                <label htmlFor="lookup" className="track-form__label">Tracking ID or Phone Number</label>
                <input
                  id="lookup"
                  placeholder="Enter tracking ID (e.g. TRK-948201) or phone number"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  required
                />
              </div>
              <button disabled={loading} type="submit" className="btn btn--primary">
                {loading ? 'Verifying…' : 'Track Shipment'}
              </button>
              <p className="track-form__hint">
                No toggle needed—enter a tracking ID or a phone number (6+ digits, numbers only).
              </p>
            </form>

            {err && <div className="alert alert--error">{err}</div>}

            {result?.type === 'tracking' && (
              <div className="result-card" aria-live="polite">
                <h2>Shipment summary</h2>
                <dl className="result-card__grid">
                  <div className="result-card__row">
                    <dt>Tracking ID</dt>
                    <dd>{result.data.trackingId}</dd>
                  </div>
                  <div className="result-card__row">
                    <dt>Status</dt>
                    <dd>{result.data.status}</dd>
                  </div>
                  <div className="result-card__row">
                    <dt>Current Location</dt>
                    <dd>{result.data.currentLocation}</dd>
                  </div>
                  <div className="result-card__row">
                    <dt>Recipient</dt>
                    <dd>{result.data.customerName}</dd>
                  </div>
                  <div className="result-card__row">
                    <dt>Phone</dt>
                    <dd>{result.data.customerPhone}</dd>
                  </div>
                  {result.data.estimatedDelivery && (
                    <div className="result-card__row">
                      <dt>Estimated Delivery</dt>
                      <dd>{new Date(result.data.estimatedDelivery).toLocaleDateString()}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {result?.type === 'phone' && (
              <div className="result-card" aria-live="polite">
                <h2>{phoneShipmentCount} shipment{phoneShipmentCount === 1 ? '' : 's'} on this number</h2>
                <p className="track-list__intro">
                  {phoneShipmentCount > 1
                    ? 'Select a shipment below to view its full tracking details.'
                    : 'Showing all tracking details for this delivery.'}
                </p>
                <div className="track-list">
                  {phoneShipments.map((shipment, index) => {
                    const identifier = shipment._id || shipment.trackingId || `shipment-${index}`;
                    const isExpanded = expandedIds.includes(identifier);
                    const detailId = `shipment-${identifier}-panel`;
                    const statusLine = [shipment.status, shipment.currentLocation]
                      .filter(Boolean)
                      .join(' • ');

                    return (
                      <div
                        key={identifier}
                        className={`track-list__item${isExpanded ? ' track-list__item--expanded' : ''}`}
                      >
                        <button
                          type="button"
                          className="track-list__toggle"
                          onClick={() => toggleShipmentPanel(identifier)}
                          aria-expanded={isExpanded}
                          aria-controls={detailId}
                        >
                          <div className="track-list__summary">
                            <span className="track-list__title">{shipment.trackingId}</span>
                            <span className="track-list__caption">{statusLine || 'Status unavailable'}</span>
                          </div>
                          <span className="track-list__chevron" aria-hidden="true">
                            {isExpanded ? '▴' : '▾'}
                          </span>
                        </button>
                        {isExpanded && (
                          <div id={detailId} className="track-list__panel">
                            <dl className="result-card__grid track-list__details">
                              <div className="result-card__row">
                                <dt>Status</dt>
                                <dd>{shipment.status || '—'}</dd>
                              </div>
                              <div className="result-card__row">
                                <dt>Current Location</dt>
                                <dd>{shipment.currentLocation || '—'}</dd>
                              </div>
                              <div className="result-card__row">
                                <dt>Recipient</dt>
                                <dd>{shipment.customerName || '—'}</dd>
                              </div>
                              <div className="result-card__row">
                                <dt>Phone</dt>
                                <dd>{shipment.customerPhone || '—'}</dd>
                              </div>
                              {shipment.estimatedDelivery && (
                                <div className="result-card__row">
                                  <dt>Estimated Delivery</dt>
                                  <dd>{new Date(shipment.estimatedDelivery).toLocaleDateString()}</dd>
                                </div>
                              )}
                              {shipment.createdAt && (
                                <div className="result-card__row">
                                  <dt>Created</dt>
                                  <dd>{new Date(shipment.createdAt).toLocaleString()}</dd>
                                </div>
                              )}
                              {shipment.currentStatusNote && (
                                <div className="result-card__row">
                                  <dt>Notes</dt>
                                  <dd>{shipment.currentStatusNote}</dd>
                                </div>
                              )}
                            </dl>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="result-card__meta">
                  Showing the most recent shipments linked to {phoneLabel}
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ShipmentTracker;

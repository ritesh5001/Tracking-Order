import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import api from '../api/axios';
import './PageLayout.css';
import './ShipmentTracker.css';

const PNR_STEPS = [
  { label: 'Ordered' },
  { label: 'Shipped' },
  { label: 'In Transit' },
  { label: 'Out for Delivery' },
  { label: 'Delivered' },
];

const isPNRTrackingId = (trackingId) =>
  typeof trackingId === 'string' && trackingId.trim().toUpperCase().startsWith('PNR6');

const normalizeStatus = (value) => String(value || '').trim().toLowerCase();

const getPNRStepIndexFromStatus = (status) => {
  const normalized = normalizeStatus(status);

  if (!normalized) return 2;
  if (normalized === 'pending' || normalized === 'ordered' || normalized === 'order placed') return 0;
  if (normalized === 'dispatched' || normalized === 'shipped') return 1;
  if (normalized === 'in transit' || normalized === 'intransit') return 2;
  if (normalized === 'out for delivery' || normalized === 'outfordelivery') return 3;
  if (normalized === 'delivered') return 4;

  return 2;
};

const getPNRDisplayStatus = (status) => {
  const index = getPNRStepIndexFromStatus(status);
  return PNR_STEPS[index]?.label || String(status || 'In Transit');
};

const StatusTimeline = ({ currentIndex }) => {
  const safeIndex = Number.isFinite(currentIndex) ? currentIndex : 2;

  return (
    <div className="pnr-timeline" role="list" aria-label="Shipment status timeline">
      {PNR_STEPS.map((step, index) => {
        const isCompleted = index < safeIndex;
        const isCurrent = index === safeIndex;
        const isLast = index === PNR_STEPS.length - 1;

        return (
          <div
            key={step.label}
            className={
              `pnr-step${isCompleted ? ' pnr-step--completed' : ''}${isCurrent ? ' pnr-step--current' : ''}`
            }
            role="listitem"
          >
            <div className="pnr-step__marker" aria-hidden="true">
              <span className="pnr-step__dot">{isCompleted ? '✓' : ''}</span>
              {!isLast && <span className="pnr-step__line" />}
            </div>

            <div className="pnr-step__content">
              <div className="pnr-step__label">{step.label}</div>
            </div>

            <div className="pnr-step__state">{isCompleted ? 'Completed' : ''}</div>
          </div>
        );
      })}
    </div>
  );
};

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

      // If trackingId starts with PNR, do not call backend.
      // Show the fixed tracking details + status flow as requested.
      if (!isPhoneLookup && isPNRTrackingId(cleanQuery)) {
        setResult({
          type: 'tracking',
          data: {
            trackingId: cleanQuery,
            status: 'In Transit',
            currentLocation:
              "Parcel is dispatched from Shreecargo warehouse and it's on the way",
            customerName: 'Demo ..',
            customerPhone: '9561368433',
          },
        });
        return;
      }

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

                {isPNRTrackingId(result?.data?.trackingId) && (
                  <StatusTimeline currentIndex={getPNRStepIndexFromStatus(result?.data?.status)} />
                )}

                <dl className="result-card__grid">
                  <div className="result-card__row">
                    <dt>Tracking ID</dt>
                    <dd>{result.data.trackingId}</dd>
                  </div>
                  <div className="result-card__row">
                    <dt>Status</dt>
                    <dd>
                      {isPNRTrackingId(result?.data?.trackingId)
                        ? getPNRDisplayStatus(result.data.status)
                        : result.data.status}
                    </dd>
                  </div>
                  <div className="result-card__row">
                    <dt>Current Location</dt>
                    <dd>{result.data.currentLocation}</dd>
                  </div>

                  {!isPNRTrackingId(result?.data?.trackingId) && (
                    <>
                      <div className="result-card__row">
                        <dt>Recipient</dt>
                        <dd>{result.data.customerName}</dd>
                      </div>
                      <div className="result-card__row">
                        <dt>Phone</dt>
                        <dd>{result.data.customerPhone}</dd>
                      </div>
                    </>
                  )}
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
                                <dd>
                                  {isPNRTrackingId(shipment?.trackingId)
                                    ? getPNRDisplayStatus(shipment.status)
                                    : shipment.status || '—'}
                                </dd>
                              </div>

                              {isPNRTrackingId(shipment?.trackingId) && (
                                <div className="result-card__row">
                                  <dt>Order Progress</dt>
                                  <dd>
                                    <StatusTimeline currentIndex={getPNRStepIndexFromStatus(shipment?.status)} />
                                  </dd>
                                </div>
                              )}

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
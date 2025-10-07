import React, { useState } from 'react';
import api from '../api/axios';
import './ShipmentTracker.css';

const ShipmentTracker = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setResult(null);
    setLoading(true);
    try {
      const { data } = await api.get(`/shipment/${encodeURIComponent(query)}`);
      setResult(data);
    } catch (error) {
      setErr(error?.response?.data?.message || 'Shipment not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="track-page">
      <h2>Track Shipment</h2>
      <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          placeholder="Enter Tracking ID or MongoDB _id"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
          style={{ flex: 1, padding: 8 }}
        />
        <button disabled={loading} type="submit">{loading ? 'Searching…' : 'Search'}</button>
      </form>
      {err && <div style={{ background: '#fde8e8', color: '#c00', padding: 8, borderRadius: 4, marginTop: 12 }}>{err}</div>}
      {result && (
        <div style={{ marginTop: 16, padding: 12, border: '1px solid #ddd', borderRadius: 6 }}>
          <div><strong>Tracking ID:</strong> {result.trackingId}</div>
          <div><strong>Customer:</strong> {result.customerName} ({result.customerPhone})</div>
          <div><strong>Status:</strong> {result.status}</div>
          <div><strong>Current Location:</strong> {result.currentLocation}</div>
          {result.estimatedDelivery && (
            <div><strong>ETA:</strong> {new Date(result.estimatedDelivery).toLocaleDateString()}</div>
          )}
          <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
            Created: {result.createdAt ? new Date(result.createdAt).toLocaleString() : 'N/A'}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentTracker;

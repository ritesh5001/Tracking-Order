import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import NavBar from '../components/NavBar';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [createForm, setCreateForm] = useState({
    trackingId: '',
    customerName: '',
    customerPhone: '',
    currentLocation: 'Warehouse',
    status: 'Pending',
    estimatedDelivery: '',
  });
  const [updateForm, setUpdateForm] = useState({
    trackingId: '',
    currentLocation: '',
    status: 'Pending',
    estimatedDelivery: '',
  });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    try {
      const payload = { ...createForm };
      if (payload.estimatedDelivery) {
        payload.estimatedDelivery = new Date(payload.estimatedDelivery).toISOString();
      } else {
        delete payload.estimatedDelivery;
      }
      const { data } = await api.post('/admin/create-shipment', payload);
      setMsg(data?.message || 'Shipment created');
    } catch (error) {
      setErr(error?.response?.data?.message || 'Failed to create shipment');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    try {
      const { trackingId, ...rest } = updateForm;
      const payload = { ...rest };
      if (!trackingId) throw new Error('trackingId is required');
      if (!payload.currentLocation) delete payload.currentLocation;
      if (!payload.estimatedDelivery) delete payload.estimatedDelivery; else payload.estimatedDelivery = new Date(payload.estimatedDelivery).toISOString();
      const { data } = await api.put(`/admin/update-shipment/${encodeURIComponent(trackingId)}`, payload);
      setMsg(data?.message || 'Shipment updated');
    } catch (error) {
      setErr(error?.response?.data?.message || error.message || 'Failed to update shipment');
    }
  };

  return (
    <div className="page">
      <NavBar showAdminLink={false} />
      <div className="container">
        <div className="topbar">
          <h2 className="title">Admin Dashboard</h2>
          <div className="actions">
            <button className="btn btn--ghost" onClick={logout}>Logout</button>
          </div>
        </div>

        {(msg || err) && (
          <div className={`banner ${msg ? 'banner--ok' : ''} ${err ? 'banner--err' : ''}`}>
            {msg || err}
          </div>
        )}

        <div className="grid">
          <section className="card">
            <h3>Create Shipment</h3>
            <p>Register new orders, capture key customer information, and set an initial status.</p>
            <form onSubmit={handleCreate} className="form">
              <label className="field">
                <span className="label">Tracking ID</span>
                <input className="input" value={createForm.trackingId} onChange={(e) => setCreateForm({ ...createForm, trackingId: e.target.value })} required />
              </label>
              <label className="field">
                <span className="label">Customer Name</span>
                <input className="input" value={createForm.customerName} onChange={(e) => setCreateForm({ ...createForm, customerName: e.target.value })} required />
              </label>
              <label className="field">
                <span className="label">Customer Phone</span>
                <input className="input" value={createForm.customerPhone} onChange={(e) => setCreateForm({ ...createForm, customerPhone: e.target.value })} required />
              </label>
              <label className="field">
                <span className="label">Current Location</span>
                <input className="input" value={createForm.currentLocation} onChange={(e) => setCreateForm({ ...createForm, currentLocation: e.target.value })} />
              </label>
              <label className="field">
                <span className="label">Status</span>
                <select className="select" value={createForm.status} onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}>
                  {['Pending','Dispatched','In Transit','Out for Delivery','Delivered','Failed','Returned'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="field">
                <span className="label">Estimated Delivery</span>
                <input className="input" type="date" value={createForm.estimatedDelivery} onChange={(e) => setCreateForm({ ...createForm, estimatedDelivery: e.target.value })} />
              </label>
              <div className="row-end">
                <button className="btn btn--primary" type="submit">Create</button>
              </div>
            </form>
          </section>

          <section className="card">
            <h3>Update Shipment</h3>
            <p>Locate an existing shipment and update its location, status, or estimated delivery.</p>
            <form onSubmit={handleUpdate} className="form form--single">
              <label className="field">
                <span className="label">Tracking ID</span>
                <input className="input" value={updateForm.trackingId} onChange={(e) => setUpdateForm({ ...updateForm, trackingId: e.target.value })} required />
              </label>
              <label className="field">
                <span className="label">Current Location</span>
                <input className="input" value={updateForm.currentLocation} onChange={(e) => setUpdateForm({ ...updateForm, currentLocation: e.target.value })} />
              </label>
              <label className="field">
                <span className="label">Status</span>
                <select className="select" value={updateForm.status} onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}>
                  {['Pending','Dispatched','In Transit','Out for Delivery','Delivered','Failed','Returned'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="field">
                <span className="label">Estimated Delivery</span>
                <input className="input" type="date" value={updateForm.estimatedDelivery} onChange={(e) => setUpdateForm({ ...updateForm, estimatedDelivery: e.target.value })} />
              </label>
              <div className="row-end">
                <button className="btn btn--primary" type="submit">Update</button>
              </div>
            </form>
          </section>
        </div>
      </div>
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
    </div>
  );
};

export default Dashboard;
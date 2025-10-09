import React, { useEffect, useMemo, useState } from 'react';
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
  const [recent, setRecent] = useState({ loading: false, error: '', data: [], days: 5 });
  const [editingId, setEditingId] = useState('');
  const [editForm, setEditForm] = useState({ trackingId: '', currentLocation: '', status: 'Pending', estimatedDelivery: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState({}); // map of rowId => boolean
  const [locationEdits, setLocationEdits] = useState({}); // rowId => string
  const [locationSaving, setLocationSaving] = useState({}); // rowId => boolean

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

  // Fetch recent shipments for admin
  const fetchRecent = async (days = recent.days) => {
    setRecent((r) => ({ ...r, loading: true, error: '' }));
    try {
      const { data } = await api.get(`/admin/recent-shipments`, { params: { days } });
      setRecent({ loading: false, error: '', data: data?.shipments || [], days });
    } catch (error) {
      setRecent((r) => ({ ...r, loading: false, error: error?.response?.data?.message || 'Failed to load recent shipments' }));
    }
  };

  useEffect(() => {
    fetchRecent(5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusOptions = useMemo(() => ['Pending','Dispatched','In Transit','Out for Delivery','Delivered','Failed','Returned'], []);

  const fmtDateInput = (d) => {
    if (!d) return '';
    try {
      const iso = new Date(d).toISOString();
      return iso.slice(0, 10);
    } catch {
      return '';
    }
  };

  const startEdit = (s) => {
    const id = s._id || s.trackingId;
    setEditingId(id);
    setEditForm({
      trackingId: s.trackingId,
      currentLocation: s.currentLocation || '',
      status: s.status || 'Pending',
      estimatedDelivery: fmtDateInput(s.estimatedDelivery),
    });
  };

  const cancelEdit = () => {
    setEditingId('');
    setEditForm({ trackingId: '', currentLocation: '', status: 'Pending', estimatedDelivery: '' });
  };

  const rowIdOf = (s) => s._id || s.trackingId;
  const updateRowLocal = (rowId, patch) => {
    setRecent((r) => ({
      ...r,
      data: r.data.map((s) => (rowIdOf(s) === rowId ? { ...s, ...patch } : s)),
    }));
  };

  const changeStatus = async (s, newStatus) => {
    const rowId = rowIdOf(s);
    const prevStatus = s.status;
    // optimistic update
    updateRowLocal(rowId, { status: newStatus });
    setStatusSaving((m) => ({ ...m, [rowId]: true }));
    setMsg('');
    setErr('');
    try {
      const { data } = await api.put(`/admin/update-shipment/${encodeURIComponent(s.trackingId)}`, { status: newStatus });
      const updated = data?.updatedShipment;
      if (updated) updateRowLocal(rowId, updated);
      setMsg(data?.message || 'Status updated');
    } catch (error) {
      // revert
      updateRowLocal(rowId, { status: prevStatus });
      setErr(error?.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusSaving((m) => {
        const cp = { ...m };
        delete cp[rowId];
        return cp;
      });
    }
  };

  const setLocDraft = (rowId, v) => setLocationEdits((m) => ({ ...m, [rowId]: v }));
  const getLocDraft = (rowId, s) => (locationEdits[rowId] !== undefined ? locationEdits[rowId] : (s.currentLocation || ''));

  const updateLocation = async (s) => {
    const rowId = rowIdOf(s);
    const newLoc = (getLocDraft(rowId, s) || '').trim();
    const prevLoc = s.currentLocation || '';
    if (newLoc === prevLoc) return;
    // optimistic update
    updateRowLocal(rowId, { currentLocation: newLoc });
    setLocationSaving((m) => ({ ...m, [rowId]: true }));
    setMsg('');
    setErr('');
    try {
      const { data } = await api.put(`/admin/update-shipment/${encodeURIComponent(s.trackingId)}`, { currentLocation: newLoc });
      const updated = data?.updatedShipment;
      if (updated) updateRowLocal(rowId, updated);
      setMsg(data?.message || 'Location updated');
    } catch (error) {
      // revert
      updateRowLocal(rowId, { currentLocation: prevLoc });
      setErr(error?.response?.data?.message || 'Failed to update location');
    } finally {
      setLocationSaving((m) => {
        const cp = { ...m };
        delete cp[rowId];
        return cp;
      });
    }
  };

  const saveEdit = async () => {
    if (!editForm.trackingId) return;
    setEditSaving(true);
    setMsg('');
    setErr('');
    try {
      const payload = {
        currentLocation: editForm.currentLocation || undefined,
        status: editForm.status || undefined,
        estimatedDelivery: editForm.estimatedDelivery ? new Date(editForm.estimatedDelivery).toISOString() : undefined,
      };
      // remove undefineds
      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);
      const { data } = await api.put(`/admin/update-shipment/${encodeURIComponent(editForm.trackingId)}`, payload);
      const updated = data?.updatedShipment;
      // Update local recent list
      setRecent((r) => ({
        ...r,
        data: r.data.map((s) => {
          const keyA = s._id || s.trackingId;
          const keyB = updated?._id || updated?.trackingId;
          return keyA === keyB ? { ...s, ...updated } : s;
        }),
      }));
      setMsg(data?.message || 'Shipment updated');
      cancelEdit();
    } catch (error) {
      setErr(error?.response?.data?.message || 'Failed to update shipment');
    } finally {
      setEditSaving(false);
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

          <section className="card card--recent">
            <h3>Recent Shipments (Last {recent.days} days)</h3>
            <p>Newest first. Use this to quickly review recent activity.</p>
            <div className="row gap">
              <label className="field" style={{ maxWidth: 180 }}>
                <span className="label">Days</span>
                <select
                  className="select"
                  value={recent.days}
                  onChange={(e) => fetchRecent(parseInt(e.target.value, 10))}
                >
                  {[5, 7, 14, 30].map((d) => (
                    <option key={d} value={d}>{d} days</option>
                  ))}
                </select>
              </label>
              <button className="btn" onClick={() => fetchRecent(recent.days)} disabled={recent.loading}>
                {recent.loading ? 'Loading…' : 'Refresh'}
              </button>
            </div>
            {recent.error && <div className="banner banner--err" style={{ marginTop: 12 }}>{recent.error}</div>}
            <div className="table-wrap" style={{ overflowX: 'auto', marginTop: 12 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Created</th>
                    <th>Tracking ID</th>
                    <th>Status</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Current Location</th>
                    <th>ETA</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.data.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '12px 0' }}>
                        {recent.loading ? 'Loading…' : 'No shipments in this period'}
                      </td>
                    </tr>
                  ) : (
                    recent.data.map((s) => {
                      const rowId = s._id || s.trackingId;
                      const isEditing = editingId === rowId;
                      return (
                        <tr key={rowId}>
                          <td data-label="Created">{s.createdAt ? new Date(s.createdAt).toLocaleString() : '-'}</td>
                          <td data-label="Tracking ID">{s.trackingId}</td>
                          <td data-label="Status">
                            <select
                              className="select"
                              value={s.status}
                              disabled={!!statusSaving[rowId]}
                              onChange={(e) => changeStatus(s, e.target.value)}
                            >
                              {statusOptions.map((o) => (
                                <option key={o} value={o}>{o}</option>
                              ))}
                            </select>
                          </td>
                          <td data-label="Customer">{s.customerName}</td>
                          <td data-label="Phone">{s.customerPhone}</td>
                          <td data-label="Current Location">
                            {isEditing ? (
                              <input
                                className="input"
                                value={editForm.currentLocation}
                                onChange={(e) => setEditForm((f) => ({ ...f, currentLocation: e.target.value }))}
                              />
                            ) : (
                              <div className="row gap" style={{ alignItems: 'center' }}>
                                <input
                                  className="input"
                                  value={getLocDraft(rowId, s)}
                                  onChange={(e) => setLocDraft(rowId, e.target.value)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') updateLocation(s); }}
                                  placeholder="Current location"
                                  style={{ minWidth: 160 }}
                                />
                                <button
                                  className="btn"
                                  disabled={!!locationSaving[rowId] || (getLocDraft(rowId, s).trim() === (s.currentLocation || '').trim())}
                                  onClick={() => updateLocation(s)}
                                  type="button"
                                >
                                  {locationSaving[rowId] ? 'Saving…' : 'Update'}
                                </button>
                              </div>
                            )}
                          </td>
                          <td data-label="ETA">
                            {isEditing ? (
                              <input
                                className="input"
                                type="date"
                                value={editForm.estimatedDelivery}
                                onChange={(e) => setEditForm((f) => ({ ...f, estimatedDelivery: e.target.value }))}
                              />
                            ) : (
                              s.estimatedDelivery ? new Date(s.estimatedDelivery).toLocaleDateString() : '-'
                            )}
                          </td>
                          <td data-label="Actions">
                            {isEditing ? (
                              <div className="row gap">
                                <button className="btn btn--primary" disabled={editSaving} onClick={saveEdit}>
                                  {editSaving ? 'Saving…' : 'Save'}
                                </button>
                                <button className="btn btn--ghost" disabled={editSaving} onClick={cancelEdit}>
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button className="btn" onClick={() => startEdit(s)}>Edit</button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
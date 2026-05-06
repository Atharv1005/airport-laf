import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import BottomNav from '../components/BottomNav.jsx';
import { marker } from '../assets/icons.js';

const STATUSES   = ['ACTIVE', 'CLAIMED', 'EXPIRED', 'DISPOSED'];
const CATEGORIES = [
  'Electronics','Clothing','Bags & Luggage','Documents & IDs',
  'Jewellery & Accessories','Keys','Wallet & Purse','Books & Stationery',
  "Children's Items",'Food & Beverages','Sports Equipment','Umbrellas',
  'Eyewear','Medical Items','Other',
];
const LOCATIONS = [
  'Terminal 1 - Check-in','Terminal 1 - Security','Terminal 1 - Gate A',
  'Terminal 1 - Gate B','Terminal 1 - Arrival Hall','Terminal 1 - Baggage Claim',
  'Terminal 2 - Check-in','Terminal 2 - Security','Terminal 2 - Gate C',
  'Terminal 2 - Gate D','Terminal 2 - Arrival Hall','Terminal 2 - Baggage Claim',
  'Food Court','Duty Free Zone','Parking Area','Bus Bay','Prayer Room',
  'Lounge','Medical Center','Other',
];

const YELLOW_FILTER =
  'invert(84%) sepia(80%) saturate(900%) hue-rotate(2deg) brightness(103%) contrast(101%)';

function DetailRow({ label, children, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 0', borderBottom: '1px solid #1a1a1a' }}>
      <span style={{ color: '#444', fontSize: 13, fontFamily: 'Outfit,sans-serif' }}>{label}</span>
      {children ?? (
        <span style={{ color: '#fff', fontSize: 13, fontFamily: 'Outfit,sans-serif',
          textAlign: 'right', marginLeft: 16, maxWidth: '60%' }}>{value || '—'}</span>
      )}
    </div>
  );
}

export default function ItemDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [item, setItem]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEdit]   = useState(false);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm]       = useState({ category: '', location: '', notes: '' });

  useEffect(() => {
    itemsAPI.getOne(id)
      .then(r => {
        const i = r.data.item;
        setItem(i);
        setForm({ category: i.category, location: i.location, notes: i.notes || '' });
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleStatusUpdate = async status => {
    setSaving(true);
    try { const r = await itemsAPI.updateStatus(id, status); setItem(r.data.item); }
    catch (e) { setError(e.response?.data?.message || 'Failed to update status'); }
    setSaving(false);
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const fd = new FormData();
      fd.append('category', form.category);
      fd.append('location', form.location);
      fd.append('notes', form.notes);
      const r = await itemsAPI.update(id, fd);
      setItem(r.data.item);
      setEdit(false);
    } catch (e) { setError(e.response?.data?.message || 'Failed to update'); }
    setSaving(false);
  };

  if (loading) return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
      <div style={{ width: 32, height: 32, border: '2px solid #F5C300',
        borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
  if (!item) return null;

  const date = new Date(item.createdAt).toLocaleDateString('en-IN',
    { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const expiry = new Date(item.expiryDate).toLocaleDateString('en-IN',
    { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column',
      background: '#000', overflow: 'hidden' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ── Header ── */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12,
        padding: '48px 16px 16px', borderBottom: '1px solid #111' }}>
        <button onClick={() => navigate(-1)} style={{ color: '#555', fontSize: 26,
          padding: 4, marginLeft: -4, background: 'none', border: 'none', cursor: 'pointer',
          outline: 'none', WebkitTapHighlightColor: 'transparent' }}>‹</button>
        <div style={{ flex: 1 }}>
          <p className="item-id">{item.itemId}</p>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#fff', fontFamily: 'Outfit,sans-serif' }}>
            {item.category}
          </h1>
        </div>
        <StatusBadge status={item.status} />
      </div>

      {/* ── Scrollable body – no scrollbar ── */}
      <div style={{
        flex: 1, overflowY: 'auto', paddingBottom: 88,
        scrollbarWidth: 'none', msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
      }}>
        {item.imageUrl && (
          <img src={item.imageUrl} alt={item.category}
            style={{ width: '100%', height: 208, objectFit: 'cover' }} />
        )}

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Status grid */}
          <div className="card">
            <p style={{ color: '#333', fontSize: 11, fontFamily: 'Outfit,sans-serif',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Update Status</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {STATUSES.map(s => (
                <button key={s} onClick={() => handleStatusUpdate(s)}
                  disabled={saving || item.status === s}
                  style={{
                    padding: '10px 0', borderRadius: 12, fontSize: 13,
                    fontWeight: 600, fontFamily: 'Outfit,sans-serif', cursor: 'pointer',
                    transition: 'all 0.15s',
                    background: item.status === s ? '#F5C300' : '#1a1a1a',
                    color:      item.status === s ? '#000'    : '#555',
                    border:     item.status === s ? 'none'    : '1px solid #222',
                    opacity: saving ? 0.5 : 1,
                    outline: 'none', WebkitTapHighlightColor: 'transparent',
                  }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Details / Edit */}
          {editMode ? (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ color: '#333', fontSize: 11, fontFamily: 'Outfit,sans-serif',
                textTransform: 'uppercase', letterSpacing: '0.08em' }}>Edit Details</p>
              <div>
                <label className="field-label">Category</label>
                <select className="field-select" value={form.category}
                  onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Location</label>
                <select className="field-select" value={form.location}
                  onChange={e => set('location', e.target.value)}>
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Notes</label>
                <textarea className="field-input" rows={3} style={{ resize: 'none' }}
                  value={form.notes} onChange={e => set('notes', e.target.value)} maxLength={500} />
              </div>
              {error && <p style={{ color: '#EF4444', fontSize: 13, fontFamily: 'Outfit,sans-serif' }}>{error}</p>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setEdit(false)}>Cancel</button>
                <button className="btn-primary"   style={{ flex: 1 }} onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <p style={{ color: '#333', fontSize: 11, fontFamily: 'Outfit,sans-serif',
                  textTransform: 'uppercase', letterSpacing: '0.08em' }}>Item Details</p>
                <button onClick={() => setEdit(true)} style={{ color: '#F5C300', fontSize: 13,
                  fontFamily: 'Outfit,sans-serif', fontWeight: 600, background: 'none',
                  border: 'none', cursor: 'pointer', outline: 'none',
                  WebkitTapHighlightColor: 'transparent' }}>Edit</button>
              </div>

              <DetailRow label="Category" value={item.category} />

              {/* Location with icon */}
              <DetailRow label="Location">
                <span style={{ display: 'flex', alignItems: 'center', gap: 5,
                  color: '#fff', fontSize: 13, fontFamily: 'Outfit,sans-serif', textAlign: 'right' }}>
                  <img src={marker} alt="" style={{ width: 13, height: 13,
                    objectFit: 'contain', filter: 'none' }} />
                  {item.location}
                </span>
              </DetailRow>

              <DetailRow label="Quantity" value={item.quantity} />

              {/* Found By – highlighted & clickable, NO underline, NO role brackets */}
              <DetailRow label="Found By">
                <button
                  onClick={() => navigate(`/user/${item.foundBy?._id}`)}
                  style={{
                    color: '#F5C300',
                    fontSize: 13,
                    fontFamily: 'Outfit,sans-serif',
                    fontWeight: 600,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'none',   /* ← no underline */
                    outline: 'none',
                    WebkitTapHighlightColor: 'transparent',
                    padding: 0,
                  }}
                >
                  {item.foundBy?.name}
                </button>
              </DetailRow>

              <DetailRow label="Found On"     value={date}   />
              <DetailRow label="Expiry Date"  value={expiry} />
              {item.status === 'ACTIVE' && (
                <DetailRow label="Days Remaining" value={`${item.daysRemaining} days`} />
              )}
              {item.notes && <DetailRow label="Notes" value={item.notes} />}
            </div>
          )}

          {error && !editMode && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 12, padding: '12px 16px' }}>
              <p style={{ color: '#EF4444', fontSize: 13, fontFamily: 'Outfit,sans-serif' }}>{error}</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

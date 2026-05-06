import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api.js';
import BottomNav from '../components/BottomNav.jsx';
import { camera, gallery } from '../assets/icons.js';

const CATEGORIES = [
  'Electronics', 'Clothing', 'Bags & Luggage', 'Documents & IDs',
  'Jewellery & Accessories', 'Keys', 'Wallet & Purse', 'Books & Stationery',
  "Children's Items", 'Food & Beverages', 'Sports Equipment', 'Umbrellas',
  'Eyewear', 'Medical Items', 'Other',
];
const LOCATIONS = [
  'Terminal 1 - Check-in', 'Terminal 1 - Security', 'Terminal 1 - Gate A',
  'Terminal 1 - Gate B', 'Terminal 1 - Arrival Hall', 'Terminal 1 - Baggage Claim',
  'Terminal 2 - Check-in', 'Terminal 2 - Security', 'Terminal 2 - Gate C',
  'Terminal 2 - Gate D', 'Terminal 2 - Arrival Hall', 'Terminal 2 - Baggage Claim',
  'Food Court', 'Duty Free Zone', 'Parking Area', 'Bus Bay', 'Prayer Room',
  'Lounge', 'Medical Center', 'Other',
];

const YELLOW_FILTER =
  'invert(84%) sepia(80%) saturate(900%) hue-rotate(2deg) brightness(103%) contrast(101%)';

function isNative() {
  try { return window?.Capacitor?.isNativePlatform?.() === true; } catch { return false; }
}

export default function AddItem() {
  const navigate      = useNavigate();
  const cameraRef     = useRef(null);
  const galleryRef    = useRef(null);

  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [imageFile, setImageFile]   = useState(null);
  const [imagePreview, setImgPrev]  = useState(null);
  const [aiLoading, setAiLoading]   = useState(false);
  const [form, setForm]             = useState({ category: '', location: '', quantity: '1', notes: '' });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const processFile = (file) => {
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImgPrev(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleCamera = async () => {
    if (isNative()) {
      try {
        const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
        const photo = await Camera.getPhoto({
          quality: 80, allowEditing: false,
          resultType: CameraResultType.DataUrl, source: CameraSource.Camera,
        });
        setImgPrev(photo.dataUrl);
        const res = await fetch(photo.dataUrl);
        setImageFile(new File([await res.blob()], 'photo.jpg', { type: 'image/jpeg' }));
      } catch { /* user cancelled */ }
    } else {
      cameraRef.current?.click();
    }
  };

  const handleGallery = async () => {
    if (isNative()) {
      try {
        const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
        const photo = await Camera.getPhoto({
          quality: 80, allowEditing: false,
          resultType: CameraResultType.DataUrl, source: CameraSource.Photos,
        });
        setImgPrev(photo.dataUrl);
        const res = await fetch(photo.dataUrl);
        setImageFile(new File([await res.blob()], 'photo.jpg', { type: 'image/jpeg' }));
      } catch { /* user cancelled */ }
    } else {
      galleryRef.current?.click();
    }
  };

  const handleSubmit = async () => {
    if (!form.category) return setError('Please select a category');
    if (!form.location)  return setError('Please select a location');
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('category', form.category);
      fd.append('location', form.location);
      fd.append('quantity', form.quantity || '1');
      if (form.notes) fd.append('notes', form.notes);
      if (imageFile)  fd.append('image', imageFile);
      const res = await itemsAPI.create(fd);
      navigate(`/items/${res.data.item._id}`);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save item');
    } finally { setLoading(false); }
  };

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
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#fff', fontFamily: 'Outfit,sans-serif', lineHeight: 1.2 }}>
            Register Lost Item
          </h1>
          <p style={{ color: '#3a3a3a', fontSize: 12, fontFamily: 'Outfit,sans-serif' }}>Fill in the item details</p>
        </div>
      </div>

      {/* ── Scrollable body – no scrollbar ── */}
      <div style={{
        flex: 1, padding: '0 16px', overflowY: 'auto',
        scrollbarWidth: 'none', msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
      }}>
        <div style={{ paddingTop: 20, paddingBottom: 100, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Photo */}
          <div>
            <label className="field-label">Photo (Optional)</label>
            {imagePreview ? (
              <div style={{ position: 'relative' }}>
                <img src={imagePreview} alt="Preview"
                  style={{ width: '100%', height: 176, objectFit: 'cover', borderRadius: 16 }} />
                <button
                  onClick={() => { setImgPrev(null); setImageFile(null); }}
                  style={{
                    position: 'absolute', top: 8, right: 8,
                    background: 'rgba(0,0,0,0.75)', color: '#fff',
                    borderRadius: '50%', width: 30, height: 30,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, border: 'none', cursor: 'pointer',
                    outline: 'none', WebkitTapHighlightColor: 'transparent',
                  }}>✕</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 12 }}>
                {/* Camera button */}
                <button onClick={handleCamera} style={{
                  flex: 1, background: '#111', border: '1px solid #1C1C1C',
                  borderRadius: 16, paddingTop: 20, paddingBottom: 20,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  cursor: 'pointer', outline: 'none', WebkitTapHighlightColor: 'transparent',
                }}>
                  <img src={camera} alt="Camera" style={{ width: 28, height: 28,
                    objectFit: 'contain', filter: 'none' }} />
                  <span style={{ color: '#555', fontSize: 12, fontFamily: 'Outfit,sans-serif' }}>Camera</span>
                </button>

                {/* Gallery button */}
                <button onClick={handleGallery} style={{
                  flex: 1, background: '#111', border: '1px solid #1C1C1C',
                  borderRadius: 16, paddingTop: 20, paddingBottom: 20,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  cursor: 'pointer', outline: 'none', WebkitTapHighlightColor: 'transparent',
                }}>
                  <img src={gallery} alt="Gallery" style={{ width: 28, height: 28,
                    objectFit: 'contain', filter: 'none' }} />
                  <span style={{ color: '#555', fontSize: 12, fontFamily: 'Outfit,sans-serif' }}>Gallery</span>
                </button>
              </div>
            )}

            {/* Hidden file inputs – web only */}
            <input ref={cameraRef}  type="file" accept="image/*" capture="environment"
              style={{ display: 'none' }} onChange={e => { processFile(e.target.files[0]); e.target.value = ''; }} />
            <input ref={galleryRef} type="file" accept="image/*"
              style={{ display: 'none' }} onChange={e => { processFile(e.target.files[0]); e.target.value = ''; }} />

            {aiLoading && (
              <p style={{ color: '#F5C300', fontSize: 12, fontFamily: 'Outfit,sans-serif',
                marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 12, border: '1.5px solid #F5C300',
                  borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block',
                  animation: 'spin 0.7s linear infinite' }} />
                AI analysing image...
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="field-label">Category *</label>
            <select className="field-select" value={form.category} onChange={e => set('category', e.target.value)}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="field-label">Found Location *</label>
            <select className="field-select" value={form.location} onChange={e => set('location', e.target.value)}>
              <option value="">Select location</option>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="field-label">Quantity</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button style={{ width: 48, height: 48, background: '#111', border: '1px solid #1C1C1C',
                borderRadius: 14, fontSize: 22, color: '#fff', display: 'flex',
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                outline: 'none', WebkitTapHighlightColor: 'transparent' }}
                onClick={() => set('quantity', String(Math.max(1, parseInt(form.quantity) - 1)))}>−</button>
              <div style={{ flex: 1, textAlign: 'center', fontSize: 24, fontWeight: 700,
                color: '#fff', fontFamily: 'JetBrains Mono,monospace' }}>{form.quantity}</div>
              <button style={{ width: 48, height: 48, background: '#111', border: '1px solid #1C1C1C',
                borderRadius: 14, fontSize: 22, color: '#fff', display: 'flex',
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                outline: 'none', WebkitTapHighlightColor: 'transparent' }}
                onClick={() => set('quantity', String(Math.min(999, parseInt(form.quantity) + 1)))}>+</button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="field-label">Notes (Optional)</label>
            <textarea className="field-input" rows={3} style={{ resize: 'none' }}
              placeholder="Describe the item – colour, brand, condition..."
              value={form.notes} onChange={e => set('notes', e.target.value)} maxLength={500} />
            <p style={{ textAlign: 'right', color: '#2a2a2a', fontSize: 11,
              fontFamily: 'Outfit,sans-serif', marginTop: 4 }}>{form.notes.length}/500</p>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 12, padding: '12px 16px' }}>
              <p style={{ color: '#EF4444', fontSize: 14, fontFamily: 'Outfit,sans-serif' }}>{error}</p>
            </div>
          )}

          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading
              ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ width: 16, height: 16, border: '2px solid #000',
                    borderTopColor: 'transparent', borderRadius: '50%',
                    display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                  Saving...
                </span>
              : '✓ Register Item'
            }
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

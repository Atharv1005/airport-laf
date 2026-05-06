import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import BottomNav from '../components/BottomNav.jsx';
import { checked } from '../assets/icons.js';

const YELLOW_FILTER =
  'invert(84%) sepia(80%) saturate(900%) hue-rotate(2deg) brightness(103%) contrast(101%)';

const DESIG_BG   = { 'CISF':'rgba(34,197,94,0.1)', 'Airline Personnel':'rgba(59,130,246,0.1)', 'Terminal Manager':'rgba(168,85,247,0.1)', 'Admin':'rgba(245,195,0,0.1)' };
const DESIG_TEXT = { 'CISF':'#22C55E',             'Airline Personnel':'#3B82F6',              'Terminal Manager':'#A855F7',              'Admin':'#F5C300' };

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const picRef           = useRef(null);
  const [profilePic, setProfilePic] = useState(() => localStorage.getItem('laf_profile_pic') || null);

  const handleLogout  = () => { logout(); navigate('/login', { replace: true }); };
  const handlePicClick = () => picRef.current?.click();
  const handlePicChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setProfilePic(ev.target.result);
      localStorage.setItem('laf_profile_pic', ev.target.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (!user) return null;

  const initials  = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const joinDate  = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'N/A';
  const shortId   = user._id?.slice(-8).toUpperCase();
  const isAdmin   = user.role === 'admin';
  const dBg       = DESIG_BG[user.designation]   || 'rgba(255,255,255,0.05)';
  const dText     = DESIG_TEXT[user.designation] || '#aaa';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column',
      background: '#000', overflow: 'hidden' }}>

      {/* ── Header ── */}
      <div style={{ flexShrink: 0, padding: '48px 16px 16px', borderBottom: '1px solid #111' }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff', fontFamily: 'Outfit,sans-serif' }}>Profile</h1>
      </div>

      {/* ── Scrollable body – no scrollbar ── */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '0 16px 96px',
        scrollbarWidth: 'none', msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
      }}>
        <div style={{ paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', paddingBottom: 8 }}>
            {/* Tapping the avatar opens the gallery – no separate "edit" text */}
            <button onClick={handlePicClick} style={{
              width: 84, height: 84, borderRadius: 24,
              background: profilePic ? 'transparent' : 'rgba(245,195,0,0.07)',
              border: '2px solid rgba(245,195,0,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16, cursor: 'pointer', overflow: 'hidden', position: 'relative',
              outline: 'none', WebkitTapHighlightColor: 'transparent',
            }}>
              {profilePic
                ? <img src={profilePic} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: 30, fontWeight: 700, color: '#F5C300', fontFamily: 'Outfit,sans-serif' }}>
                    {initials}
                  </span>
              }
              {/* { //Subtle camera hint at the bottom of avatar
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                background: 'rgba(0,0,0,0.55)', paddingBottom: 4, paddingTop: 3,
                fontSize: 9, color: 'rgba(245,195,0,0.8)', fontFamily: 'Outfit,sans-serif',
                letterSpacing: '0.04em',
              }}>tap to change</div> } */}
            </button>
            <input ref={picRef} type="file" accept="image/*"
              style={{ display: 'none' }} onChange={handlePicChange} />

            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: 'Outfit,sans-serif' }}>{user.name}</h2>
            <p style={{ color: '#444', fontSize: 13, fontFamily: 'Outfit,sans-serif', marginTop: 2 }}>{user.email}</p>

            <div style={{
              marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 14px', borderRadius: 20,
              background: dBg, color: dText,
              fontSize: 12, fontFamily: 'Outfit,sans-serif', fontWeight: 500,
            }}>
              {isAdmin && <span>🛡️</span>}
              {user.designation}
            </div>
          </div>

          {/* Info card */}
          <div className="card" style={{ borderColor: '#1a1a1a' }}>
            <InfoRow label="User ID"     value={`#${shortId}`} mono />
            <InfoRow label="Role"        value={isAdmin ? 'Administrator' : 'Staff'} />
            <InfoRow label="Designation" value={user.designation} />
            <InfoRow label="Status"      value="Approved ✓" highlight />
            {user.createdAt && <InfoRow label="Joined" value={joinDate} last />}
          </div>

          {/* Admin: pending approvals shortcut – uses checked.png */}
          {isAdmin && (
            <button onClick={() => navigate('/admin/approvals')}
              style={{
                width: '100%', background: '#111', border: '1px solid #1a1a1a',
                borderRadius: 16, padding: '14px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer', outline: 'none', WebkitTapHighlightColor: 'transparent',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src={checked} alt="approvals" style={{ width: 22, height: 22,
                  objectFit: 'contain', filter: 'none' }} />
                <span style={{ color: '#fff', fontFamily: 'Outfit,sans-serif', fontWeight: 500 }}>
                  Pending Approvals
                </span>
              </div>
              <span style={{ color: '#2a2a2a', fontSize: 18 }}>›</span>
            </button>
          )}

          <button className="btn-danger" onClick={handleLogout}>Sign Out</button>

          <p style={{ textAlign: 'center', color: '#1e1e1e', fontSize: 11,
            fontFamily: 'Outfit,sans-serif', paddingBottom: 8 }}>
            Lost &amp; Found · Internal Use Only
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function InfoRow({ label, value, mono, highlight, last }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 0', borderBottom: last ? 'none' : '1px solid #1a1a1a',
    }}>
      <span style={{ color: '#444', fontSize: 13, fontFamily: 'Outfit,sans-serif' }}>{label}</span>
      <span style={{
        fontSize: 13, textAlign: 'right',
        fontFamily: mono ? 'JetBrains Mono,monospace' : 'Outfit,sans-serif',
        color: highlight ? '#22C55E' : mono ? '#F5C300' : '#fff',
      }}>{value}</span>
    </div>
  );
}

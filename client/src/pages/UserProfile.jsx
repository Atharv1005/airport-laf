/**
 * UserProfile – view another user's profile (read-only).
 * No logout button, no edit option.
 * Navigated to from ItemDetail via "Found By" tap.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api.js';

const DESIG_COLORS = {
  'CISF':               'rgba(34,197,94,0.12)',
  'Airline Personnel':  'rgba(59,130,246,0.12)',
  'Terminal Manager':   'rgba(168,85,247,0.12)',
  'Admin':              'rgba(245,195,0,0.12)',
};
const DESIG_TEXT = {
  'CISF':               '#22C55E',
  'Airline Personnel':  '#3B82F6',
  'Terminal Manager':   '#A855F7',
  'Admin':              '#F5C300',
};

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    authAPI.getUserById(userId)
      .then(res => setUser(res.data.user))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
      <div style={{ width: 28, height: 28, border: '2px solid #F5C300',
        borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (notFound || !user) return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: '#000', gap: 12 }}>
      <span style={{ fontSize: 48 }}>👤</span>
      <p style={{ color: '#555', fontFamily: 'Outfit,sans-serif' }}>User not found</p>
      <button onClick={() => navigate(-1)}
        style={{ color: '#F5C300', fontFamily: 'Outfit,sans-serif', background: 'none', border: 'none', cursor: 'pointer' }}>
        ← Go back
      </button>
    </div>
  );

  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'N/A';
  const shortId = user._id?.slice(-8).toUpperCase();
  const isAdmin = user.role === 'admin';
  const desigBg   = DESIG_COLORS[user.designation] || 'rgba(255,255,255,0.05)';
  const desigText = DESIG_TEXT[user.designation]   || '#aaa';

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000' }}>
      {/* Header */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12,
        padding: '48px 16px 16px', borderBottom: '1px solid #111' }}>
        <button onClick={() => navigate(-1)}
          style={{ color: '#666', fontSize: 26, padding: 4, marginLeft: -4,
            background: 'none', border: 'none', cursor: 'pointer' }}>‹</button>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#fff', fontFamily: 'Outfit,sans-serif' }}>
          Staff Profile
        </h1>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 32px' }}>
        <div style={{ paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}
          className="fade-up">

          {/* Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', paddingBottom: 8 }}>
            <div style={{
              width: 84, height: 84, borderRadius: 24,
              background: 'rgba(245,195,0,0.08)',
              border: '2px solid rgba(245,195,0,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}>
              <span style={{ fontSize: 30, fontWeight: 700, color: '#F5C300', fontFamily: 'Outfit,sans-serif' }}>
                {initials}
              </span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: 'Outfit,sans-serif' }}>
              {user.name}
            </h2>
            <p style={{ color: '#555', fontSize: 13, fontFamily: 'Outfit,sans-serif', marginTop: 2 }}>
              {user.email}
            </p>
            <div style={{
              marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 14px', borderRadius: 20,
              background: desigBg, color: desigText,
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
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono, highlight, last }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 0', borderBottom: last ? 'none' : '1px solid #1a1a1a',
    }}>
      <span style={{ color: '#555', fontSize: 13, fontFamily: 'Outfit,sans-serif' }}>{label}</span>
      <span style={{
        fontSize: 13, textAlign: 'right',
        fontFamily: mono ? 'JetBrains Mono,monospace' : 'Outfit,sans-serif',
        color: highlight ? '#22C55E' : mono ? '#F5C300' : '#fff',
      }}>{value}</span>
    </div>
  );
}

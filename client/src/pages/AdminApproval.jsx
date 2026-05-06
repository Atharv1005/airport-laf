import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api.js';
import BottomNav from '../components/BottomNav.jsx';
import { checked } from '../assets/icons.js';

export default function AdminApproval() {
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    authAPI.getPendingUsers()
      .then(res => setPendingUsers(res.data.users))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (userId, action) => {
    setActionLoading(p => ({ ...p, [userId]: action }));
    try {
      await authAPI.approveUser(userId, action);
      setPendingUsers(prev => prev.filter(u => u._id !== userId));
    } catch (e) {
      alert(e.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(p => ({ ...p, [userId]: null }));
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000' }}>
      {/* Header */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12,
        padding: '48px 16px 16px', borderBottom: '1px solid #111' }}>
        <button onClick={() => navigate(-1)}
          style={{ color: '#666', fontSize: 26, padding: 4, marginLeft: -4,
            background: 'none', border: 'none', cursor: 'pointer' }}>‹</button>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#fff', fontFamily: 'Outfit,sans-serif' }}>
            Pending Approvals
          </h1>
          <p style={{ color: '#444', fontSize: 12, fontFamily: 'Outfit,sans-serif' }}>
            {pendingUsers.length} user{pendingUsers.length !== 1 ? 's' : ''} awaiting
          </p>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 96px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 16 }}>
            {[1, 2].map(i => (
              <div key={i} className="card">
                <div className="skeleton" style={{ height: 16, width: 128, marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 12, width: 200, marginBottom: 16 }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <div className="skeleton" style={{ height: 44, flex: 1, borderRadius: 12 }} />
                  <div className="skeleton" style={{ height: 44, flex: 1, borderRadius: 12 }} />
                </div>
              </div>
            ))}
          </div>
        ) : pendingUsers.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', paddingTop: 80, textAlign: 'center' }}>
            <img src={checked} alt="done" style={{ width: 52, height: 52, objectFit: 'contain',
              filter: 'none',
              marginBottom: 16 }} />
            <p style={{ color: '#555', fontFamily: 'Outfit,sans-serif', fontWeight: 500 }}>All caught up!</p>
            <p style={{ color: '#333', fontSize: 13, fontFamily: 'Outfit,sans-serif', marginTop: 4 }}>
              No pending approvals
            </p>
          </div>
        ) : (
          <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pendingUsers.map(u => (
              <div key={u._id} className="card fade-up">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: 'rgba(245,195,0,0.08)', border: '1px solid rgba(245,195,0,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#F5C300', fontFamily: 'Outfit,sans-serif' }}>
                      {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#fff', fontWeight: 600, fontFamily: 'Outfit,sans-serif' }}>{u.name}</p>
                    <p style={{ color: '#444', fontSize: 12, fontFamily: 'Outfit,sans-serif',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                    <p style={{ color: '#333', fontSize: 12, fontFamily: 'Outfit,sans-serif', marginTop: 2 }}>
                      {u.designation}
                    </p>
                  </div>
                  <p style={{ color: '#333', fontSize: 12, fontFamily: 'Outfit,sans-serif', flexShrink: 0 }}>
                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleAction(u._id, 'reject')}
                    disabled={!!actionLoading[u._id]}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 12, fontSize: 13,
                      fontWeight: 600, fontFamily: 'Outfit,sans-serif', cursor: 'pointer',
                      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                      color: '#EF4444', opacity: actionLoading[u._id] ? 0.5 : 1,
                    }}>
                    {actionLoading[u._id] === 'reject' ? '...' : '✕ Reject'}
                  </button>
                  <button
                    onClick={() => handleAction(u._id, 'approve')}
                    disabled={!!actionLoading[u._id]}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 12, fontSize: 13,
                      fontWeight: 600, fontFamily: 'Outfit,sans-serif', cursor: 'pointer',
                      background: '#F5C300', border: 'none', color: '#000',
                      opacity: actionLoading[u._id] ? 0.5 : 1,
                    }}>
                    {actionLoading[u._id] === 'approve' ? '...' : '✓ Approve'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

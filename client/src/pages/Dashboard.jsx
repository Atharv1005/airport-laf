import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { itemsAPI } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.jsx';
import BottomNav from '../components/BottomNav.jsx';
import ItemCard from '../components/ItemCard.jsx';
import { logo } from '../assets/icons.js';

const STATUSES = ['ALL', 'ACTIVE', 'CLAIMED', 'EXPIRED', 'DISPOSED'];

const YELLOW_FILTER =
  'invert(84%) sepia(80%) saturate(900%) hue-rotate(2deg) brightness(103%) contrast(101%)';

function StatCard({ label, value, color }) {
  return (
    <div style={{ flex: 1, background: '#111', border: '1px solid #1C1C1C',
      borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
      <p style={{ fontSize: 20, fontWeight: 700, fontFamily: 'JetBrains Mono,monospace', color }}>{value ?? '—'}</p>
      <p style={{ color: '#3a3a3a', fontSize: 10, fontFamily: 'Outfit,sans-serif',
        textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [items, setItems]         = useState([]);
  const [stats, setStats]         = useState(null);
  const [filter, setFilter]       = useState('ALL');
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [hasMore, setHasMore]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchStats = async () => {
    try { const r = await itemsAPI.getStats(); setStats(r.data.stats); } catch {}
  };

  const fetchItems = useCallback(async (status, p = 1, append = false) => {
    p === 1 ? setLoading(true) : setLoadingMore(true);
    try {
      const params = { page: p, limit: 20 };
      if (status !== 'ALL') params.status = status;
      const r = await itemsAPI.getAll(params);
      const { items: next, pagination } = r.data;
      setItems(prev => append ? [...prev, ...next] : next);
      setHasMore(p < pagination.pages);
      setPage(p);
    } catch {}
    setLoading(false);
    setLoadingMore(false);
  }, []);

  useEffect(() => { fetchStats(); fetchItems(filter); }, [filter, fetchItems]);

  const handleScroll = e => {
    const el = e.target;
    if (!hasMore || loadingMore) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 80)
      fetchItems(filter, page + 1, true);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column',
      background: '#000', overflow: 'hidden' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* ── Header ── */}
      <div style={{ flexShrink: 0, padding: '44px 16px 14px',
        background: '#000', borderBottom: '1px solid #111' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Logo slightly larger than heading (22px text → 26px logo) */}
            <img src={logo} alt="logo" style={{ width: 70, height: 70,
              objectFit: 'contain', filter: 'none' }} />
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff',
                fontFamily: 'Outfit,sans-serif', lineHeight: 1.1 }}>Lost &amp; Found</h1>
              <p style={{ color: '#3a3a3a', fontSize: 11, fontFamily: 'Outfit,sans-serif' }}>
                {user?.designation}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/add')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#F5C300', color: '#000', fontWeight: 700,
              fontSize: 14, padding: '10px 16px', borderRadius: 12,
              fontFamily: 'Outfit,sans-serif', border: 'none', cursor: 'pointer',
              outline: 'none', WebkitTapHighlightColor: 'transparent',
            }}>
            + Add Item
          </button>
        </div>

        {stats && (
          <div style={{ display: 'flex', gap: 8 }}>
            <StatCard label="Active"   value={stats.active}   color="#22C55E" />
            <StatCard label="Claimed"  value={stats.claimed}  color="#3B82F6" />
            <StatCard label="Expired"  value={stats.expired}  color="#EF4444" />
            <StatCard label="Disposed" value={stats.disposed} color="#444"    />
          </div>
        )}
      </div>

      {/* ── Filter tabs ── */}
      <div style={{ flexShrink: 0, display: 'flex', gap: 8, padding: '10px 16px',
        background: '#000', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {STATUSES.map(s => (
          <button key={s} onClick={() => { setFilter(s); setItems([]); }}
            style={{
              flexShrink: 0, padding: '6px 14px', borderRadius: 20, fontSize: 12,
              fontWeight: 500, fontFamily: 'Outfit,sans-serif', cursor: 'pointer',
              transition: 'all 0.15s',
              background: filter === s ? '#F5C300' : '#111',
              color:      filter === s ? '#000'    : '#555',
              border:     filter === s ? 'none'    : '1px solid #1C1C1C',
              outline: 'none', WebkitTapHighlightColor: 'transparent',
            }}>
            {s === 'ALL' ? 'All Items' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* ── List ── */}
      <div
        style={{
          flex: 1, padding: '0 16px 88px', overflowY: 'auto',
          scrollbarWidth: 'none', msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
        onScroll={handleScroll}
      >
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card" style={{ display: 'flex', gap: 12 }}>
                <div className="skeleton" style={{ width: 56, height: 56, borderRadius: 12, flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
                  <div className="skeleton" style={{ height: 12, width: 112 }} />
                  <div className="skeleton" style={{ height: 16, width: 160 }} />
                  <div className="skeleton" style={{ height: 12, width: 128 }} />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', paddingTop: 80, textAlign: 'center' }}>
            <span style={{ fontSize: 48, marginBottom: 12 }}>📭</span>
            <p style={{ color: '#444', fontFamily: 'Outfit,sans-serif', fontWeight: 500 }}>No items found</p>
            <p style={{ color: '#2a2a2a', fontSize: 13, fontFamily: 'Outfit,sans-serif', marginTop: 4 }}>
              {filter !== 'ALL' ? 'Try a different filter' : 'Add the first item'}
            </p>
          </div>
        ) : (
          <div style={{ paddingTop: 8 }}>
            {items.map(item => <ItemCard key={item._id} item={item} />)}
            {loadingMore && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
                <div style={{ width: 20, height: 20, border: '2px solid #F5C300',
                  borderTopColor: 'transparent', borderRadius: '50%',
                  animation: 'spin 0.7s linear infinite' }} />
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

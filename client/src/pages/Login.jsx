import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { authAPI } from '../services/api.js';
import { logo } from '../assets/icons.js';

const DESIGNATIONS = ['CISF', 'Airline Personnel', 'Terminal Manager', 'Admin'];

// Converts logo PNG → #F5C300
const YELLOW_FILTER =
  'invert(84%) sepia(80%) saturate(900%) hue-rotate(2deg) brightness(103%) contrast(101%)';

export default function Login() {
  const { login } = useAuth();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [form, setForm]     = useState({ name: '', email: '', password: '', designation: 'CISF' });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleLogin = async () => {
    if (!form.email || !form.password) return setError('Enter email and password');
    setLoading(true); setError('');
    try   { await login(form.email, form.password); }
    catch (e) { setError(e.response?.data?.message || 'Login failed'); }
    finally   { setLoading(false); }
  };

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.password) return setError('All fields required');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true); setError('');
    try {
      await authAPI.signup({ name: form.name, email: form.email, password: form.password, designation: form.designation });
      setMode('pending');
    } catch (e) { setError(e.response?.data?.message || 'Signup failed'); }
    finally     { setLoading(false); }
  };

  if (mode === 'pending') {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 24, background: '#000' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'rgba(245,195,0,0.08)', border: '1.5px solid rgba(245,195,0,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
          }}>
            <span style={{ fontSize: 32 }}>⏳</span>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', fontFamily: 'Outfit,sans-serif', marginBottom: 8 }}>
            Awaiting Approval
          </h2>
          <p style={{ color: '#555', fontFamily: 'Outfit,sans-serif', fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>
            Your account has been created. An admin must approve it before you can log in.
          </p>
          <button className="btn-secondary" style={{ maxWidth: 200, margin: '0 auto' }}
            onClick={() => setMode('login')}>Back to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000', overflow: 'hidden' }}>

      {/* ── Header ── */}
      <div style={{ flexShrink: 0, padding: '56px 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          {/* Logo – slightly larger than the heading text (36px vs 30px font-size) */}
          <img
            src={logo}
            alt="logo"
            style={{ width: 90, height: 90, objectFit: 'contain', filter: 'none' }}
          />
          <h1 style={{
            fontSize: 30, fontWeight: 800, color: '#fff',
            fontFamily: 'Outfit,sans-serif', lineHeight: 1,
          }}>
            Lost &amp; Found
          </h1>
        </div>
      </div>

      {/* ── Toggle ── */}
      <div style={{ flexShrink: 0, padding: '0 24px 20px' }}>
        <div style={{ display: 'flex', background: '#111', borderRadius: 12,
          padding: 4, border: '1px solid #1e1e1e' }}>
          {['login', 'signup'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 9, fontSize: 14,
                fontWeight: 600, fontFamily: 'Outfit,sans-serif', transition: 'all 0.15s',
                background: mode === m ? '#F5C300' : 'transparent',
                color: mode === m ? '#000' : '#555',
                border: 'none', cursor: 'pointer',
                outline: 'none', WebkitTapHighlightColor: 'transparent',
              }}>
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Form – scrollable, no scrollbar ── */}
      <div style={{
        flex: 1, padding: '0 24px', overflowY: 'auto',
        scrollbarWidth: 'none', msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
      }}>
        <style>{`::-webkit-scrollbar{display:none} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 40 }}>
          {mode === 'signup' && (
            <div>
              <label className="field-label">Full Name</label>
              <input className="field-input" placeholder="e.g. Rajesh Kumar" value={form.name}
                onChange={e => set('name', e.target.value)} autoComplete="name" />
            </div>
          )}
          <div>
            <label className="field-label">Email Address</label>
            <input className="field-input" type="email" placeholder="you@airport.in" value={form.email}
              onChange={e => set('email', e.target.value)} autoComplete="email" />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input className="field-input" type="password" placeholder="••••••••" value={form.password}
              onChange={e => set('password', e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </div>
          {mode === 'signup' && (
            <div>
              <label className="field-label">Designation</label>
              <select className="field-select" value={form.designation}
                onChange={e => set('designation', e.target.value)}>
                {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          )}
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 12, padding: '12px 16px' }}>
              <p style={{ color: '#EF4444', fontSize: 14, fontFamily: 'Outfit,sans-serif' }}>{error}</p>
            </div>
          )}
          <button className="btn-primary" style={{ marginTop: 4 }}
            onClick={mode === 'login' ? handleLogin : handleSignup} disabled={loading}>
            {loading
              ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ width: 16, height: 16, border: '2px solid #000',
                    borderTopColor: 'transparent', borderRadius: '50%',
                    display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              : (mode === 'login' ? 'Sign In' : 'Create Account')
            }
          </button>
          <p style={{ textAlign: 'center', color: '#2a2a2a', fontSize: 11,
            fontFamily: 'Outfit,sans-serif' }}>
            Internal use only · Unauthorized access prohibited
          </p>
        </div>
      </div>

    </div>
  );
}

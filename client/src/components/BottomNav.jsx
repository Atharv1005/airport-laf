import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { list, add, checked, account } from '../assets/icons.js';

// Yellow filter: converts any image colour → #F5C300
// const YELLOW_FILTER =
//   'invert(84%) sepia(80%) saturate(900%) hue-rotate(2deg) brightness(103%) contrast(101%)';

const NAV_ITEM_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
  flex: 1,
  paddingTop: 10,
  paddingBottom: 10,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  // Kill every browser tap / focus highlight
  outline: 'none',
  WebkitTapHighlightColor: 'transparent',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
};

function NavItem({ icon, label, active, onClick }) {
  return (
    <button style={NAV_ITEM_STYLE} onClick={onClick}>
      <img
        src={icon}
        alt={label}
        style={{
          width: 24,
          height: 24,
          objectFit: 'contain',
          // filter: active ? YELLOW_FILTER : 'brightness(0) invert(0.35)',
          filter: active ? 'none' : 'brightness(0) invert(0.35)',
          transition: 'filter 0.15s',
        }}
      />
      <span
        style={{
          fontSize: 10,
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 500,
          letterSpacing: '0.04em',
          color: active ? '#F5C300' : '#444',
          transition: 'color 0.15s',
          lineHeight: 1,
        }}
      >
        {label}
      </span>
    </button>
  );
}

export default function BottomNav() {
  const navigate   = useNavigate();
  const { pathname } = useLocation();
  const { user }   = useAuth();

  return (
    <nav
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#000000',
        // Visible separator without being heavy
        borderTop: '1px solid #1C1C1C',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.9)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <NavItem icon={list}    label="Items"     active={pathname === '/'}               onClick={() => navigate('/')} />
        <NavItem icon={add}     label="Add"       active={pathname === '/add'}            onClick={() => navigate('/add')} />
        {user?.role === 'admin' && (
          <NavItem icon={checked} label="Approvals" active={pathname === '/admin/approvals'} onClick={() => navigate('/admin/approvals')} />
        )}
        <NavItem icon={account} label="Profile"   active={pathname === '/profile'}        onClick={() => navigate('/profile')} />
      </div>
    </nav>
  );
}

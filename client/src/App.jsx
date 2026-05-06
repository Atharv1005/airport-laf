import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AddItem from './pages/AddItem.jsx';
import ItemDetail from './pages/ItemDetail.jsx';
import Profile from './pages/Profile.jsx';
import AdminApproval from './pages/AdminApproval.jsx';
import UserProfile from './pages/UserProfile.jsx';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: '#000', gap: 12 }}>
      <div style={{ width: 32, height: 32, border: '2px solid #F5C300',
        borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ height: '100%', width: '100%', maxWidth: 480, margin: '0 auto', position: 'relative' }}>
          <Routes>
            <Route path="/login"             element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/"                  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/add"               element={<ProtectedRoute><AddItem /></ProtectedRoute>} />
            <Route path="/items/:id"         element={<ProtectedRoute><ItemDetail /></ProtectedRoute>} />
            <Route path="/profile"           element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/user/:userId"      element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/admin/approvals"   element={<ProtectedRoute adminOnly><AdminApproval /></ProtectedRoute>} />
            <Route path="*"                  element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

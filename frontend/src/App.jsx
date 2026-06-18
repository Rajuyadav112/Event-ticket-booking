import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import EventList from './pages/EventList';
import EventDetails from './pages/EventDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import { Ticket, User as UserIcon, LogOut } from 'lucide-react';
import './index.css';

function Navbar() {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  return (
    <nav className="navbar glass-panel">
      <Link to="/" className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Ticket size={24} color="var(--accent-color)" />
        Sort My Scene
      </Link>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {user ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontWeight: '500' }}>
              <UserIcon size={18} color="var(--text-secondary)" />
              {user.name}
            </div>
            <button onClick={handleLogout} className="btn" style={{ color: 'var(--text-secondary)', background: 'transparent', padding: '0.5rem' }} title="Logout">
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="container animate-fade-in">
          <Routes>
            <Route path="/" element={<EventList />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;

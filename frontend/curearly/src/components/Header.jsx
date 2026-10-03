import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Header() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="header">
      <Link to="/" className="app-name-link">
        <div className="app-name">
          <img className="logo-image" src="/favicon.png" alt="CureEarly Logo" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          CureEarly
        </div>
      </Link>
      <nav className="options">
        <Link to="/">Home</Link>
        {!loading && (
          user ? (
            <>
              <Link to="/patient-profile">Profile</Link>
              <Link to="/analysis">Analysis</Link>
              <span className="user-greeting">Hi, {user.fullName ? user.fullName.split(' ')[0] : 'Patient'}</span>
              <button type="button" className="header-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="header-register-pill">Register</Link>
            </>
          )
        )}
      </nav>
    </header>
  );
}

export default Header;

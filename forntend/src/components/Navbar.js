import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';
import { SearchOutlined, VideoLibraryOutlined } from '@mui/icons-material';
import { TextField, InputAdornment, IconButton } from '@mui/material';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <VideoLibraryOutlined style={{ fontSize: 32 }} />
          <span>VideoTube</span>
        </Link>
        
        <form onSubmit={handleSearch} className="nav-search">
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton type="submit" edge="end">
                    <SearchOutlined />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              width: '100%',
              maxWidth: '500px',
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(220, 38, 38, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#dc2626',
                },
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.6)',
              },
            }}
          />
        </form>
        
        <div className="nav-menu">
          {user ? (
            <>
              <Link to="/upload" className="nav-link">Upload</Link>
              <Link to="/playlists" className="nav-link">Playlists</Link>
              <Link to="/history" className="nav-link">History</Link>
              <Link to="/dashboard" className="nav-link user-profile">
                {user.avatar && (
                  <img src={user.avatar} alt={user.username} className="nav-avatar" />
                )}
                {user.username}
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register">
                <button className="btn btn-primary">Sign Up</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import './Playlists.css';
import {
  PlaylistAddOutlined,
  DeleteOutline,
  EditOutlined,
  PlayArrowOutlined,
  VideoLibraryOutlined
} from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip
} from '@mui/material';

const Playlists = () => {
  const { user } = useContext(AuthContext);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const fetchPlaylists = useCallback(async () => {
    if (!user?._id) return;
    try {
      const { data } = await API.get(`/playlist/user/${user._id}`);
      setPlaylists(data.data || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    if (user) {
      fetchPlaylists();
    }
  }, [user, fetchPlaylists]);

  const handleCreatePlaylist = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await API.post('/playlist', formData);
      setCreateDialog(false);
      setFormData({ name: '', description: '' });
      fetchPlaylists();
    } catch (error) {
      console.error('Error creating playlist:', error);
      alert('Failed to create playlist');
    }
  };

  const handleUpdatePlaylist = async () => {
    if (!formData.name.trim() || !formData.description.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await API.patch(`/playlist/${currentPlaylist._id}`, formData);
      setEditDialog(false);
      setFormData({ name: '', description: '' });
      setCurrentPlaylist(null);
      fetchPlaylists();
    } catch (error) {
      console.error('Error updating playlist:', error);
      alert('Failed to update playlist');
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;

    try {
      await API.delete(`/playlist/${playlistId}`);
      fetchPlaylists();
    } catch (error) {
      console.error('Error deleting playlist:', error);
      alert('Failed to delete playlist');
    }
  };

  const openEditDialog = (playlist) => {
    setCurrentPlaylist(playlist);
    setFormData({ name: playlist.name, description: playlist.description });
    setEditDialog(true);
  };

  if (!user) {
    return (
      <div className="container">
        <div className="empty-state">
          <p>Please login to view your playlists.</p>
          <Link to="/login">
            <Button variant="contained" color="error">Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <div className="playlists-header">
        <div>
          <h1>My Playlists</h1>
          <p>Create and manage your video collections</p>
        </div>
        <Button
          variant="contained"
          color="error"
          startIcon={<PlaylistAddOutlined />}
          onClick={() => setCreateDialog(true)}
          sx={{ borderRadius: '50px', px: 3 }}
        >
          Create Playlist
        </Button>
      </div>

      {playlists.length === 0 ? (
        <div className="empty-state">
          <VideoLibraryOutlined style={{ fontSize: 80, color: '#555' }} />
          <p>You haven't created any playlists yet.</p>
          <Button
            variant="contained"
            color="error"
            startIcon={<PlaylistAddOutlined />}
            onClick={() => setCreateDialog(true)}
          >
            Create Your First Playlist
          </Button>
        </div>
      ) : (
        <div className="playlists-grid">
          {playlists.map(playlist => (
            <Card key={playlist._id} className="playlist-card">
              <CardMedia
                component="div"
                className="playlist-thumbnail"
                sx={{
                  height: 180,
                  background: playlist.video && playlist.video.length > 0 && playlist.video[0].thumbnail
                    ? `url(${playlist.video[0].thumbnail})`
                    : 'linear-gradient(135deg, #dc2626 0%, #9333ea 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                }}
              >
                <div className="playlist-overlay">
                  <VideoLibraryOutlined style={{ fontSize: 40 }} />
                  <Typography variant="h6">{playlist.video?.length || 0} videos</Typography>
                </div>
              </CardMedia>
              <CardContent>
                <Typography variant="h6" className="playlist-name">
                  {playlist.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" className="playlist-description">
                  {playlist.description}
                </Typography>
                <div className="playlist-actions">
                  <Link to={`/playlist/${playlist._id}`}>
                    <Tooltip title="View Playlist">
                      <IconButton color="primary">
                        <PlayArrowOutlined />
                      </IconButton>
                    </Tooltip>
                  </Link>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => openEditDialog(playlist)} color="info">
                      <EditOutlined />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDeletePlaylist(playlist._id)} color="error">
                      <DeleteOutline />
                    </IconButton>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Playlist</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Playlist Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            variant="outlined"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreatePlaylist} variant="contained" color="error">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Playlist</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Playlist Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            variant="outlined"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdatePlaylist} variant="contained" color="error">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Playlists;

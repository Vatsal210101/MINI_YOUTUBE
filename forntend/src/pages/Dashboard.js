import { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import './Dashboard.css';
import {
  VisibilityOutlined,
  VisibilityOffOutlined,
  DeleteOutline,
  EditOutlined,
  VideoLibraryOutlined,
  ThumbUpOutlined,
  SubscriptionsOutlined,
  VisibilityRounded
} from '@mui/icons-material';
import {
  IconButton,
  Tooltip,
  Switch,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from '@mui/material';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });

  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsRes, videosRes] = await Promise.all([
        API.get('/dashboard/stats'),
        API.get('/dashboard/videos')
      ]);
      setStats(statsRes.data.data);
      setVideos(videosRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleTogglePublish = async (videoId, currentStatus) => {
    try {
      await API.patch(`/videos/toggle/publish/${videoId}`);
      setVideos(videos.map(v => 
        v._id === videoId ? { ...v, isPublished: !currentStatus } : v
      ));
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert('Failed to update video status');
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    
    try {
      await API.delete(`/videos/${videoId}`);
      setVideos(videos.filter(v => v._id !== videoId));
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video');
    }
  };

  const handleEditClick = (video) => {
    setCurrentVideo(video);
    setEditForm({ title: video.title, description: video.description });
    setEditDialog(true);
  };

  const handleEditSubmit = async () => {
    try {
      const { data } = await API.patch(`/videos/${currentVideo._id}`, editForm);
      setVideos(videos.map(v => 
        v._id === currentVideo._id ? { ...v, ...editForm } : v
      ));
      setEditDialog(false);
    } catch (error) {
      console.error('Error updating video:', error);
      alert('Failed to update video');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>Creator Dashboard</h1>
        <p>Manage your content and track performance</p>
      </div>
      
      {stats && (
        <div className="stats-grid">
          <div className="stat-card stat-videos">
            <VideoLibraryOutlined className="stat-icon" />
            <div className="stat-content">
              <h3>Total Videos</h3>
              <p className="stat-number">{stats.totalVideos}</p>
            </div>
          </div>
          <div className="stat-card stat-views">
            <VisibilityRounded className="stat-icon" />
            <div className="stat-content">
              <h3>Total Views</h3>
              <p className="stat-number">{stats.totalViews.toLocaleString()}</p>
            </div>
          </div>
          <div className="stat-card stat-subscribers">
            <SubscriptionsOutlined className="stat-icon" />
            <div className="stat-content">
              <h3>Subscribers</h3>
              <p className="stat-number">{stats.totalSubscribers}</p>
            </div>
          </div>
          <div className="stat-card stat-likes">
            <ThumbUpOutlined className="stat-icon" />
            <div className="stat-content">
              <h3>Total Likes</h3>
              <p className="stat-number">{stats.totalLikes}</p>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-videos">
        <div className="section-header">
          <h2>Your Videos</h2>
          <Link to="/upload">
            <button className="btn btn-primary">Upload New Video</button>
          </Link>
        </div>

        {videos.length === 0 ? (
          <div className="empty-state">
            <VideoLibraryOutlined style={{ fontSize: 80, color: '#555' }} />
            <p>You haven't uploaded any videos yet.</p>
            <Link to="/upload">
              <button className="btn btn-primary">Upload Your First Video</button>
            </Link>
          </div>
        ) : (
          <div className="videos-table">
            {videos.map(video => (
              <div key={video._id} className="video-row">
                <img src={video.thumbnail} alt={video.title} className="video-row-thumbnail" />
                
                <div className="video-row-info">
                  <h4>{video.title}</h4>
                  <div className="video-meta">
                    <span>{video.views} views</span>
                    <span>•</span>
                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                  </div>
                  <Chip 
                    label={video.isPublished ? "Published" : "Private"} 
                    size="small"
                    color={video.isPublished ? "success" : "default"}
                    icon={video.isPublished ? <VisibilityOutlined /> : <VisibilityOffOutlined />}
                  />
                </div>
                
                <div className="video-row-actions">
                  <Tooltip title={video.isPublished ? "Make Private" : "Publish"}>
                    <Switch
                      checked={video.isPublished}
                      onChange={() => handleTogglePublish(video._id, video.isPublished)}
                      color="error"
                    />
                  </Tooltip>
                  
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEditClick(video)} color="primary">
                      <EditOutlined />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="View">
                    <Link to={`/video/${video._id}`}>
                      <IconButton color="info">
                        <VisibilityOutlined />
                      </IconButton>
                    </Link>
                  </Tooltip>
                  
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDeleteVideo(video._id)} color="error">
                      <DeleteOutline />
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Video</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            margin="normal"
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Description"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            margin="normal"
            variant="outlined"
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained" color="error">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Dashboard;

import { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import './VideoPlayer.css';
import {
  ThumbUpAltOutlined,
  ThumbUpAlt,
  ShareOutlined,
  PlaylistAddOutlined,
  NotificationsOutlined,
  NotificationsActive,
  VisibilityRounded
} from '@mui/icons-material';
import {
  IconButton,
  Tooltip,
  Button,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [shareMenu, setShareMenu] = useState(null);
  const [playlistDialog, setPlaylistDialog] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchVideo();
    fetchComments();
  }, [fetchVideo, fetchComments]);

  useEffect(() => {
    if (user) {
      checkLikeStatus();
      fetchPlaylists();
    }
  }, [user, checkLikeStatus, fetchPlaylists]);

  useEffect(() => {
    if (user && video?.owner?._id) {
      checkSubscriptionStatus();
    }
  }, [user, video?.owner?._id, checkSubscriptionStatus]);

  const fetchVideo = useCallback(async () => {
    try {
      const { data } = await API.get(`/videos/${id}`);
      setVideo(data.data);
      setLikesCount(data.data.likesCount || 0);
      setSubscribersCount(data.data.owner?.subscribersCount || 0);
    } catch (error) {
      console.error('Error fetching video:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    try {
      const { data } = await API.get(`/comments/${id}`);
      setComments(data.data.docs || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  }, [id]);

  const checkLikeStatus = useCallback(async () => {
    try {
      const { data } = await API.get(`/likes/status/v/${id}`);
      setIsLiked(data.data?.isLiked || false);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  }, [id]);

  const checkSubscriptionStatus = useCallback(async () => {
    if (!video?.owner?._id) return;
    try {
      const { data } = await API.get(`/subscriptions/u/${video.owner._id}`);
      setIsSubscribed(data.data?.isSubscribed || false);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  }, [video?.owner?._id]);

  const fetchPlaylists = useCallback(async () => {
    if (!user?._id) return;
    try {
      const { data } = await API.get(`/playlist/user/${user._id}`);
      setPlaylists(data.data || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  }, [user?._id]);

  const handleLike = async () => {
    if (!user) {
      setSnackbar({ open: true, message: 'Please login to like videos', severity: 'warning' });
      return;
    }
    try {
      await API.post(`/likes/toggle/v/${id}`);
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
      setSnackbar({ open: true, message: isLiked ? 'Like removed' : 'Video liked!', severity: 'success' });
    } catch (error) {
      console.error('Error toggling like:', error);
      setSnackbar({ open: true, message: 'Failed to like video', severity: 'error' });
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      setSnackbar({ open: true, message: 'Please login to subscribe', severity: 'warning' });
      return;
    }
    if (!video?.owner?._id) return;
    
    try {
      await API.post(`/subscriptions/c/${video.owner._id}`);
      setIsSubscribed(!isSubscribed);
      setSubscribersCount(prev => isSubscribed ? prev - 1 : prev + 1);
      setSnackbar({ open: true, message: isSubscribed ? 'Unsubscribed' : 'Subscribed!', severity: 'success' });
    } catch (error) {
      console.error('Error toggling subscription:', error);
      setSnackbar({ open: true, message: 'Failed to subscribe', severity: 'error' });
    }
  };

  const handleShareClick = (event) => {
    setShareMenu(event.currentTarget);
  };

  const handleShareClose = () => {
    setShareMenu(null);
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setSnackbar({ open: true, message: 'Link copied to clipboard!', severity: 'success' });
    handleShareClose();
  };

  const handleAddToPlaylist = async (playlistId) => {
    try {
      await API.patch(`/playlist/add/${id}/${playlistId}`);
      setSnackbar({ open: true, message: 'Added to playlist!', severity: 'success' });
      setPlaylistDialog(false);
    } catch (error) {
      console.error('Error adding to playlist:', error);
      setSnackbar({ open: true, message: 'Failed to add to playlist', severity: 'error' });
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setSnackbar({ open: true, message: 'Please login to comment', severity: 'warning' });
      return;
    }
    if (!newComment.trim()) return;
    
    try {
      await API.post(`/comments/${id}`, { content: newComment });
      setNewComment('');
      fetchComments();
      setSnackbar({ open: true, message: 'Comment posted!', severity: 'success' });
    } catch (error) {
      console.error('Error posting comment:', error);
      setSnackbar({ open: true, message: 'Failed to post comment', severity: 'error' });
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!video) return <div className="container">Video not found</div>;

  return (
    <div className="container">
      <div className="video-player-container">
        <video src={video.videoFile} controls className="video-player" />
        
        <div className="video-details">
          <h1>{video.title}</h1>
          
          <div className="video-meta-row">
            <div className="video-owner-section">
              {video.owner?.avatar && (
                <img 
                  src={video.owner.avatar} 
                  alt={video.owner.username} 
                  className="owner-avatar-large"
                  onClick={() => navigate(`/channel/${video.owner._id}`)}
                  style={{ cursor: 'pointer' }}
                />
              )}
              <div>
                <h3 onClick={() => navigate(`/channel/${video.owner._id}`)} style={{ cursor: 'pointer' }}>
                  {video.owner?.fullname || video.owner?.username}
                </h3>
                <p>{subscribersCount} subscribers</p>
              </div>
            </div>

            <Button
              variant={isSubscribed ? "outlined" : "contained"}
              color="error"
              startIcon={isSubscribed ? <NotificationsActive /> : <NotificationsOutlined />}
              onClick={handleSubscribe}
              sx={{ borderRadius: '50px', textTransform: 'none', px: 3 }}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </Button>
          </div>

          <div className="video-actions">
            <div className="video-stats">
              <Chip 
                icon={<VisibilityRounded />} 
                label={`${video.views.toLocaleString()} views`} 
                variant="outlined"
              />
            </div>
            
            <div className="action-buttons">
              <Tooltip title={isLiked ? "Unlike" : "Like"}>
                <Button
                  variant="outlined"
                  startIcon={isLiked ? <ThumbUpAlt /> : <ThumbUpAltOutlined />}
                  onClick={handleLike}
                  sx={{ borderRadius: '50px', textTransform: 'none' }}
                >
                  {likesCount}
                </Button>
              </Tooltip>

              <Tooltip title="Share">
                <IconButton onClick={handleShareClick} color="primary">
                  <ShareOutlined />
                </IconButton>
              </Tooltip>

              {user && (
                <Tooltip title="Add to playlist">
                  <IconButton onClick={() => setPlaylistDialog(true)} color="primary">
                    <PlaylistAddOutlined />
                  </IconButton>
                </Tooltip>
              )}
            </div>
          </div>

          <p className="video-description">{video.description}</p>
        </div>

        <div className="comments-section">
          <h3>{comments.length} Comments</h3>
          
          {user && (
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows="3"
              />
              <button type="submit" className="btn btn-primary">Comment</button>
            </form>
          )}

          <div className="comments-list">
            {comments.map(comment => (
              <div key={comment._id} className="comment">
                <strong>{comment.owner?.username}</strong>
                <p>{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Share Menu */}
      <Menu
        anchorEl={shareMenu}
        open={Boolean(shareMenu)}
        onClose={handleShareClose}
      >
        <MenuItem onClick={handleCopyLink}>Copy Link</MenuItem>
        <MenuItem onClick={() => window.open(`https://twitter.com/intent/tweet?url=${window.location.href}`, '_blank')}>
          Share on Twitter
        </MenuItem>
        <MenuItem onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, '_blank')}>
          Share on Facebook
        </MenuItem>
      </Menu>

      {/* Playlist Dialog */}
      <Dialog open={playlistDialog} onClose={() => setPlaylistDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add to Playlist</DialogTitle>
        <DialogContent>
          {playlists.length === 0 ? (
            <p>You don't have any playlists yet.</p>
          ) : (
            <List>
              {playlists.map(playlist => (
                <ListItem 
                  button 
                  key={playlist._id} 
                  onClick={() => handleAddToPlaylist(playlist._id)}
                >
                  <ListItemText primary={playlist.name} secondary={`${playlist.videos?.length || 0} videos`} />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default VideoPlayer;


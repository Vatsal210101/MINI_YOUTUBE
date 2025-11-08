import { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import './PlaylistView.css';
import {
  DeleteOutline,
  PlayArrowOutlined,
  VisibilityOutlined
} from '@mui/icons-material';
import {
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';

const PlaylistView = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPlaylist = useCallback(async () => {
    try {
      const { data } = await API.get(`/playlist/${id}`);
      setPlaylist(data.data);
    } catch (error) {
      console.error('Error fetching playlist:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPlaylist();
  }, [fetchPlaylist]);

  const handleRemoveVideo = async (videoId) => {
    if (!window.confirm('Remove this video from playlist?')) return;

    try {
      await API.patch(`/playlist/remove/${videoId}/${id}`);
      fetchPlaylist();
    } catch (error) {
      console.error('Error removing video:', error);
      alert('Failed to remove video');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!playlist) return <div className="container">Playlist not found</div>;

  const isOwner = user && playlist.owner && user._id === playlist.owner._id;

  return (
    <div className="container">
      <div className="playlist-header">
        <div className="playlist-info">
          <h1>{playlist.name}</h1>
          <p className="playlist-description">{playlist.description}</p>
          <div className="playlist-meta">
            {playlist.owner && (
              <div className="playlist-owner">
                {playlist.owner.avatar && (
                  <img src={playlist.owner.avatar} alt={playlist.owner.username} />
                )}
                <span>{playlist.owner.fullname || playlist.owner.username}</span>
              </div>
            )}
            <Chip 
              icon={<PlayArrowOutlined />} 
              label={`${playlist.video?.length || 0} videos`}
              color="error"
              variant="outlined"
            />
          </div>
        </div>
      </div>

      <div className="playlist-videos">
        {!playlist.video || playlist.video.length === 0 ? (
          <div className="empty-playlist">
            <p>This playlist is empty.</p>
          </div>
        ) : (
          <div className="videos-list">
            {playlist.video.map((video, index) => (
              <div key={video._id} className="playlist-video-item">
                <div className="video-index">{index + 1}</div>
                <Link to={`/video/${video._id}`} className="video-thumbnail-link">
                  <img src={video.thumbnail} alt={video.title} className="video-thumbnail" />
                  <div className="play-overlay">
                    <PlayArrowOutlined style={{ fontSize: 40 }} />
                  </div>
                </Link>
                <div className="video-details">
                  <Link to={`/video/${video._id}`}>
                    <h3>{video.title}</h3>
                  </Link>
                  <div className="video-stats">
                    <Chip 
                      icon={<VisibilityOutlined />} 
                      label={`${video.views?.toLocaleString() || 0} views`}
                      size="small"
                      variant="outlined"
                    />
                  </div>
                </div>
                {isOwner && (
                  <Tooltip title="Remove from playlist">
                    <IconButton 
                      onClick={() => handleRemoveVideo(video._id)} 
                      color="error"
                      className="remove-btn"
                    >
                      <DeleteOutline />
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistView;

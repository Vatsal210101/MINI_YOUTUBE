import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import API from '../api/axios';
import './Home.css';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      let url = '/videos?limit=20';
      if (searchQuery) {
        url += `&query=${encodeURIComponent(searchQuery)}`;
      }
      const { data } = await API.get(url);
      setVideos(data.data.docs || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">
          {searchQuery ? `Search results for "${searchQuery}"` : 'Discover Amazing Videos'}
        </h1>
        <p className="page-subtitle">
          {searchQuery 
            ? `Found ${videos.length} video${videos.length !== 1 ? 's' : ''}`
            : 'Watch, learn, and explore content from creators worldwide'
          }
        </p>
      </div>
      
      <div className="video-grid">
        {videos.length === 0 ? (
          <div className="no-results">
            <p>No videos found{searchQuery ? ` for "${searchQuery}"` : ''}.</p>
          </div>
        ) : (
          videos.map(video => (
            <Link key={video._id} to={`/video/${video._id}`} className="video-card">
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="video-thumbnail"
              />
              <div className="video-info">
                <div className="video-owner-info">
                  {video.owner?.avatar && (
                    <img src={video.owner.avatar} alt={video.owner.username} className="owner-avatar" />
                  )}
                  <div>
                    <h3 className="video-title">{video.title}</h3>
                    <p className="video-owner">{video.owner?.username}</p>
                  </div>
                </div>
                <div className="video-stats">
                  <span>{video.views.toLocaleString()} views</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import './WatchHistory.css';

const WatchHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWatchHistory = useCallback(async () => {
    try {
      const { data } = await API.get('/users/history');
      setHistory(data.data);
    } catch (error) {
      console.error('Error fetching watch history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchHistory();
  }, [fetchWatchHistory]);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <h1>Watch History</h1>
      
      {history.length === 0 ? (
        <p className="empty-message">No videos in watch history</p>
      ) : (
        <div className="history-list">
          {history.map(video => (
            <Link key={video._id} to={`/video/${video._id}`} className="history-item">
              <img src={video.thumbnail} alt={video.title} className="history-thumbnail" />
              <div className="history-info">
                <h3>{video.title}</h3>
                <p className="history-owner">{video.owner?.username}</p>
                <div className="history-stats">
                  <span>{video.views} views</span>
                  <span>•</span>
                  <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="history-description">{video.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchHistory;

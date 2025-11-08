import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import './Channel.css';

const Channel = () => {
  const { username } = useParams();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChannelData = useCallback(async () => {
    try {
      const { data } = await API.get(`/users/c/${username}`);
      setChannel(data.data);
      // Fetch user videos
      const videosRes = await API.get(`/videos?userId=${data.data._id}`);
      setVideos(videosRes.data.data.docs || []);
    } catch (error) {
      console.error('Error fetching channel data:', error);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchChannelData();
  }, [fetchChannelData]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!channel) return <div className="container">Channel not found</div>;

  return (
    <div className="channel-page">
      <div className="channel-header">
        {channel.coverImage && (
          <img src={channel.coverImage} alt="Cover" className="cover-image" />
        )}
        <div className="channel-info">
          <img src={channel.avatar} alt={channel.username} className="channel-avatar" />
          <div>
            <h1>{channel.fullname}</h1>
            <p>@{channel.username}</p>
            <p>{channel.subscribersCount} subscribers</p>
          </div>
        </div>
      </div>

      <div className="container">
        <h2>Videos</h2>
        <div className="video-grid">
          {videos.map(video => (
            <Link key={video._id} to={`/video/${video._id}`} className="video-card">
              <img src={video.thumbnail} alt={video.title} className="video-thumbnail" />
              <div className="video-info">
                <h3 className="video-title">{video.title}</h3>
                <div className="video-stats">
                  <span>{video.views} views</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Channel;

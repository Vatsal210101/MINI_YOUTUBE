import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import './Upload.css';

const Upload = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoFile: null,
    thumbnail: null
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.type === 'file') {
      setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.videoFile || !formData.thumbnail) {
      setError('Video file and thumbnail are required');
      return;
    }

    setUploading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          data.append(key, formData[key]);
        }
      });

      const response = await API.post('/videos', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setSuccess('Video uploaded successfully!');
      setTimeout(() => {
        navigate(`/video/${response.data.data._id}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container">
      <div className="upload-container">
        <h1>Upload Video</h1>
        
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              disabled={uploading}
            />
          </div>
          
          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              required
              disabled={uploading}
            />
          </div>
          
          <div className="form-group">
            <label>Video File *</label>
            <input
              type="file"
              name="videoFile"
              onChange={handleChange}
              accept="video/*"
              required
              disabled={uploading}
            />
          </div>
          
          <div className="form-group">
            <label>Thumbnail *</label>
            <input
              type="file"
              name="thumbnail"
              onChange={handleChange}
              accept="image/*"
              required
              disabled={uploading}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Video'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;

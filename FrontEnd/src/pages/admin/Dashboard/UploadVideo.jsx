import React, { useState, useEffect } from 'react';
import { Trash2, Upload, Film, AlertTriangle } from 'lucide-react';

// Backend base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL;

const UploadVideo = () => {
  const [formData, setFormData] = useState({
    title: '',
    embedUrl: '',
    category: 'Interview', // Default category
    description: '',
  });
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all videos on component mount
  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/videos`);
        if (!response.ok) throw new Error('Failed to fetch videos');
        const data = await response.json();
        setVideos(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching videos:', error);
        setError('Failed to load videos. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const convertToEmbedUrl = (url) => {
    // Handle watch URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID)
    const watchRegex = /^https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)$/;
    const watchMatch = url.match(watchRegex);
    if (watchMatch) {
      return `https://www.youtube.com/embed/${watchMatch[1]}`;
    }
    // Handle embed URL (e.g., https://www.youtube.com/embed/VIDEO_ID)
    const embedRegex = /^https:\/\/www\.youtube\.com\/embed\/[a-zA-Z0-9_-]+$/;
    if (embedRegex.test(url)) {
      return url;
    }
    // Handle short URLs (e.g., https://youtu.be/VIDEO_ID)
    const shortRegex = /^https:\/\/youtu\.be\/([a-zA-Z0-9_-]+)$/;
    const shortMatch = url.match(shortRegex);
    if (shortMatch) {
      return `https://www.youtube.com/embed/${shortMatch[1]}`;
    }
    return null; // Invalid URL
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Convert URL to embed format
    const convertedUrl = convertToEmbedUrl(formData.embedUrl);
    if (!convertedUrl) {
      alert(
        'Please enter a valid YouTube URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID)'
      );
      return;
    }

    const submitData = { ...formData, embedUrl: convertedUrl };
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });
      const data = await response.json();
      if (response.ok) {
        // Refresh video list
        const updatedResponse = await fetch(`${API_URL}/api/videos`);
        const updatedVideos = await updatedResponse.json();
        setVideos(updatedVideos);
        setFormData({ title: '', embedUrl: '', category: 'Interview', description: '' });
        setError(null);
      } else {
        setError(`Error: ${data.message}`);
      }
    } catch (error) {
      setError('Error posting video. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/videos/${videoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the deleted video from the state
        setVideos(videos.filter((video) => video._id !== videoId));
        setError(null);
      } else {
        const data = await response.json();
        setError(`Error: ${data.message}`);
      }
    } catch (error) {
      setError('Error deleting video. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to render a YouTube preview thumbnail
  const getVideoId = (embedUrl) => {
    const match = embedUrl.match(/embed\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 mb-8">
        <div className="flex items-center mb-6">
          <Film className="mr-3 text-blue-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-800">Upload YouTube Video</h1>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 flex items-center">
            <AlertTriangle className="mr-2" size={20} />
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter video title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
            <input
              type="url"
              name="embedUrl"
              value={formData.embedUrl}
              onChange={handleChange}
              placeholder="e.g., https://www.youtube.com/watch?v=VIDEO_ID"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Accepts YouTube watch URLs, embed URLs, and short URLs (youtu.be)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Interview">Interview (Interview.jsx)</option>
              <option value="Video">Video (Video.jsx)</option>
              <option value="Motivation">Motivation (Motivation.jsx)</option>
              <option value="Eduhub">Eduhub (Eduhub.jsx)</option>
              <option value="Finance">Finance (Finance.jsx)</option>
              <option value="Health">Health (Health.jsx)</option>
              <option value="Other">Other (Podcast.jsx)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-32"
              placeholder="Enter video description"
            ></textarea>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-300 disabled:bg-blue-400"
          >
            <Upload className="mr-2" size={20} />
            {isLoading ? 'Processing...' : 'Post Video'}
          </button>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Posted Videos</h2>

        {isLoading && videos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading videos...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <Film className="mx-auto text-gray-400" size={48} />
            <p className="mt-2 text-gray-500">No videos posted yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((video) => {
              const videoId = getVideoId(video.embedUrl);
              return (
                <div key={video._id} className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  {videoId && (
                    <div className="relative pb-9/16 w-full">
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                        alt={video.title}
                        className="w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{video.title}</h3>
                    <p className="text-sm text-gray-500 mb-1">
                      <span className="font-medium">Category:</span> {video.category}
                    </p>
                    <p className="text-sm text-gray-700 mb-4">
                      {video.description || 'No description provided'}
                    </p>
                    <button
                      onClick={() => handleDelete(video._id)}
                      className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors duration-300"
                    >
                      <Trash2 className="mr-2" size={16} />
                      Delete Video
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadVideo;
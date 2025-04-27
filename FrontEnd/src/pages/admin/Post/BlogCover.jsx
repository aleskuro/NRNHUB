import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const BlogCover = () => {
  const [file, setFile] = useState(null);
  const [imagePath, setImagePath] = useState('');
  const [uploading, setUploading] = useState(false);
  const [coverImages, setCoverImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all cover images
  const fetchCoverImages = async () => {
    setLoadingImages(true);
    setError(null);
    try {
      const apiUrl = `${window.location.origin}/api/cover`;
      console.log(`Fetching cover images from: ${apiUrl}`);

      const res = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server responded with ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      console.log('Fetched cover images:', data);

      if (!Array.isArray(data)) {
        throw new Error('Server returned invalid cover images data');
      }

      setCoverImages(data);
    } catch (err) {
      console.error('Error fetching cover images:', err);
      setError(err.message);
      toast.error(`Failed to fetch cover images: ${err.message}`);
    } finally {
      setLoadingImages(false);
    }
  };

  // Fetch images on component mount
  useEffect(() => {
    fetchCoverImages();
  }, []);

  // Handle file selection with validation
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setFile(null);
      setImagePath('');
      return;
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const videoMimeTypes = [
      'video/mp4',
      'video/mpeg',
      'video/avi',
      'video/mov',
      'video/wmv',
      'video/flv',
      'video/webm',
      'video/mkv',
    ];

    if (videoMimeTypes.includes(selectedFile.type)) {
      console.error(`Blocked video file: ${selectedFile.name} (MIME: ${selectedFile.type})`);
      toast.error('Videos are not allowed. Please select a JPEG, PNG, or WebP image.');
      setFile(null);
      setImagePath('');
      return;
    }

    if (!allowedMimeTypes.includes(selectedFile.type)) {
      console.error(`Invalid file type: ${selectedFile.name} (MIME: ${selectedFile.type})`);
      toast.error('Only JPEG, PNG, or WebP images are allowed.');
      setFile(null);
      setImagePath('');
      return;
    }

    console.log(`Selected valid image: ${selectedFile.name} (MIME: ${selectedFile.type})`);
    setFile(selectedFile);
    setImagePath(''); // Clear previous path
  };

  // Handle image upload
  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select an image to upload');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('coverImage', file);

    try {
      const apiUrl = `${window.location.origin}/api/cover/upload`;
      console.log(`Uploading image to: ${apiUrl}`);

      const res = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server responded with ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      console.log('Upload response:', data);

      if (!data.path) {
        throw new Error('Server returned empty or invalid image path');
      }

      setImagePath(data.path);
      toast.success('Image uploaded successfully!');
      setFile(null); // Clear file input

      // Refresh the cover images list
      await fetchCoverImages();
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(`Failed to upload image: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload Blog Cover Image</h2>

      {/* Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="mb-4">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            disabled={uploading}
          />
        </div>
        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className={`w-full py-2 px-4 rounded-md text-white font-medium
            ${uploading || !file ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors`}
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
        {imagePath && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Uploaded Image Path:</span> {imagePath}
            </p>
          </div>
        )}
      </div>

      {/* Cover Images List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">All Cover Images</h3>
        {loadingImages && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading cover images...</p>
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md mb-4">
            <p>{error}</p>
          </div>
        )}
        {!loadingImages && !error && coverImages.length === 0 && (
          <p className="text-gray-600">No cover images found.</p>
        )}
        {!loadingImages && !error && coverImages.length > 0 && (
          <ul className="space-y-3">
            {coverImages.map((image) => (
              <li key={image._id} className="p-3 bg-gray-50 rounded-md flex items-center justify-between">
                <span className="text-sm text-gray-700 truncate">{image.path}</span>
                <span className="text-xs text-gray-500">
                  {new Date(image.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BlogCover;
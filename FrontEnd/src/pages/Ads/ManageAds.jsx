import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { toggleAd, setAdImage, setAdLink } from '../../Redux/features/ads/adSlice';
import noImage from '../../assets/images.png';

const ManageAds = () => {
  const dispatch = useDispatch();
  const ads = useSelector((state) => state.ads);

  const adSizes = {
    mobile: '100% width x 128px (mobile only)',
    left: '192px x 256px (desktop only)',
    right: '192px x 256px (desktop only)',
    bottom: '100% width (max 1152px) x 160px',
    navbar: '100% width (max 1152px) x 160px',
  };

  const handleImageChange = async (e, ad) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('adImage', file);

    try {
      const res = await fetch('http://localhost:5000/api/ads/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      console.log('Upload response:', data);
      if (!res.ok) {
        console.error('Upload failed with status:', res.status, 'Message:', data.message);
        throw new Error(data.message || 'Upload failed');
      }
      const fullPath = `http://localhost:5000${data.path}`;
      console.log('Stored path:', fullPath);
      // Verify image is accessible
      const imgCheck = await fetch(fullPath, { method: 'HEAD' });
      if (!imgCheck.ok) {
        console.error('Image not accessible at:', fullPath, 'Status:', imgCheck.status);
        throw new Error('Image not accessible on server');
      }
      dispatch(setAdImage({ ad, imagePath: fullPath }));
      toast.success(`Image uploaded for ${ad} ad!`);
    } catch (err) {
      console.error('Upload error:', err.message);
      toast.error(`Failed to upload image for ${ad} ad: ${err.message}`);
      // Temporarily disabled fallback to debug server issue
      // const imageUrl = URL.createObjectURL(file);
      // dispatch(setAdImage({ ad, imagePath: imageUrl }));
      // toast.warn(`Failed to upload image for ${ad} ad, using temporary URL`);
    }
  };

  const handleLinkChange = (e, ad) => {
    const url = e.target.value;
    if (url === '') {
      dispatch(setAdLink({ ad, link: '' }));
      return;
    }
    try {
      new URL(url);
      dispatch(setAdLink({ ad, link: url }));
    } catch {
      toast.error('Please enter a valid URL (e.g., https://example.com)');
    }
  };

  return (
    <div className="p-6">
      {['mobile', 'right', 'left', 'bottom', 'navbar'].map((ad) => (
        <div key={ad} className="mb-6 border p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold capitalize">{ad} Ad</h3>
          <p className="text-sm text-gray-600">Size: {adSizes[ad]}</p>
          <label className="block mt-2">
            <input
              type="checkbox"
              checked={ads[`${ad}AdVisible`] || false}
              onChange={() => {
                console.log(`Toggling ${ad} ad`);
                dispatch(toggleAd({ ad }));
                toast.info(`${ad} ad ${ads[`${ad}AdVisible`] ? 'hidden' : 'shown'}`);
              }}
            />{' '}
            Show Ad
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e, ad)}
            className="mt-2"
          />
          <input
            type="text"
            value={ads.adLinks[ad] || ''}
            onChange={(e) => handleLinkChange(e, ad)}
            placeholder="Enter redirect URL (e.g., https://example.com)"
            className="mt-2 w-full p-2 border rounded"
          />
          {ads.adImages[ad] && (
            <img
              src={ads.adImages[ad]}
              alt={`${ad} Ad`}
              className={`mt-2 rounded object-cover ${
                ad === 'navbar' || ad === 'bottom'
                  ? 'w-full max-w-[1152px] h-40'
                  : ad === 'mobile'
                  ? 'w-full h-32'
                  : 'w-48 h-64'
              }`}
              onError={(e) => {
                console.error(`Failed to load image: ${ads.adImages[ad]}`);
                e.target.src = noImage;
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default ManageAds;
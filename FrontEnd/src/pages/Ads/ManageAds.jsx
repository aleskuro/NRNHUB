import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleAd, setAdImage, setAdLink } from '../../Redux/features/ads/adSlice';
import noImage from '../../assets/images.png';

const ManageAds = () => {
  const dispatch = useDispatch();
  const ads = useSelector((state) => state.ads);

  const adSizes = {
    mobile: '100% width x 128px (mobile only)',
    left: '192px x 256px (desktop only)',
    right: '192px x 256px (desktop only)',
    hero: '100% width (max 1152px) x 160px',
    bottom: '100% width (max 1152px) x 160px',
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
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      const fullPath = `http://localhost:5000${data.path}`;
      console.log('Stored path:', fullPath);
      dispatch(setAdImage({ ad, imagePath: fullPath }));
    } catch (err) {
      console.error('Upload failed', err);
      const imageUrl = URL.createObjectURL(file);
      dispatch(setAdImage({ ad, imagePath: imageUrl }));
    }
  };

  const handleLinkChange = (e, ad) => {
    dispatch(setAdLink({ ad, link: e.target.value }));
  };

  return (
    <div className="p-6">
      {['mobile', 'right', 'left', 'bottom', 'hero'].map((ad) => (
        <div key={ad} className="mb-6 border p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold capitalize">{ad} Ad</h3>
          <p className="text-sm text-gray-600">Size: {adSizes[ad]}</p>
          <label className="block mt-2">
            <input
              type="checkbox"
              checked={ads[`${ad}AdVisible`] || false}
              onChange={() => dispatch(toggleAd({ ad }))}
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
              className="mt-2 w-40 h-auto rounded object-cover"
              onError={(e) => (e.target.src = noImage)}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default ManageAds;
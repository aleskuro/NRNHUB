import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { toggleAd, setAdImage, setAdLink, clearAd, resetSubmitStatus } from '../../Redux/features/ads/adSlice';
import { fetchAdsFromServer, submitAds } from '../../Redux/features/ads/adThunks';
import noImage from '../../assets/images.png';

// Backend base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ManageAds = () => {
  const dispatch = useDispatch();
  const ads = useSelector((state) => state.ads);
  const fileInputRefs = useRef({});

  // Fetch ads when component mounts
  useEffect(() => {
    dispatch(fetchAdsFromServer());
  }, [dispatch]);

  // Show toast when submit is successful or fails
  useEffect(() => {
    if (ads.submitSuccess) {
      toast.success('Ad settings saved successfully!');
      dispatch(resetSubmitStatus());
    }
    if (ads.error) {
      toast.error(`Error: ${ads.error}`);
      dispatch(resetSubmitStatus());
    }
  }, [ads.submitSuccess, ads.error, dispatch]);

  const adSizes = {
    mobile: '100% width (recommended 1152x128, mobile only)',
    left1: '192px width (recommended 192x128, desktop only)',
    left2: '192px width (recommended 192x128, desktop only)',
    left3: '192px width (recommended 192x128, desktop only)',
    left4: '192px width (recommended 192x128, desktop only)',
    left5: '192px width (recommended 192x128, desktop only)',
    right1: '192px width (recommended 192x128, desktop only)',
    right2: '192px width (recommended 192x128, desktop only)',
    right3: '192px width (recommended 192x128, desktop only)',
    right4: '192px width (recommended 192x128, desktop only)',
    right5: '192px width (recommended 192x128, desktop only)',
    bottom: '100% width (recommended max 1152x160)',
    navbar: '100% width (recommended max 1152x160)',
    hero: '100% width (recommended 1152x224, below hero section)',
    blogsFirst: '100% width (recommended 1152x224)',
    blogsSecond: '100% width (recommended 1152x224)',
    blogsThird: '100% width (recommended 1152x224)',
    blogsFourth: '100% width (recommended 1152x224)',
    blogsFifth: '100% width (recommended 1152x224)',
    blogsHome1: '100% width (recommended 1152x224)',
    blogsHome2: '100% width (recommended 1152x224)',
    blogsHome3: '100% width (recommended 1152x224)',
    economyAds1: '100% width (recommended 1152x224)',
    economyAds2: '100% width (recommended 1152x224)',
    lifestyle1: '100% width (recommended 1152x224)',
    lifestyle2: '100% width (recommended 1152x224)',
  };

  const validAdTypes = [
    'mobile', 'right1', 'right2', 'right3', 'right4', 'right5',
    'left1', 'left2', 'left3', 'left4', 'left5', 'bottom',
    'navbar', 'hero', 'blogsFirst', 'blogsSecond', 'blogsThird',
    'blogsFourth', 'blogsFifth', 'blogsHome1', 'blogsHome2', 'blogsHome3',
    'economyAds1', 'economyAds2', 'lifestyle1', 'lifestyle2'
  ];

  const normalizeImageUrl = (url) => {
    if (!url) return '';
    let normalized = url.trim();
    // If it's a full URL, ensure it uses API_URL
    if (normalized.startsWith('http')) {
      try {
        const urlObj = new URL(normalized);
        normalized = normalized.replace(urlObj.origin, API_URL);
      } catch (e) {
        console.warn(`Invalid URL format: ${normalized}`);
      }
    } else {
      // Handle relative URLs (e.g., /Uploads/ads/...)
      normalized = `${API_URL}${normalized.startsWith('/') ? '' : '/'}${normalized}`;
    }
    // Clean up duplicate /Uploads/ or /ads/
    normalized = normalized.replace(/(\/Uploads\/)+/g, '/Uploads/');
    normalized = normalized.replace(/(\/ads\/)+/g, '/ads/');
    // Remove /undefined/
    if (normalized.includes('/undefined/')) {
      normalized = normalized.replace(/\/undefined\//g, '/');
    }
    // Ensure the path starts with /Uploads/ads/
    if (!normalized.includes('/Uploads/ads/')) {
      const path = normalized.split('/').pop();
      normalized = `${API_URL}/Uploads/ads/${path}`;
    }
    return normalized;
  };

  const handleImageChange = async (e, adType) => {
    const file = e.target.files[0];
    if (!file) {
      console.error(`No file selected for ${adType}`);
      toast.error(`Please select an image file for ${adType} ad`);
      return;
    }

    if (!file.type.startsWith('image/')) {
      console.error(`Invalid file type for ${adType}: ${file.type}`);
      toast.error(`Please select an image file (e.g., PNG, JPEG) for ${adType} ad`);
      return;
    }

    if (ads.adImages[adType]) {
      toast.warn(`Replacing existing image for ${adType} ad`);
    }

    const formData = new FormData();
    formData.append('adImage', file);

    try {
      const apiUrl = `${API_URL}/api/ads/upload`;
      console.log(`Uploading image to: ${apiUrl} for ${adType}`, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });

      const res = await fetch(apiUrl, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      console.log('Upload response data:', data);

      if (!data.url) {
        throw new Error('Server returned empty or invalid image URL');
      }

      // Normalize the URL
      const imageUrl = normalizeImageUrl(data.url);
      console.log(`Normalized image URL for ${adType}:`, imageUrl);

      dispatch(setAdImage({ ad: adType, imagePath: imageUrl }));
      toast.success(`Image uploaded for ${adType} ad!`);
      if (fileInputRefs.current[adType]) {
        fileInputRefs.current[adType].value = null;
      }
    } catch (err) {
      console.error(`Upload error for ${adType}:`, err);
      toast.error(`Failed to upload image for ${adType} ad: ${err.message}`);
    }
  };

  const handleLinkChange = (e, adType) => {
    const link = e.target.value.trim();
    dispatch(setAdLink({ ad: adType, link: link || undefined }));
  };

  const handleSubmit = () => {
    const cleanedAdImages = {};
    const cleanedAdLinks = {};
    const cleanedVisibility = {};

    validAdTypes.forEach((adType) => {
      if (ads.adImages[adType]?.trim()) cleanedAdImages[adType] = ads.adImages[adType];
      if (ads.adLinks[adType]?.trim()) cleanedAdLinks[adType] = ads.adLinks[adType];
      if (ads.visibility[adType] !== undefined) cleanedVisibility[adType] = ads.visibility[adType];
    });

    const visibleAds = Object.keys(cleanedVisibility).filter((adType) => cleanedVisibility[adType]);
    const missingImages = visibleAds.filter((adType) => !cleanedAdImages[adType]);
    const missingLinks = visibleAds.filter((adType) => !cleanedAdLinks[adType]);

    if (missingImages.length > 0) {
      toast.error(`Please provide images for visible ads: ${missingImages.join(', ')}`);
      return;
    }
    if (missingLinks.length > 0) {
      toast.warn(`Warning: No links provided for visible ads: ${missingLinks.join(', ')}`);
    }

    const payload = {
      adImages: cleanedAdImages,
      adLinks: cleanedAdLinks,
      visibility: cleanedVisibility,
    };
    dispatch(submitAds());
  };

  const handleClearAd = (adType) => {
    dispatch(clearAd({ ad: adType }));
    toast.info(`Cleared settings for ${adType} ad`);
  };

  const handleClearAllAds = () => {
    validAdTypes.forEach((adType) => dispatch(clearAd({ ad: adType })));
    toast.info('Cleared all ad settings');
  };

  const renderAdImage = (adType) => {
    if (!ads.adImages[adType]) return null;

    const imagePath = normalizeImageUrl(ads.adImages[adType]);
    console.log(`Rendering image for ${adType}:`, imagePath);

    return (
      <img
        src={imagePath}
        alt={`${adType} Ad`}
        className={`mt-2 rounded-lg object-contain ${
          adType === 'navbar' || adType === 'bottom' || adType === 'hero' || adType.startsWith('blogs') || adType.startsWith('economyAds') || adType.startsWith('lifestyle')
            ? 'w-full max-w-[1152px] h-56 lg:h-64'
            : adType === 'mobile'
            ? 'w-full h-32'
            : 'w-48 h-32'
        }`}
        onError={(e) => {
          console.error(`Failed to load image for ${adType}: ${imagePath}`);
          toast.error(`Failed to load image for ${adType} ad. Please re-upload.`);
          e.target.src = noImage;
        }}
      />
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-end gap-4">
        <button
          className="px-4 py-2 bg-red-600 text-white font-medium rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          onClick={handleClearAllAds}
        >
          Clear All Ads
        </button>
        <button
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          onClick={handleSubmit}
          disabled={ads.submitting}
        >
          {ads.submitting ? 'Saving...' : 'Save All Ad Settings'}
        </button>
      </div>

      {ads.loading && (
        <div className="text-center py-4">
          <p>Loading ad configurations...</p>
        </div>
      )}

      {!ads.loading && (
        <div>
          {validAdTypes.map((adType) => (
            <div key={adType} className="mb-6 border p-4 rounded-lg shadow">
              <h3 className="text-xl font-semibold capitalize">
                {adType === 'hero'
                  ? 'Hero'
                  : adType.startsWith('right')
                  ? `Right Ad ${adType.replace('right', '')}`
                  : adType.startsWith('left')
                  ? `Left Ad ${adType.replace('left', '')}`
                  : adType.startsWith('blogs')
                  ? `Blogs ${adType.replace('blogs', '')} Ad`
                  : adType.startsWith('economyAds')
                  ? `Economy Ad ${adType.replace('economyAds', '')}`
                  : adType.startsWith('lifestyle')
                  ? `Lifestyle Ad ${adType.replace('lifestyle', '')}`
                  : adType} Ad
              </h3>
              <p className="text-sm text-gray-600">Size: {adSizes[adType]}</p>
              <label className="block mt-2">
                <input
                  type="checkbox"
                  checked={ads.visibility[adType] || false}
                  onChange={() => {
                    dispatch(toggleAd({ ad: adType }));
                    toast.info(
                      `${adType === 'hero'
                        ? 'Hero'
                        : adType.startsWith('right')
                        ? `Right Ad ${adType.replace('right', '')}`
                        : adType.startsWith('left')
                        ? `Left Ad ${adType.replace('left', '')}`
                        : adType.startsWith('blogs')
                        ? `Blogs ${adType.replace('blogs', '')}`
                        : adType.startsWith('economyAds')
                        ? `Economy Ad ${adType.replace('economyAds', '')}`
                        : adType.startsWith('lifestyle')
                        ? `Lifestyle Ad ${adType.replace('lifestyle', '')}`
                        : adType} ad ${ads.visibility[adType] ? 'hidden' : 'shown'}`
                    );
                  }}
                />{' '}
                Show Ad
              </label>
              <form encType="multipart/form-data">
                <input
                  type="file"
                  accept="image/*"
                  ref={(el) => (fileInputRefs.current[adType] = el)}
                  onChange={(e) => handleImageChange(e, adType)}
                  className="mt-2"
                />
              </form>
              <input
                type="url"
                value={ads.adLinks[adType] || ''}
                onChange={(e) => handleLinkChange(e, adType)}
                placeholder="Enter redirect URL (e.g., https://example.com)"
                className="mt-2 w-full p-2 border rounded"
              />
              <button
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={() => handleClearAd(adType)}
              >
                Clear Ad
              </button>
              {renderAdImage(adType)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageAds;
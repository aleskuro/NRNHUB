import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { toggleAd, setAdImage, setAdLink, clearAd, resetSubmitStatus } from '../../Redux/features/ads/adSlice';
import { fetchAdsFromServer, submitAds } from '../../Redux/features/ads/adThunks';
import noImage from '../../assets/images.png';

// Helper to get API URL
const getApiUrl = () => {
  return window.location.origin;
};

const ManageAds = () => {
  const dispatch = useDispatch();
  const ads = useSelector((state) => state.ads);

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
  };

  const validAdTypes = [
    'mobile', 'right1', 'right2', 'right3', 'right4', 'right5',
    'left1', 'left2', 'left3', 'left4', 'left5', 'bottom',
    'navbar', 'hero', 'blogsFirst', 'blogsSecond', 'blogsThird',
    'blogsFourth', 'blogsFifth', 'blogsHome1', 'blogsHome2', 'blogsHome3'
  ];

  const handleImageChange = async (e, adType) => {
    const file = e.target.files[0];
    if (!file) return;

    if (ads.adImages[adType]) {
      toast.warn(`Replacing existing image for ${adType} ad`);
    }

    const formData = new FormData();
    formData.append('adImage', file);

    try {
      const apiUrl = `${getApiUrl()}/api/ads/upload`;
      console.log(`Uploading image to: ${apiUrl} for ${adType}`);

      const res = await fetch(apiUrl, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server responded with ${res.status}: ${errorText}`);
      }

      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        throw new Error(`Failed to parse server response as JSON: ${parseError.message}`);
      }

      console.log('Upload response data:', data);

      if (!data.path || !data.path.trim()) {
        throw new Error('Server returned empty or invalid image path');
      }

      const imagePath = data.path;
      const fullImagePath = imagePath.startsWith('http')
        ? imagePath
        : `${getApiUrl()}${imagePath}`;

      console.log(`Full image path for ${adType}:`, fullImagePath);

      dispatch(setAdImage({ ad: adType, imagePath: fullImagePath }));
      toast.success(`Image uploaded for ${adType} ad!`);
    } catch (err) {
      console.error(`Upload error for ${adType}:`, err);
      toast.error(`Failed to upload image for ${adType} ad: ${err.message}`);
    }
  };

  const handleLinkChange = (e, adType) => {
    const link = e.target.value.trim();
    console.log(`Setting link for ${adType}:`, link || 'undefined');
    dispatch(setAdLink({ ad: adType, link: link || undefined }));
  };

  const handleSubmit = () => {
    // Clean payload
    const cleanedAdImages = {};
    const cleanedAdLinks = {};
    const cleanedVisibility = {};

    validAdTypes.forEach((adType) => {
      if (ads.adImages[adType]?.trim()) cleanedAdImages[adType] = ads.adImages[adType];
      if (ads.adLinks[adType]?.trim()) cleanedAdLinks[adType] = ads.adLinks[adType];
      if (ads.visibility[adType] !== undefined) cleanedVisibility[adType] = ads.visibility[adType];
    });

    // Validate visibility
    Object.keys(cleanedVisibility).forEach((key) => {
      if (!validAdTypes.includes(key)) {
        console.warn(`Removing invalid visibility key: ${key}`);
        delete cleanedVisibility[key];
      }
    });

    // Validate payload
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
    const payloadSize = JSON.stringify(payload).length;
    console.log('Submitting ad state:', JSON.stringify(payload, null, 2));
    if (payloadSize > 1024 * 1024) {
      toast.error('Payload too large. Please reduce the number of ads or clear unused entries.');
      return;
    }

    toast.info('Submitting ad settings...');
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

    let imagePath = ads.adImages[adType];

    if (imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('/')) {
      imagePath = `/${imagePath}`;
    }

    return (
      <img
        src={imagePath}
        alt={`${adType} Ad`}
        className={`mt-2 rounded object-contain ${
          adType === 'navbar' || adType === 'bottom' || adType === 'hero' || adType.startsWith('blogs')
            ? 'w-full max-w-[1152px]'
            : adType === 'mobile'
            ? 'w-full'
            : 'w-48'
        }`}
        onError={(e) => {
          console.error(`Failed to load image: ${imagePath}`);
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
                  : adType} Ad
              </h3>
              <p className="text-sm text-gray-600">Size: {adSizes[adType]}</p>
              <label className="block mt-2">
                <input
                  type="checkbox"
                  checked={ads[`${adType}AdVisible`] || false}
                  onChange={() => {
                    console.log(`Toggling ${adType} ad`);
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
                        : adType} ad ${ads[`${adType}AdVisible`] ? 'hidden' : 'shown'}`
                    );
                  }}
                />{' '}
                Show Ad
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, adType)}
                className="mt-2"
              />
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

      <div className="mt-6 flex justify-end gap-4">
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
    </div>
  );
};

export default ManageAds;
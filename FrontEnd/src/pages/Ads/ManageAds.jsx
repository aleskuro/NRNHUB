// src/pages/Ads/ManageAds.jsx
import React, { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  toggleAd,
  setAdImage,
  setAdLink,
  clearAd,
  resetSubmitStatus,
} from '../../Redux/features/ads/adSlice';
import { fetchAdsFromServer, submitAds } from '../../Redux/features/ads/adThunks';
import noImage from '../../assets/images.png';
import { normalizeAdImage } from '@utilis/normalizeAdImage';;

const API_URL = import.meta.env.VITE_API_URL;

const validAdTypes = [
  'mobile','right1','right2','right3','right4','right5',
  'left1','left2','left3','left4','left5','bottom','navbar','hero',
  'blogsFirst','blogsSecond','blogsThird','blogsFourth','blogsFifth',
  'blogsHome1','blogsHome2','blogsHome3','economyAds1','economyAds2',
  'lifestyle1','lifestyle2'
];

const ManageAds = () => {
  const dispatch = useDispatch();
  const fileInputRefs = useRef({});

  const {
    adImages = {},
    adLinks = {},
    visibility = {},
    loading = true,
    submitting = false,
    submitSuccess = false,
    error = null,
  } = useSelector((state) => state.ads || {});

  useEffect(() => {
    dispatch(fetchAdsFromServer());
  }, [dispatch]);

  useEffect(() => {
    if (submitSuccess) {
      toast.success('Saved!');
      dispatch(resetSubmitStatus());
    }
    if (error) {
      toast.error(error);
      dispatch(resetSubmitStatus());
    }
  }, [submitSuccess, error, dispatch]);

  const handleImageChange = useCallback(async (e, adType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('adImage', file);
    formData.append('adType', adType);

    try {
      const res = await fetch(`${API_URL}/api/ads/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await res.json();
      if (!data.url) throw new Error('No URL');

      const fullUrl = normalizeAdImage(data.url, API_URL);
      dispatch(setAdImage({ ad: adType, imagePath: fullUrl }));
      toast.success(`${adType} uploaded`);

      const input = fileInputRefs.current[adType];
      if (input) input.value = '';
    } catch (err) {
      toast.error(`Upload failed: ${err.message}`);
    }
  }, [dispatch]);

  const handleSubmit = useCallback(() => {
    const payload = { adImages: {}, adLinks: {}, visibility: {} };
    validAdTypes.forEach((t) => {
      if (adImages[t]) payload.adImages[t] = adImages[t];
      if (adLinks[t]?.trim()) payload.adLinks[t] = adLinks[t].trim();
      if (visibility[t] !== undefined) payload.visibility[t] = visibility[t];
    });

    const visible = Object.keys(payload.visibility).filter(k => payload.visibility[k]);
    const missing = visible.filter(k => !payload.adImages[k]);
    if (missing.length) {
      toast.error(`Missing images: ${missing.join(', ')}`);
      return;
    }

    dispatch(submitAds(payload));
  }, [adImages, adLinks, visibility, dispatch]);

  const handleClear = useCallback((adType) => {
    dispatch(clearAd({ ad: adType }));
    const input = fileInputRefs.current[adType];
    if (input) input.value = '';
    toast.info(`Cleared ${adType}`);
  }, [dispatch]);

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Ads</h1>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save All'}
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {validAdTypes.map((adType) => (
            <div key={adType} className="bg-white p-5 rounded-lg border shadow-sm">
              <h3 className="font-semibold capitalize">{adType}</h3>

              <label className="flex items-center mt-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!visibility[adType]}
                  onChange={() => dispatch(toggleAd({ ad: adType }))}
                  className="mr-2"
                />
                Show
              </label>

              <input
                type="file"
                accept="image/*"
                ref={(el) => (fileInputRefs.current[adType] = el)}
                onChange={(e) => handleImageChange(e, adType)}
                className="mt-3 block w-full text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded file:bg-blue-50"
              />

              <input
                type="url"
                placeholder="https://example.com"
                value={adLinks[adType] || ''}
                onChange={(e) => dispatch(setAdLink({ ad: adType, link: e.target.value }))}
                className="mt-2 w-full p-2 border rounded text-sm"
              />

              <button
                onClick={() => handleClear(adType)}
                className="mt-2 w-full py-1.5 text-sm bg-red-50 text-red-600 rounded"
              >
                Clear
              </button>

              {adImages[adType] && (
                <img
                  src={normalizeAdImage(adImages[adType], API_URL) || noImage}
                  alt={adType}
                  className="mt-3 w-full max-w-xs h-auto rounded border"
                  onError={(e) => (e.target.src = noImage)}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageAds;
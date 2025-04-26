import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdsFromServer } from '../../Redux/features/ads/adThunks';
import noImage from '../../assets/images.png';
import Hero from '../home/Hero';
import Blogs from '../blogs/Blogs';

const Ad = ({ adType }) => {
  const ads = useSelector((state) => state.ads);
  const image = ads.adImages[adType];
  const link = ads.adLinks[adType];
  const isVisible = ads[`${adType}AdVisible`];

  // Log ad data for debugging
  useEffect(() => {
    console.log('Visibility flags:', {
      mobileAdVisible: ads.mobileAdVisible,
      right1AdVisible: ads.right1AdVisible,
      // Add other flags as needed
    });
    console.log('Ad Images:', ads.adImages);
    console.log('Ad Links:', ads.adLinks);
  }, [ads]);

  if (!isVisible || !image) {
    return null;
  }

  // Validate image URL
  const isValidUrl =
    image &&
    (image.startsWith('http://') ||
      image.startsWith('https://') ||
      image.startsWith('/'));

  if (!isValidUrl) {
    console.error(`Invalid image URL for ${adType}: ${image}`);
    return null;
  }

  return (
    <div className="ad-container mb-4">
      <a href={link || '#'} target="_blank" rel="noopener noreferrer">
        <img
          src={image}
          alt={`${adType} Advertisement`}
          className={`rounded shadow ${
            adType === 'mobile'
              ? 'w-full'
              : adType.startsWith('left') || adType.startsWith('right')
              ? 'w-48'
              : 'w-full'
          }`}
          onError={(e) => {
            console.error(`Failed to load image: ${image}`);
            e.target.src = noImage;
          }}
        />
      </a>
    </div>
  );
};

const Home = () => {
  const dispatch = useDispatch();
  const ads = useSelector((state) => state.ads);
  const adsLoading = useSelector((state) => state.ads.loading);

  // Fetch ads on mount
  useEffect(() => {
    dispatch(fetchAdsFromServer());
  }, [dispatch]);

  // Debug logging
  useEffect(() => {
    if (!adsLoading) {
      console.log('Current ads state:', ads);
      console.log('left1AdVisible:', ads.left1AdVisible);
      console.log('left1 image:', ads.adImages?.left1);
    }
  }, [ads, adsLoading]);

  if (adsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl font-medium">Loading content...</div>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* Left Ad Boxes (Desktop Only) */}
      <div className="hidden lg:flex flex-col w-48 mr-8 space-y-4 sticky top-0">
        {['left1', 'left2', 'left3', 'left4', 'left5'].map((adType) => (
          <Ad key={adType} adType={adType} />
        ))}
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-blue-100 text-gray-800 container mx-auto mt-12 p-8 rounded-xl shadow-lg flex-grow">
        {/* Mobile Ad Space Below Navbar */}
        <div className="md:hidden">
          <Ad adType="mobile" />
        </div>

        <Hero />

        {/* Hero Ad Space */}
        <Ad adType="hero" />

        <hr className="my-8 border-blue-300" />

        <Blogs />

        {/* Bottom Ad Space */}
        <Ad adType="bottom" />
      </div>

      {/* Right Ad Boxes (Desktop Only) */}
      <div className="hidden lg:flex flex-col w-48 ml-8 space-y-4 sticky top-0">
        {['right1', 'right2', 'right3', 'right4', 'right5'].map((adType) => (
          <Ad key={adType} adType={adType} />
        ))}
      </div>
    </div>
  );
};

export default Home;
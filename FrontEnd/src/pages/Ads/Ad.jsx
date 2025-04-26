import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import noImage from '../../assets/images.png';

const Ad = ({ adType }) => {
  const ads = useSelector((state) => state.ads);
  const image = ads.adImages[adType];
  const link = ads.adLinks[adType];
  const isVisible = ads[`${adType}AdVisible`];

  // Log ad data for debugging
  useEffect(() => {
    console.log(`Ad data for ${adType}:`, {
      isVisible,
      image,
      link,
    });
    console.log('Visibility flags:', {
      mobileAdVisible: ads.mobileAdVisible,
      right1AdVisible: ads.right1AdVisible,
      bottomAdVisible: ads.bottomAdVisible,
      left1AdVisible: ads.left1AdVisible,
    });
    console.log('Ad Images:', ads.adImages);
    console.log('Ad Links:', ads.adLinks);
  }, [ads, adType, isVisible, image, link]);

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
              ? 'w-full h-auto'
              : adType.startsWith('left') || adType.startsWith('right')
              ? 'max-w-full h-auto'
              : adType === 'bottom' || adType === 'hero' || adType.startsWith('blogs')
              ? 'w-full h-auto max-w-[1152px]'
              : 'w-full h-auto'
          }`}
          style={{ maxWidth: '100%' }} // Prevent overflow
          onError={(e) => {
            console.error(`Failed to load image: ${image}`);
            e.target.src = noImage;
          }}
        />
      </a>
    </div>
  );
};

export default Ad;
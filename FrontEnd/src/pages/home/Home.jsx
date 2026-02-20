// src/pages/home/Home.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdsFromServer } from '../../Redux/features/ads/adThunks';
import noImage from '../../assets/images.png';
import Hero from './Hero';
import Blogs from '../blogs/Blogs';
import { normalizeAdImage } from '@utilis/normalizeAdImage';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Renders a free-size ad.
 * - Keeps original image dimensions.
 * - Mobile: full-width
 * - Sidebar: fixed width (optional)
 * - Hero/Bottom: full-width
 */
const Ad = ({ adType }) => {  // REMOVED TypeScript syntax
  const { adImages = {}, adLinks = {}, visibility = {} } = useSelector(
    (state) => state.ads || {}
  );

  const image = adImages[adType];
  const link = adLinks[adType];
  const isVisible = visibility[adType];

  if (!isVisible || !image) return null;

  const src = normalizeAdImage(image, API_URL) ?? noImage;

  const isMobile = adType === 'mobile';
  const isSidebar = adType.startsWith('left') || adType.startsWith('right');
  const isHeroOrBottom = adType === 'hero' || adType === 'bottom';

  return (
    <div
      className={`
        ad-container mb-4
        ${isMobile ? 'md:hidden' : ''}
        ${isSidebar ? 'hidden lg:block' : ''}
      `}
    >
      <a
        href={link ?? '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <img
          src={src}
          alt={`${adType} advertisement`}
          loading="lazy"
          onError={(e) => (e.currentTarget.src = noImage)}
          className={`
            rounded-lg shadow-md object-contain
            ${isMobile ? 'w-full' : ''}
            ${isSidebar ? 'w-48' : ''}
            ${isHeroOrBottom ? 'w-full' : ''}
            max-w-full h-auto
          `}
        />
      </a>
    </div>
  );
};

/* --------------------------------------------------------------------- */

const Home = () => {
  const dispatch = useDispatch();
  const { loading = true } = useSelector((state) => state.ads || {});

  useEffect(() => {
    dispatch(fetchAdsFromServer());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-medium text-gray-600">
          Loading content…
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-screen">
      {/* LEFT SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-48 space-y-4 sticky top-20 h-fit">
        {['left1', 'left2', 'left3', 'left4', 'left5'].map((t) => (
          <Ad key={t} adType={t} />
        ))}
      </aside>

      {/* MAIN */}
      <main className="flex-1 bg-gradient-to-br from-orange-50 to-blue-100 rounded-xl p-6 lg:p-8 shadow-lg">
        <div className="md:hidden mb-6">
          <Ad adType="mobile" />
        </div>

        <Hero />

        <div className="my-8">
          <Ad adType="hero" />
        </div>

        <hr className="my-8 border-blue-300" />

        <Blogs />

        <div className="mt-8">
          <Ad adType="bottom" />
        </div>
      </main>

      {/* RIGHT SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-48 space-y-4 sticky top-20 h-fit">
        {['right1', 'right2', 'right3', 'right4', 'right5'].map((t) => (
          <Ad key={t} adType={t} />
        ))}
      </aside>
    </div>
  );
};

export default Home;
// ✅ Layout.jsx (Main wrapper where Navbar & ads render)
import React from 'react';
import Navbar from './Navbar';
import { useSelector } from 'react-redux';

const AdBanner = ({ ad, imageUrl, link }) => {
  if (!imageUrl) return null;

  return (
    <a href={link || '#'} target="_blank" rel="noopener noreferrer">
      <img
        src={imageUrl}
        alt={`${ad} ad`}
        className={`object-cover mx-auto mb-2 rounded ${
          ad === 'hero' || ad === 'bottom'
            ? 'w-full max-w-[1152px] h-40'
            : ad === 'mobile'
            ? 'w-full h-32 block md:hidden'
            : 'w-48 h-64 hidden md:block'
        }`}
      />
    </a>
  );
};

const Layout = ({ children }) => {
  const ads = useSelector((state) => state.ads);

  return (
    <div className="relative">
      {/* Hero Ad */}
      {ads.heroAdVisible && (
        <AdBanner ad="hero" imageUrl={ads.adImages.hero} link={ads.adLinks.hero} />
      )}

      <Navbar />

      {/* Mobile Ad */}
      {ads.mobileAdVisible && (
        <AdBanner ad="mobile" imageUrl={ads.adImages.mobile} link={ads.adLinks.mobile} />
      )}

      {/* Main Content */}
      <div className="flex">
        {/* Left Ad */}
        {ads.leftAdVisible && (
          <div className="hidden lg:block">
            <AdBanner ad="left" imageUrl={ads.adImages.left} link={ads.adLinks.left} />
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 px-4">{children}</main>

        {/* Right Ad */}
        {ads.rightAdVisible && (
          <div className="hidden lg:block">
            <AdBanner ad="right" imageUrl={ads.adImages.right} link={ads.adLinks.right} />
          </div>
        )}
      </div>

      {/* Bottom Ad */}
      {ads.bottomAdVisible && (
        <AdBanner ad="bottom" imageUrl={ads.adImages.bottom} link={ads.adLinks.bottom} />
      )}
    </div>
  );
};

export default Layout;
import React from 'react';
import { useSelector } from 'react-redux';
import Hero from './Hero';
import Blogs from '../blogs/Blogs';
import noImage from '../../assets/images.png';

const Home = () => {
  const ads = useSelector((state) => state.ads);

  return (
    <div className="flex"> {/* Added a flex container to hold sidebar and main content */}
      {/* Left Ad Box (Desktop Only) */}
      {ads.leftAdVisible && ads.adImages.left && (
        <div className="hidden lg:block w-48 mr-8 rounded-lg shadow-md sticky top-0 h-screen"> {/* Made it sticky and full viewport height */}
          <a href={ads.adLinks?.left || '#'} target="_blank" rel="noopener noreferrer" className="block h-full"> {/* Added display: block and full height to the anchor */}
            <img
              src={ads.adImages.left}
              alt="Left Ad"
              className="w-full h-full object-cover"
              style={{ backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}
              onError={(e) => (e.target.src = noImage)}
            />
          </a>
        </div>
      )}

      <div className="bg-gradient-to-br from-orange-50 to-blue-100 text-gray-800 container mx-auto mt-12 p-8 rounded-xl shadow-lg flex-grow"> {/* Added flex-grow */}
        {/* Mobile Ad Space Below Navbar (moved inside main content for stacking) */}
        {ads.mobileAdVisible && ads.adImages.mobile && (
          <div className="sm:hidden w-full text-center mb-8"> {/* Added mb-8 for spacing */}
            <div className="w-full h-40">
              <a href={ads.adLinks?.mobile || '#'} target="_blank" rel="noopener noreferrer">
                <img
                  src={ads.adImages.mobile}
                  alt="Mobile Ad"
                  className="w-full h-full object-cover"
                  style={{ backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}
                  onError={(e) => (e.target.src = noImage)}
                />
              </a>
            </div>
          </div>
        )}

        <Hero />
        {/* Hero Ad Space */}
        {ads.heroAdVisible && ads.adImages.hero && (
          <div className="w-full text-center mt-8">
            <div className="w-full h-56">
              <a href={ads.adLinks?.hero || '#'} target="_blank" rel="noopener noreferrer">
                <img
                  src={ads.adImages.hero}
                  alt="Hero Ad"
                  className="w-full object-cover"
                  style={{ backgroundRepeat: 'no-repeat', backgroundSize: 'cover', height: 'auto' }}
                  onError={(e) => (e.target.src = noImage)}
                />
              </a>
            </div>
          </div>
        )}
        <hr className="my-8 border-blue-300" />
        <Blogs />

        {/* Bottom Ad Space (moved inside main content) */}
        {ads.bottomAdVisible && ads.adImages.bottom && (
          <div className="w-full text-center mt-8">
            <div className="w-full h-56">
              <a href={ads.adLinks?.bottom || '#'} target="_blank" rel="noopener noreferrer">
                <img
                  src={ads.adImages.bottom}
                  alt="Bottom Ad"
                  className="w-full object-cover"
                  style={{ backgroundRepeat: 'no-repeat', backgroundSize: 'cover', height: 'auto' }}
                  onError={(e) => (e.target.src = noImage)}
                />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Right Ad Box (Desktop Only) */}
      {ads.rightAdVisible && ads.adImages.right && (
        <div className="hidden lg:block w-48 ml-8 rounded-lg shadow-md sticky top-0 h-screen"> {/* Made it sticky and full viewport height */}
          <a href={ads.adLinks?.right || '#'} target="_blank" rel="noopener noreferrer" className="block h-full"> {/* Added display: block and full height to the anchor */}
            <img
              src={ads.adImages.right}
              alt="Right Ad"
              className="w-full h-full object-cover"
              style={{ backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}
              onError={(e) => (e.target.src = noImage)}
            />
          </a>
        </div>
      )}
    </div>
  );
};

export default Home;
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Eduhub = () => {
  const [financeVideos, setFinanceVideos] = useState([]);
  const [healthVideos, setHealthVideos] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState({
    Finance: true,
    Health: true,
  });
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    const fetchVideos = async (category, setVideos) => {
      try {
        const response = await fetch(`http://localhost:5000/api/videos/category/${category}`);
        if (!response.ok) throw new Error(`Failed to fetch ${category} videos`);
        const data = await response.json();
        setVideos(data.slice(0, 2)); // Limit to 2 videos for preview
        setLoadingCategories((prev) => ({ ...prev, [category]: false }));
      } catch (error) {
        console.error(`Error fetching ${category} videos:`, error);
        setLoadingCategories((prev) => ({ ...prev, [category]: false }));
      }
    };

    fetchVideos('Finance', setFinanceVideos);
    fetchVideos('Health', setHealthVideos);
  }, []);

  const handleShare = (embedUrl) => {
    const videoId = embedUrl.split('/embed/')[1];
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    navigator.clipboard.writeText(watchUrl);
    alert('Video URL copied to clipboard!');
  };

  const VideoCard = ({ video }) => {
    return (
      <div className="flex flex-col">
        {/* Video Container - Full access to video with no overlays */}
        <div
          className="w-full bg-white rounded-t-xl overflow-hidden shadow-xl"
          style={{
            height: '280px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <iframe
            className="w-full h-full"
            src={video.embedUrl}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        {/* Info Section - Below video, always visible */}
        <div className="bg-white p-4 rounded-b-xl shadow-xl border-t border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-gray-800 truncate flex-1 mr-2">{video.title}</h3>
            <button
              onClick={() => handleShare(video.embedUrl)}
              className="flex-shrink-0 bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-full text-sm transition-all duration-200 flex items-center"
              style={{ backgroundColor: 'rgba(119, 52, 227, 0.1)', color: '#7734E3' }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              Share
            </button>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{video.description || 'No description available.'}</p>
          <div className="mt-3 flex justify-between items-center">
            <span className="text-xs text-gray-500">{new Date().toLocaleDateString()}</span>
            <span
              className="text-xs font-medium px-2 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(119, 52, 227, 0.1)', color: '#7734E3' }}
            >
              {video.category}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const CategorySection = ({ videos, category, path, isLoading }) => (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <div className="relative">
          <h2
            className="text-2xl font-bold text-gray-800"
            onMouseEnter={() => setActiveCategory(category)}
            onMouseLeave={() => setActiveCategory(null)}
          >
            {category} Videos
          </h2>
          <div
            className="absolute -bottom-2 left-0 h-1 transition-all duration-300 ease-out"
            style={{
              width: activeCategory === category ? '100%' : '40%',
              background: '#7734E3',
            }}
          ></div>
        </div>

        {videos.length > 0 && (
          <Link
            to={`/edu-hub/${path}`}
            className="text-purple-700 hover:text-purple-900 font-medium flex items-center transition-colors duration-200"
            style={{ color: '#7734E3' }}
            onClick={() => window.scrollTo(0, 0)} // Scroll to top on click
          >
            <span>See All</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="flex space-x-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="w-1/2 h-64 bg-gray-100 rounded-xl animate-pulse"
              style={{
                background: 'linear-gradient(110deg, #ececec 8%, #f5f5f5 18%, #ececec 33%)',
                backgroundSize: '200% 100%',
                animation: 'shine 1.5s linear infinite',
              }}
            ></div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="flex items-center justify-center h-40 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-gray-500">No videos available in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );

  // Map tab names to their respective routes
  const tabRoutes = {
    All: '/edu-hub',
    Finance: '/edu-hub/finance',
    Health: '/edu-hub/health',
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="relative inline-block mb-12">
          <h1 className="text-4xl md:text-5xl font-bold relative z-10">EduHub</h1>
          <div
            className="absolute -bottom-3 left-0 right-0 h-4 bg-purple-100 z-0"
            style={{
              backgroundColor: 'rgba(119, 52, 227, 0.15)',
            }}
          ></div>
        </div>

        <div className="mb-10 pb-6 border-b border-gray-100">
          <div className="flex flex-wrap gap-4">
            {['All', 'Finance', 'Health'].map((tab) => (
              <Link
                key={tab}
                to={tabRoutes[tab]}
                className="px-6 py-2 rounded-full text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: tab === 'All' ? '#7734E3' : 'rgba(119, 52, 227, 0.1)',
                  color: tab === 'All' ? 'white' : '#7734E3',
                }}
                onClick={() => window.scrollTo(0, 0)} // Scroll to top on click
              >
                {tab}
              </Link>
            ))}
          </div>
        </div>

        <CategorySection
          videos={financeVideos}
          category="Finance"
          path="finance"
          isLoading={loadingCategories.Finance}
        />
        <CategorySection
          videos={healthVideos}
          category="Health"
          path="health"
          isLoading={loadingCategories.Health}
        />
      </div>
    </div>
  );
};

export default Eduhub;
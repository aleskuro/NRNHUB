import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

const Eduhub = () => {
  const [financeVideos, setFinanceVideos] = useState([]);
  const [healthVideos, setHealthVideos] = useState([]);
  const [filteredFinanceVideos, setFilteredFinanceVideos] = useState([]);
  const [filteredHealthVideos, setFilteredHealthVideos] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState({
    Finance: true,
    Health: true,
  });
  const [errorCategories, setErrorCategories] = useState({
    Finance: null,
    Health: null,
  });
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    Finance: 'All',
    Health: 'All',
  });

  // --- Data Fetching Effect ---
  useEffect(() => {
    const fetchVideos = async (category, setVideos) => {
      setLoadingCategories((prev) => ({ ...prev, [category]: true }));
      setErrorCategories((prev) => ({ ...prev, [category]: null }));
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        if (!API_URL) {
          throw new Error('VITE_API_URL is not defined in .env');
        }
        const url = `${API_URL}/api/videos/category/${category}`;
        console.log(`Fetching ${category} videos from:`, url);

        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch ${category} videos: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const data = await response.json();
        console.log(`${category} API Response:`, data);

        if (!Array.isArray(data)) {
          throw new Error(`${category} API response is not an array`);
        }
        setVideos(data);
        applyFilter(category, activeFilters[category], data);
      } catch (error) {
        console.error(`Error fetching ${category} videos:`, error);
        setErrorCategories((prev) => ({
          ...prev,
          [category]: error.message || `An unexpected error occurred while fetching ${category} videos.`,
        }));
        setVideos([]);
        // Fallback to mock data
        const mockData = [
          {
            _id: `mock-${category}-1`,
            title: `Test ${category} Video`,
            embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: `A test ${category.toLowerCase()} video`,
            createdAt: '2025-05-01T12:00:00Z',
            category,
          },
        ];
        console.log(`Using mock data for ${category}:`, mockData);
        setVideos(mockData);
        applyFilter(category, activeFilters[category], mockData);
      } finally {
        setLoadingCategories((prev) => ({ ...prev, [category]: false }));
      }
    };

    fetchVideos('Finance', setFinanceVideos);
    fetchVideos('Health', setHealthVideos);
  }, []);

  // --- Filtering/Sorting Logic ---
  const applyFilter = useCallback(
    (category, filter, videosToFilter) => {
      let sortedVideos = [...videosToFilter];
      if (filter === 'Latest') {
        sortedVideos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (filter === 'Oldest') {
        sortedVideos.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      }
      console.log(`Filtered ${category} Videos:`, sortedVideos);
      if (category === 'Finance') {
        setFilteredFinanceVideos(sortedVideos);
      } else if (category === 'Health') {
        setFilteredHealthVideos(sortedVideos);
      }
    },
    []
  );

  // --- Effect to re-apply filter when activeFilters or source videos change ---
  useEffect(() => {
    applyFilter('Finance', activeFilters.Finance, financeVideos);
  }, [activeFilters.Finance, financeVideos, applyFilter]);

  useEffect(() => {
    applyFilter('Health', activeFilters.Health, healthVideos);
  }, [activeFilters.Health, healthVideos, applyFilter]);

  // --- Filter Button Handler ---
  const handleFilter = (category, filter) => {
    setActiveFilters((prev) => ({ ...prev, [category]: filter }));
  };

  // --- Utility: Extract YouTube Video ID ---
  const extractVideoId = (embedUrl) => {
    if (!embedUrl || typeof embedUrl !== 'string') {
      console.warn('Invalid embedUrl:', embedUrl);
      return null;
    }
    try {
      const url = new URL(embedUrl);
      if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
        if (url.pathname.startsWith('/embed/')) {
          return url.pathname.split('/embed/')[1]?.split('?')[0];
        }
        if (url.pathname === '/watch') {
          return url.searchParams.get('v');
        }
        if (url.hostname === 'youtu.be') {
          return url.pathname.substring(1);
        }
      }
      return null;
    } catch (e) {
      console.error('Error parsing URL:', embedUrl, e);
      return null;
    }
  };

  // --- Share Logic ---
  const handleShare = (embedUrl) => {
    const videoId = extractVideoId(embedUrl);
    if (videoId) {
      const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
      navigator.clipboard
        .writeText(watchUrl)
        .then(() => showToast('Video URL copied to clipboard!'))
        .catch(() => showToast('Failed to copy URL.'));
    } else {
      showToast('Invalid video URL');
    }
  };

  // --- Toast Notification ---
  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.innerText = message;
    toast.className =
      'fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-2 rounded-md shadow-lg text-sm opacity-0 transition-opacity duration-300 ease-out z-50';
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 3000);
  };

  // --- Utility: Format Date ---
  const formatDate = (dateString) => {
    if (!dateString) return 'Date unavailable';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      console.error('Error formatting date:', dateString, e);
      return 'Invalid date';
    }
  };

  // --- Video Card Component ---
  const VideoCard = ({ video, activeVideoId, setActiveVideoId }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoId = extractVideoId(video.embedUrl || '');
    const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
    const isHovered = activeVideoId === video._id;

    const handlePlayClick = () => {
      if (videoId) {
        setIsPlaying(true);
      }
    };

    return (
      <div
        className="flex flex-col rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 h-full cursor-pointer"
        onMouseEnter={() => setActiveVideoId(video._id)}
        onMouseLeave={() => setActiveVideoId(null)}
        onClick={handlePlayClick}
      >
        {/* Video Player or Thumbnail */}
        <div className="w-full relative" style={{ paddingBottom: '56.25%', height: 0, backgroundColor: '#f3f4f6' }}>
          {videoId && isPlaying ? (
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title={video.title || 'YouTube video player'}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : videoId && thumbnailUrl ? (
            <div
              className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-cover bg-center"
              style={{ backgroundImage: `url(${thumbnailUrl})` }}
            >
              <div className="relative z-10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-16 h-16 text-white opacity-80 hover:opacity-100 transition-opacity duration-200"
                  style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.5))' }}
                >
                  <path
                    fillRule="evenodd"
                    d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm14.024-.983a1.125 1.125 0 010 1.966l-5.603 3.113A1.125 1.125 0 018.25 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="absolute top-0 left-0 w-full h-full bg-black opacity-20 group-hover:opacity-30 transition-opacity" />
            </div>
          ) : (
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
              Video unavailable
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="bg-white p-4 flex flex-col flex-grow justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-800 truncate flex-1 mr-2">
                {video.title || 'Untitled'}
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(video.embedUrl);
                }}
                className="flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium flex items-center opacity-80 hover:opacity-100 transition-opacity"
                style={{ backgroundColor: 'rgba(119, 52, 227, 0.1)', color: '#7734E3' }}
                aria-label={`Share video: ${video.title || 'Untitled'}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 mr-1"
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
            <p className="text-sm text-gray-600 mb-3 line-clamp-3 flex-grow">
              {video.description || 'No description available.'}
            </p>
          </div>

          <div className="flex justify-between items-center mt-auto">
            <span className="text-xs text-gray-500">{formatDate(video.createdAt)}</span>
            <span
              className="text-xs font-medium px-2 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(119, 52, 227, 0.1)', color: '#7734E3' }}
            >
              {video.category || 'EduHub'}
            </span>
          </div>

          {isHovered && videoId && (
            <div className="mt-3 pt-2 border-t border-gray-100 flex justify-end">
              <a
                href={`https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-xs font-medium text-purple-600 hover:text-purple-800 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Watch on YouTube
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 ml-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- Loading Skeleton Component ---
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2].map((i) => (
        <div key={i} className="flex flex-col rounded-xl overflow-hidden shadow-lg h-full">
          <div
            className="w-full bg-gray-200 animate-pulse"
            style={{
              paddingBottom: '56.25%',
              height: 0,
              background: 'linear-gradient(110deg, #ececec 8%, #f5f5f5 18%, #ececec 33%)',
              backgroundSize: '200% 100%',
              animation: 'shine 1.5s linear infinite',
            }}
          />
          <div className="bg-white p-4 flex flex-col flex-grow justify-between">
            <div>
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-full mb-1 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-full mb-3 animate-pulse" />
            </div>
            <div className="flex justify-between mt-auto">
              <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/6 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
      <style>
        {`
          @keyframes shine {
            to {
              background-position: -200% 0;
            }
          }
        `}
      </style>
    </div>
  );

  // --- Category Section Component ---
  const CategorySection = ({ videos, category, path, isLoading, error }) => {
    const [activeVideoId, setActiveVideoId] = useState(null);

    return (
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
            />
          </div>

          {videos.length > 0 && (
            <Link
              to={`/edu-hub/${path}`}
              className="text-purple-700 hover:text-purple-900 font-medium flex items-center transition-colors duration-200"
              style={{ color: '#7734E3' }}
              onClick={() => window.scrollTo(0, 0)}
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

        <div className="mb-4 flex flex-wrap gap-3">
          {['All', 'Latest', 'Oldest'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleFilter(category, tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 ${
                activeFilters[category] === tab
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              aria-pressed={activeFilters[category] === tab}
            >
              {tab}
            </button>
          ))}
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="flex items-center justify-center h-40 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-red-600 text-center">{error}</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="flex items-center justify-center h-40 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-gray-500">No videos available in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.slice(0, 2).map((video) => (
              <VideoCard
                key={video._id}
                video={video}
                activeVideoId={activeVideoId}
                setActiveVideoId={setActiveVideoId}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // --- Top-Level Error UI ---
  if (errorCategories.Finance && errorCategories.Health && !loadingCategories.Finance && !loadingCategories.Health) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-800 p-4">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Error Loading EduHub</h2>
        <p className="mb-6 text-gray-700 text-center">
          {errorCategories.Finance === errorCategories.Health
            ? errorCategories.Finance
            : `${errorCategories.Finance} (Finance) | ${errorCategories.Health} (Health)`}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
        >
          Try Again
        </button>
      </div>
    );
  }

  // --- Map tab names to their respective routes ---
  const tabRoutes = {
    All: '/edu-hub',
    Finance: '/edu-hub/finance',
    Health: '/edu-hub/health',
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="relative inline-block mb-12">
          <h1 className="text-4xl md:text-5xl font-bold relative z-10">EduHub</h1>
          <div
            className="absolute -bottom-3 left-0 right-0 h-4 bg-purple-100 z-0"
            style={{
              backgroundColor: 'rgba(119, 52, 227, 0.15)',
            }}
          />
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
                onClick={() => window.scrollTo(0, 0)}
              >
                {tab}
              </Link>
            ))}
          </div>
        </div>

        <CategorySection
          videos={filteredFinanceVideos}
          category="Finance"
          path="finance"
          isLoading={loadingCategories.Finance}
          error={errorCategories.Finance}
        />
        <CategorySection
          videos={filteredHealthVideos}
          category="Health"
          path="health"
          isLoading={loadingCategories.Health}
          error={errorCategories.Health}
        />
      </div>
    </div>
  );
};

export default Eduhub;
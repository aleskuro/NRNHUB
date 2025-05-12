import React, { useEffect, useState, useCallback } from 'react';
// You might need to import icons or use inline SVGs for the play button
// For this example, I'll use a simple SVG and Tailwind classes.

const Interview = () => {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // activeVideoId is still useful for card highlighting or showing extra info on hover
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  // --- Data Fetching Effect ---
  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:5000/api/videos/category/Interview');
        if (!response.ok) {
          throw new Error(`Failed to fetch videos: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setVideos(data);
        applyFilter(activeFilter, data); // Apply initial filter to fetched data
      } catch (error) {
        console.error('Error fetching videos:', error);
        setError(error.message || 'An unexpected error occurred.');
        setVideos([]);
        setFilteredVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // --- Filtering/Sorting Logic ---
  const applyFilter = useCallback((filter, videosToFilter = videos) => {
    let sortedVideos = [...videosToFilter];
    if (filter === 'Latest') {
      sortedVideos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (filter === 'Oldest') {
      sortedVideos.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    setFilteredVideos(sortedVideos);
  }, [videos]);

  // --- Effect to re-apply filter when activeFilter changes ---
  useEffect(() => {
      applyFilter(activeFilter);
  }, [activeFilter, applyFilter]);

  // --- Filter Button Handler ---
  const handleFilter = (filter) => {
    setActiveFilter(filter);
  };

  // --- Utility: Extract YouTube Video ID ---
   const extractVideoId = (embedUrl) => {
     if (!embedUrl || typeof embedUrl !== 'string') return null;
     try {
        const url = new URL(embedUrl);
         if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
             // Handle embed URLs like https://www.youtube.com/embed/VIDEO_ID
             if (url.pathname.startsWith('/embed/')) {
                 return url.pathname.split('/embed/')[1]?.split('?')[0];
             }
             // Handle watch URLs like https://www.youtube.com/watch?v=VIDEO_ID
             if (url.pathname === '/watch') {
                 return url.searchParams.get('v');
             }
              // Handle short URLs like https://youtu.be/VIDEO_ID
             if (url.hostname === 'youtu.be') {
                 return url.pathname.substring(1); // Remove the leading slash
             }
         }
     } catch (e) {
         console.error("Invalid URL:", embedUrl);
         return null;
     }
     return null; // Return null if no valid ID found
   };


  // --- Share Logic ---
  const handleShare = (embedUrl) => {
    const videoId = extractVideoId(embedUrl);
    if (videoId) {
      const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
      navigator.clipboard.writeText(watchUrl)
        .then(() => {
          showToast('Video URL copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy URL:', err);
          showToast('Failed to copy URL.');
        });
    } else {
      showToast('Invalid video URL');
    }
  };

  // --- Toast Notification ---
  const showToast = (message) => {
    // (Keep your existing showToast function or the one from the previous response)
    const toast = document.createElement('div');
    toast.innerText = message;
    toast.className = 'fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-2 rounded-md shadow-lg text-sm opacity-0 transition-opacity duration-300 ease-out z-50';

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.addEventListener('transitionend', () => {
        toast.remove();
      }, { once: true });
    }, 3000);
  };

  // --- Utility: Format Date ---
  const formatDate = (dateString) => {
    if (!dateString) return 'Date unavailable';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
          return 'Invalid date';
      }
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    } catch (e) {
      console.error("Error formatting date:", e);
      return 'Invalid date';
    }
  };

  // --- NEW Video Card Component (Internal) ---
  const VideoCard = ({ video }) => {
    // State to control if the video is currently playing (iframe is loaded)
    const [isPlaying, setIsPlaying] = useState(false);

    const videoId = extractVideoId(video.embedUrl || '');
    // Use a reliable thumbnail URL format if videoId is available
    const thumbnailUrl = videoId ? `http://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;

    const isHovered = activeVideoId === video._id;

    // Function to handle click on the thumbnail/play button area
    const handlePlayClick = () => {
      if (videoId) {
        setIsPlaying(true);
      }
    };

    return (
      <div
        className="flex flex-col rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 h-full cursor-pointer" // Add cursor-pointer
        onMouseEnter={() => setActiveVideoId(video._id)}
        onMouseLeave={() => setActiveVideoId(null)}
        onClick={handlePlayClick} // Handle click to play on the whole card area if desired
      >
        {/* Video Player or Thumbnail with Play Button */}
        <div className="w-full relative" style={{ paddingBottom: '56.25%', height: 0, backgroundColor: '#f3f4f6' }}>
          {videoId && isPlaying ? (
             // Render iframe only when isPlaying is true
             <iframe
               className="absolute top-0 left-0 w-full h-full"
               // Use the standard embed URL format
               src={`https://www.youtube.com/embed/${videoId}?autoplay=1`} // Add autoplay=1
               title={video.title || 'YouTube video player'}
               frameBorder="0"
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
               allowFullScreen
             ></iframe>
          ) : videoId && thumbnailUrl ? (
            // Show thumbnail with play button if videoId is available but not playing
            <div
              className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-cover bg-center"
              style={{ backgroundImage: `url(${thumbnailUrl})` }}
            >
              {/* Play Button Overlay */}
              <div className="relative z-10">
                 <svg
                   xmlns="http://www.w3.org/2000/svg"
                   viewBox="0 0 24 24"
                   fill="currentColor"
                   className="w-16 h-16 text-white opacity-80 hover:opacity-100 transition-opacity duration-200"
                   style={{ dropShadow: '0 2px 5px rgba(0,0,0,0.5)' }} // Simple visual lift for the icon
                 >
                   <path
                     fillRule="evenodd"
                     d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm14.024-.983a1.125 1.125 0 010 1.966l-5.603 3.113A1.125 1.125 0 018.25 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113z"
                     clipRule="evenodd"
                   />
                 </svg>
              </div>
              {/* Dark overlay */}
               <div className="absolute top-0 left-0 w-full h-full bg-black opacity-20 group-hover:opacity-30 transition-opacity"></div> {/* Optional: slight overlay darker on hover */}
            </div>
          ) : (
             // Show simple placeholder if no videoId or thumbnail
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
              <p>Video unavailable.</p>
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="bg-white p-4 flex flex-col flex-grow justify-between">
          <div> {/* Container for title and share */}
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-800 truncate flex-1 mr-2">{video.title || 'Untitled'}</h3>
              <button
                onClick={(e) => { // Prevent click on button from triggering card play
                  e.stopPropagation();
                  handleShare(video.embedUrl);
                }}
                className="flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium flex items-center opacity-80 hover:opacity-100 transition-opacity"
                style={{ backgroundColor: 'rgba(119, 52, 227, 0.1)', color: '#7734E3' }}
                aria-label={`Share video: ${video.title || 'Untitled'}`}
                title={`Share video: ${video.title || 'Untitled'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-3 flex-grow">{video.description || 'No description available.'}</p>
          </div>

          {/* Meta Info */}
          <div className="flex justify-between items-center mt-auto">
            <span className="text-xs text-gray-500">{formatDate(video.createdAt)}</span>
            <span
              className="text-xs font-medium px-2 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(119, 52, 227, 0.1)', color: '#7734E3' }}
            >
              {video.category || 'Interview'}
            </span>
          </div>

          {/* Watch on YouTube Link (still appears on card hover, independent of playing state) */}
          {isHovered && videoId && (
             <div className="mt-3 pt-2 border-t border-gray-100 flex justify-end">
               <a
                 href={`https://www.youtube.com/watch?v=${videoId}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="flex items-center text-xs font-medium text-purple-600 hover:text-purple-800 transition-colors"
                 title={`Watch "${video.title || 'Untitled'}" on YouTube`}
                 onClick={(e) => e.stopPropagation()} // Prevent clicking this link from also triggering card play
               >
                 Watch on YouTube
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                 </svg>
               </a>
             </div>
           )}
        </div>
      </div>
    );
  };

  // --- Loading Skeleton Component (Internal) ---
  const LoadingSkeleton = () => (
     // (Keep your existing LoadingSkeleton component as it doesn't need changes for this issue)
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       {[1, 2, 3, 4].map((i) => (
         <div key={i} className="flex flex-col rounded-xl overflow-hidden shadow-lg h-full">
           {/* Skeleton for Video/Thumbnail area */}
           <div
             className="w-full bg-gray-200 animate-pulse"
             style={{
               paddingBottom: '56.25%', // 16:9 aspect ratio
               height: 0,
               background: 'linear-gradient(110deg, #ececec 8%, #f5f5f5 18%, #ececec 33%)',
               backgroundSize: '200% 100%',
               animation: 'shine 1.5s linear infinite',
             }}
           ></div>
           {/* Skeleton for Card Content */}
           <div className="bg-white p-4 flex flex-col flex-grow justify-between">
              <div>
                 <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                 <div className="h-4 bg-gray-200 rounded w-full mb-1 animate-pulse"></div>
                 <div className="h-4 bg-gray-200 rounded w-full mb-3 animate-pulse"></div>
              </div>
             <div className="flex justify-between mt-auto">
               <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
               <div className="h-4 bg-gray-200 rounded w-1/6 animate-pulse"></div>
             </div>
           </div>
         </div>
       ))}
       <style>{`
         @keyframes shine {
           to {
             background-position: -200% 0;
           }
         }
       `}</style>
     </div>
   );


  // --- Render Logic ---
  if (error) {
     // (Keep your existing Error display)
     return (
       <div className="flex flex-col items-center justify-center h-screen text-gray-800 p-4">
         <h2 className="text-2xl font-bold mb-4 text-red-600">Error Loading Videos</h2>
         <p className="mb-6 text-gray-700 text-center">{error}</p>
         <button
           onClick={() => window.location.reload()}
           className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
         >
           Try Again
         </button>
       </div>
     );
   }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">Interview Videos</h1>
          <div className="h-1 bg-purple-500 mt-2 rounded w-24"></div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-8 flex flex-wrap gap-3">
          {['All', 'Latest', 'Oldest'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50
                ${activeFilter === tab
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              aria-pressed={activeFilter === tab}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Area (Loading, Empty, or Videos) */}
        {loading ? (
          <LoadingSkeleton />
        ) : filteredVideos.length === 0 ? (
          <div className="flex items-center justify-center h-48 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 text-lg">No interview videos available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredVideos.map((video) => (
              <VideoCard key={video._id || video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Interview;
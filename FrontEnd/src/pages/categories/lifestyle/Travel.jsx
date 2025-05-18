import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useFetchBlogsQuery } from '../../../Redux/features/blogs/blogApi';
import { fetchAdsFromServer } from '../../../Redux/features/ads/adThunks';
import axios from 'axios';
import { toast } from 'react-toastify';
import noImage from '../../../assets/images.png';
import { Clock, BookOpen, Heart, Share2 } from 'lucide-react';
import { Helmet } from 'react-helmet';

const API_URL = import.meta.env.VITE_API_URL;

// AdSpace Component
const AdSpace = ({ adType, className, positionLabel }) => {
  const { adImages, adLinks, visibility } = useSelector((state) => state.ads);
  const isVisible = visibility?.[adType] ?? false;
  const image = adImages?.[adType];
  const link = adLinks?.[adType];

  useEffect(() => {
    console.log(`AdSpace ${adType}:`, {
      isVisible,
      image,
      link,
      visibilityState: visibility,
      allAdImages: adImages,
      allAdLinks: adLinks,
    });
  }, [isVisible, image, link, visibility, adImages, adLinks]);

  if (!isVisible) {
    console.log(`AdSpace ${adType} not visible: visibility=${isVisible}`);
    return null;
  }

  if (!image) {
    console.log(`AdSpace ${adType} is visible but has no image set in state`);
    return (
      <div className={`w-full bg-gray-100 rounded-xl overflow-hidden shadow-md flex items-center justify-center py-8 ${className || ''}`}>
        <div className="text-center p-6">
          <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Advertisement</div>
          <div className="text-gray-700 font-semibold text-lg">{positionLabel} Ad Placement</div>
          <div className="text-gray-500 text-sm mt-2">Advertise with Us</div>
          <a href="/advertise" className="mt-4 inline-block text-[#7734E3] hover:text-[#6828C2] text-sm font-medium">Learn More →</a>
        </div>
      </div>
    );
  }

  const isValidUrl = image && (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/'));
  if (!isValidUrl) {
    console.log(`Invalid ad image URL for ${adType}: ${image}`);
    return null;
  }

  console.log(`AdSpace ${adType} rendering with image: ${image}`);
  const handleAdClick = () => console.log(`Ad clicked: ${adType}, Link: ${link}`);
  return (
    <div className={`w-full rounded-xl overflow-hidden shadow-md ${className || ''}`}>
      {link ? (
        <a href={link} target="_blank" rel="noopener noreferrer" onClick={handleAdClick}>
          <img
            src={image}
            alt={`${positionLabel} Ad`}
            className="w-full h-auto max-w-[1152px] mx-auto rounded-xl object-contain"
            style={{ maxWidth: '100%' }}
            loading="lazy"
            onError={(e) => {
              console.error(`Failed to load ad image for ${adType}: ${image}`);
              e.target.src = noImage;
            }}
          />
        </a>
      ) : (
        <img
          src={image}
          alt={`${positionLabel} Ad`}
          className="w-full h-auto max-w-[1152px] mx-auto rounded-xl object-contain"
          style={{ maxWidth: '100%' }}
          loading="lazy"
          onError={(e) => {
            console.error(`Failed to load ad image for ${adType}: ${image}`);
            e.target.src = noImage;
          }}
        />
      )}
    </div>
  );
};

// BlogCard Component
const BlogCard = ({ blog, truncateTitle, getReadTime, getAuthorName, getCategoryColor, formatDate }) => (
  <Link
    to={`/blogs/${blog._id}`}
    className="block group"
    onClick={() => window.scrollTo(0, 0)}
  >
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
      <div className="relative">
        <img
          src={blog.coverImg || noImage}
          alt={blog.title}
          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => (e.target.src = noImage)}
        />
        <div className={`absolute top-3 left-3 ${getCategoryColor(blog.category)} text-white text-xs px-2 py-1 rounded-full`}>
          {blog.category || 'TRAVEL'}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5">
          <div className="text-white font-medium">Read full article</div>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[#7734E3] transition-colors">
          {truncateTitle(blog.title, 60)}
        </h3>
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <Clock size={14} className="mr-1" />
          <span className="mr-3">{getReadTime(blog)}</span>
          <span>By {getAuthorName(blog.author)}</span>
        </div>
        <p className="text-gray-600 line-clamp-2 mb-4">{blog.description || 'Discover more by diving in...'}</p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">{formatDate(blog.createdAt)}</span>
          <div className="flex items-center">
            <div className="flex items-center text-sm mr-4">
              <Heart size={14} className="mr-1 text-rose-500" />
              <span>{blog.likes || 0}</span>
            </div>
            <div className="flex items-center text-sm">
              <Share2 size={14} className="mr-1 text-blue-500" />
              <span>{blog.shares || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Link>
);

// FeaturedBlogCard Component
const FeaturedBlogCard = ({ blog, truncateTitle, getReadTime, getAuthorName, getCategoryColor, formatDate }) => (
  <Link
    to={`/blogs/${blog?._id}`}
    className="block group rounded-2xl overflow-hidden shadow-xl transform hover:scale-[1.01] transition-transform duration-300"
    onClick={() => window.scrollTo(0, 0)}
  >
    <div className="relative">
      <img
        src={blog?.coverImg || noImage}
        alt={blog?.title || 'Featured blog image'}
        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
        onError={(e) => (e.target.src = noImage)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
      <div className="absolute bottom-0 left-0 p-4 text-white">
        <span className={`${getCategoryColor(blog?.category)} text-white text-xs px-3 py-1 rounded-full font-medium mb-2 inline-block`}>
          {blog?.category || 'TRAVEL'}
        </span>
        <h3 className="text-lg font-bold line-clamp-2 mb-1">{truncateTitle(blog?.title, 40)}</h3>
        <div className="flex items-center text-xs text-gray-300">
          <Clock size={12} className="mr-1" />
          <span>{getReadTime(blog)}</span>
        </div>
      </div>
    </div>
  </Link>
);

// CompactBlogCard for Suggested Blogs
const CompactBlogCard = ({ blog, truncateTitle, getCategoryColor }) => (
  <Link
    to={`/blogs/${blog._id}`}
    className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-r from-gray-50 to-gray-100"
    onClick={() => window.scrollTo(0, 0)}
  >
    <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
      <img
        src={blog.coverImg || noImage}
        alt={blog.title || 'Blog Image'}
        className="w-full h-full object-cover"
        onError={(e) => (e.target.src = noImage)}
      />
    </div>
    <div className="flex-grow">
      <h4 className="text-lg font-semibold text-blue-700 mb-2">
        {(blog.title || 'Untitled').substring(0, 70)}{blog.title?.length > 70 ? '...' : ''}
      </h4>
      <p className="text-gray-600 text-sm">
        {(blog.description || 'No description available').substring(0, 100)}...
      </p>
      <div className="mt-2">
        <span className={`inline-block ${getCategoryColor(blog.category)} text-white text-xs px-2 py-1 rounded-full`}>
          {blog.category || 'General'}
        </span>
      </div>
    </div>
  </Link>
);

const Travel = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Fetch blogs using RTK Query
  const { data: blogs = [], error, isLoading } = useFetchBlogsQuery({ search: '', category: '' });
  const { adImages, adLinks, visibility } = useSelector((state) => state.ads);

  // Fetch ads on mount
  useEffect(() => {
    console.log('Fetching ads for Travel page...');
    dispatch(fetchAdsFromServer())
      .unwrap()
      .then((data) => console.log('Ads fetched successfully:', data))
      .catch((err) => {
        console.error('Error fetching ads:', err);
        toast.error(`Failed to fetch ads: ${err.message || 'Unknown error'}`);
      });
  }, [dispatch]);

  // Debug ad state
  useEffect(() => {
    console.log('Current ads state for Travel:', {
      adImages,
      adLinks,
      visibility,
      keyAds: {
        lifestyle1: { image: adImages?.lifestyle1, link: adLinks?.lifestyle1, visible: visibility?.lifestyle1 },
        lifestyle2: { image: adImages?.lifestyle2, link: adLinks?.lifestyle2, visible: visibility?.lifestyle2 },
      },
    });
  }, [adImages, adLinks, visibility]);

  // Filter and sort travel blogs, and get suggested blogs
  const { travelBlogs, featuredBlog, suggestedBlogs } = useMemo(() => {
    const filteredTravelBlogs = blogs
      .filter((blog) => blog.category?.toUpperCase() === 'TRAVEL')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const travelBlogIds = new Set(filteredTravelBlogs.map((blog) => blog._id));
    const otherBlogs = blogs
      .filter((blog) => !travelBlogIds.has(blog._id) && blog.category?.toUpperCase() !== 'TRAVEL')
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    return {
      travelBlogs: filteredTravelBlogs,
      featuredBlog: filteredTravelBlogs[0],
      suggestedBlogs: otherBlogs,
    };
  }, [blogs]);

  // Utility functions
  const truncateTitle = useCallback((title, maxLength = 60) => {
    if (!title) return 'Untitled';
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength - 3) + '...';
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Recently published';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid date';
    }
  }, []);

  const getReadTime = useCallback((blog) => {
    try {
      if (blog?.readCount > 0 && blog?.readTime > 0) {
        const avgReadTimeSeconds = blog.readTime / blog.readCount;
        const minutes = Math.max(1, Math.round(avgReadTimeSeconds / 60));
        return minutes + ' min read';
      }
      let wordCount = 500;
      if (blog?.content && blog.content.type === 'quill' && typeof blog.content.data === 'string') {
        const plainTextContent = blog.content.data.replace(/<[^>]*>/g, '');
        wordCount = plainTextContent.split(/\s+/).filter((word) => word.length > 0).length;
      } else if (blog?.description && typeof blog.description === 'string') {
        wordCount = blog.description.split(/\s+/).filter((word) => word.length > 0).length;
      }
      const wordsPerMinute = 200;
      const minutes = Math.max(1, Math.round(wordCount / wordsPerMinute));
      return minutes + ' min read';
    } catch (error) {
      console.error('Error calculating read time for blog:', blog?._id, error);
      return '3 min read';
    }
  }, []);

  const getAuthorName = useCallback((author) => {
    if (!author) return 'Editor';
    if (typeof author === 'string') return author;
    if (typeof author === 'object') {
      return author.email || author.name || author.username || 'Editor';
    }
    return 'Editor';
  }, []);

  const categoryColors = useMemo(
    () => ({
      technology: 'bg-blue-600',
      travel: 'bg-emerald-600',
      food: 'bg-amber-600',
      lifestyle: 'bg-rose-600',
      fashion: 'bg-violet-600',
      health: 'bg-teal-600',
      finance: 'bg-orange-600',
      entertainment: 'bg-red-600',
      cars: 'bg-indigo-600',
      general: 'bg-[#7734E3]',
      default: 'bg-[#7734E3]',
    }),
    []
  );

  const getCategoryColor = useCallback(
    (category) => {
      const normalizedCategory = category?.toLowerCase();
      return categoryColors[normalizedCategory] || categoryColors.default;
    },
    [categoryColors]
  );

  // Subscription handler
  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      setEmailError('Please enter an email address');
      toast.error('Please enter an email address');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      toast.error('Please enter a valid email address');
      return;
    }
    setEmailError('');
    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/subscribers`, { email });
      toast.success('Successfully subscribed to the newsletter!');
      setEmail('');
    } catch (error) {
      console.log('Subscription attempt:', { email, error: error.response?.data });
      const message =
        error.response?.status === 429
          ? 'Too many attempts, please try again later.'
          : error.response?.data?.message || 'Failed to subscribe. Please try again.';
      setEmailError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#E6F0FA] to-[#F3E8FF] min-h-screen text-gray-800">
      <Helmet>
        <link rel="canonical" href="http://localhost:5173/travel" />
        <title>Travel Blogs | NRNHUB</title>
        <meta name="description" content="Explore breathtaking destinations, cultural adventures, and insider travel tips with our travel blog." />
      </Helmet>

      {/* Hero Banner Section */}
      <div className="relative py-16 bg-gradient-to-r from-[#883FFF] to-[#6023BB] rounded-b-2xl overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-white/30 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/20 blur-3xl"></div>
          <div className="absolute top-1/4 right-1/4 w-48 h-48 rounded-full bg-white/20 blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-40 h-40 rounded-full bg-white/20 blur-3xl opacity-50"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="md:flex items-center justify-between gap-12">
            <div className="md:w-7/12 mb-10 md:mb-0 text-center md:text-left">
              <span className="inline-block px-4 py-1 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
                Wanderlust Wonders
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white leading-tight">
                Travel <span className="text-purple-200">Blogs</span>
              </h1>
              <p className="text-lg md:text-xl text-purple-100 max-w-xl mx-auto md:mx-0 leading-relaxed">
                Discover stories that inspire wanderlust and guide your next unforgettable trip with our travel blog.
              </p>
            </div>
            <div className="md:w-5/12 flex justify-center md:justify-end">
              {isLoading && (
                <div className="w-full max-w-sm h-64 bg-purple-300/30 rounded-2xl animate-pulse flex items-center justify-center">
                  <span className="text-purple-200">Loading Featured...</span>
                </div>
              )}
              {!isLoading && !featuredBlog && (
                <div className="w-full max-w-sm h-64 bg-purple-300/30 rounded-2xl flex items-center justify-center">
                  <span className="text-purple-200 text-center p-4">No featured article available.</span>
                </div>
              )}
              {!isLoading && featuredBlog && (
                <div className="relative w-full max-w-sm">
                  <FeaturedBlogCard
                    blog={featuredBlog}
                    truncateTitle={truncateTitle}
                    getReadTime={getReadTime}
                    getAuthorName={getAuthorName}
                    getCategoryColor={getCategoryColor}
                    formatDate={formatDate}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Articles Section */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Articles List */}
          <div className="lg:w-2/3">
            {isLoading && (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#7734E3] mx-auto"></div>
                <p className="mt-4 text-lg text-gray-600">Loading travel blogs...</p>
              </div>
            )}
            {error && (
              <div className="p-8 text-center bg-red-50 rounded-xl text-red-600 my-8">
                <h3 className="text-xl font-bold mb-2">Oops! Something went wrong.</h3>
                <p>{error.message || 'Failed to load articles. Please try again later.'}</p>
              </div>
            )}
            {!isLoading && !error && travelBlogs.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen size={40} className="text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No blogs found</h3>
                <p className="text-gray-600 mb-6">We couldn't find any blogs in the travel category.</p>
                <Link
                  to="/blogs"
                  className="inline-block px-6 py-3 bg-[#7734E3] text-white rounded-lg hover:bg-[#6828C2] transition-colors"
                >
                  Browse all blogs
                </Link>
              </div>
            )}
            {!isLoading && !error && travelBlogs.length > 0 && (
              <>
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-6">
                  Latest Travel Blogs
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  {travelBlogs.map((blog) => (
                    <BlogCard
                      key={blog._id || blog.id}
                      blog={blog}
                      truncateTitle={truncateTitle}
                      getReadTime={getReadTime}
                      getAuthorName={getAuthorName}
                      getCategoryColor={getCategoryColor}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3">
            <div className="sticky top-6 space-y-8">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="bg-[#7734E3] w-2 h-6 mr-2 rounded-sm inline-block"></span>
                  Sponsored Content
                </h2>
                <AdSpace adType="lifestyle1" positionLabel="First" className="mb-6 w-full" />
                <AdSpace adType="lifestyle2" positionLabel="Second" className="mb-6 w-full" />
              </div>
              {suggestedBlogs.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-rose-600 mb-6">
                    You Might Also Like
                  </h2>
                  <div className="space-y-6">
                    {suggestedBlogs.map((blog) => (
                      <CompactBlogCard
                        key={blog._id}
                        blog={blog}
                        truncateTitle={truncateTitle}
                        getCategoryColor={getCategoryColor}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-white shadow-md rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Explore Other Categories</h3>
                <div className="flex flex-wrap gap-3">
                  {Object.keys(categoryColors).map((cat) => (
                    <Link
                      key={cat}
                      to={`/category/${cat}`}
                      className={`px-4 py-2 rounded-full text-sm ${
                        cat.toLowerCase() === 'travel'
                          ? `${getCategoryColor(cat)} text-white`
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      } transition-colors capitalize`}
                      onClick={() => window.scrollTo(0, 0)}
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-r from-[#7734E3] to-[#5E30B2] rounded-xl shadow-sm p-6 text-white">
                <h3 className="text-lg font-bold mb-2">Stay Updated</h3>
                <p className="text-sm mb-4 text-purple-100">
                  Get the latest travel tips and stories delivered to your inbox.
                </p>
                <form onSubmit={handleSubscribe} className="flex flex-col gap-3" aria-label="Newsletter Subscription">
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError('');
                      }}
                      className={`w-full px-4 py-2 rounded-lg bg-white text-gray-800 border-2 ${
                        emailError ? 'border-red-400' : 'border-white'
                      } focus:outline-none focus:ring-2 focus:ring-purple-300 placeholder-gray-400`}
                      disabled={isSubmitting}
                      aria-invalid={!!emailError}
                      aria-describedby={emailError ? 'email-error' : undefined}
                    />
                    {emailError && (
                      <p id="email-error" className="text-xs text-red-200 mt-1">
                        {emailError}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="bg-white text-[#7734E3] px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors border-2 border-white focus:outline-none focus:ring-2 focus:ring-purple-300 disabled:opacity-50"
                    disabled={isSubmitting}
                    aria-label={isSubmitting ? 'Subscribing in progress' : 'Subscribe to newsletter'}
                  >
                    {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Suggested Blogs Section */}
        {suggestedBlogs.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-rose-600 mb-6">
              Explore More Topics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {suggestedBlogs.map((blog) => (
                <CompactBlogCard
                  key={blog._id}
                  blog={blog}
                  truncateTitle={truncateTitle}
                  getCategoryColor={getCategoryColor}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Promo */}
      <div className="bg-gray-100 py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Want to Explore More?</h2>
            <p className="text-lg text-gray-600 mb-6">
              Check out our other categories for more inspiring articles and stay connected with the latest trends.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/lifestyle"
                className="bg-[#7734E3] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#6828C2] transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                onClick={() => window.scrollTo(0, 0)}
              >
                Explore Lifestyle
              </Link>
              <Link
                to="/economy"
                className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                onClick={() => window.scrollTo(0, 0)}
              >
                Economy Insights
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>
        {`
          .line-clamp-1 {
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}
      </style>
    </div>
  );
};

export default Travel;
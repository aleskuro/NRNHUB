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
    className="block group hover:transform hover:scale-[1.01] transition-all duration-300"
    onClick={() => window.scrollTo(0, 0)}
  >
    <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-sm overflow-hidden mb-6 hover:shadow-md transition-shadow border border-purple-100">
      <div className="relative h-48 w-full">
        <img
          src={blog.coverImg || noImage}
          alt={blog.title}
          className="w-full h-full object-cover"
          onError={(e) => (e.target.src = noImage)}
        />
        <span
          className={`absolute top-4 left-4 ${getCategoryColor(
            blog.category
          )} text-white text-xs px-3 py-1 rounded-full font-medium bg-opacity-80 backdrop-blur-sm`}
        >
          {blog.category}
        </span>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-[#7734E3] transition-colors">
          {truncateTitle(blog.title, 60)}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{blog.description || 'Discover more by diving in...'}</p>
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <Clock size={14} className="mr-1" />
          <span className="mr-4">{getReadTime(blog)}</span>
          <BookOpen size={14} className="mr-1" />
          <span>By {getAuthorName(blog.author)}</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-500">
            <span className="text-gray-400">{formatDate(blog.createdAt)}</span>
          </div>
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
    className="block group rounded-2xl overflow-hidden shadow-xl transform rotate-2 hover:rotate-0 transition-transform duration-300"
    onClick={() => window.scrollTo(0, 0)}
  >
    <div className="relative">
      <img
        src={blog?.coverImg || noImage}
        alt={blog?.title || 'Featured blog image'}
        className="w-full h-64 object-cover"
        onError={(e) => (e.target.src = noImage)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
      <div className="absolute bottom-0 left-0 p-4 text-white">
        <span className={`${getCategoryColor(blog?.category)} text-white text-xs px-3 py-1 rounded-full font-medium mb-2 inline-block`}>
          {blog?.category || 'Article'}
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

// CompactBlogCard Component
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

const Lifestyle = () => {
  const dispatch = useDispatch();
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState('');

  const { data: blogs = [], error, isLoading } = useFetchBlogsQuery({ search: '', category: '' });
  const { adImages, adLinks, visibility } = useSelector((state) => state.ads);

  // Fetch ads on mount
  useEffect(() => {
    console.log('Fetching ads for Lifestyle page...');
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
    console.log('Current ads state for Lifestyle:', {
      adImages,
      adLinks,
      visibility,
      keyAds: {
        lifestyle1: { image: adImages?.lifestyle1, link: adLinks?.lifestyle1, visible: visibility?.lifestyle1 },
        lifestyle2: { image: adImages?.lifestyle2, link: adLinks?.lifestyle2, visible: visibility?.lifestyle2 },
      },
    });
  }, [adImages, adLinks, visibility]);

  const lifestyleSubcategories = useMemo(
    () => ['CULTURE', 'ENTERTAINMENT', 'FOOD', 'TRAVEL', 'HEALTH', 'SPORTS'],
    []
  );

  const { lifestyleBlogs, featuredBlog, suggestedBlogs } = useMemo(() => {
    const filteredLifestyleBlogs = blogs
      .filter((blog) => lifestyleSubcategories.includes(blog.category?.toUpperCase()))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const lifestyleBlogIds = new Set(filteredLifestyleBlogs.map((blog) => blog._id));
    const otherBlogs = blogs
      .filter((blog) => !lifestyleBlogIds.has(blog._id) && !lifestyleSubcategories.includes(blog.category?.toUpperCase()))
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    return {
      lifestyleBlogs: filteredLifestyleBlogs,
      featuredBlog: filteredLifestyleBlogs[0],
      suggestedBlogs: otherBlogs,
    };
  }, [blogs, lifestyleSubcategories]);

  const filteredBlogs = useMemo(() => {
    if (activeFilter === 'ALL') return lifestyleBlogs;
    return lifestyleBlogs.filter((blog) => blog.category?.toUpperCase() === activeFilter);
  }, [lifestyleBlogs, activeFilter]);

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
      culture: 'bg-rose-600',
      entertainment: 'bg-red-600',
      food: 'bg-amber-600',
      travel: 'bg-emerald-600',
      health: 'bg-teal-600',
      sports: 'bg-blue-600',
      default: 'bg-gray-600',
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
    <div className="bg-gray-50 min-h-screen text-gray-800">
      <Helmet>
        <link rel="canonical" href="http://localhost:5173/lifestyle" />
        <title>Lifestyle Blogs | NRNHUB</title>
        <meta
          name="description"
          content="Explore articles on culture, entertainment, food, travel, health, and sports, offering insights and inspiration for a vibrant life."
        />
      </Helmet>

      {/* Hero Banner Section */}
      <div className="relative py-20 bg-gradient-to-r from-[#883FFF] to-[#6023BB] overflow-hidden rounded-b-2xl">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-white/30 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/20 blur-3xl"></div>
          <div className="absolute top-1/4 right-1/4 w-48 h-48 rounded-full bg-white/20 blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-40 h-40 rounded-full bg-white/20 blur-3xl opacity-50"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="md:flex items-center justify-between gap-12">
            <div className="md:w-7/12 mb-10 md:mb-0 text-center md:text-left">
              <span className="inline-block px-4 py-1 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
                Dive into Inspiration
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white leading-tight">
                Lifestyle <span className="text-purple-200">Blog</span>
              </h1>
              <p className="text-lg md:text-xl text-purple-100 max-w-xl mx-auto md:mx-0 leading-relaxed">
                Explore articles on culture, entertainment, food, travel, health, and sports, offering insights and inspiration for a vibrant life.
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
                  <div className="absolute -top-4 -left-4 w-24 h-24 rounded-lg border-2 border-purple-300/30 hidden md:block"></div>
                  <FeaturedBlogCard
                    blog={featuredBlog}
                    truncateTitle={truncateTitle}
                    getReadTime={getReadTime}
                    getAuthorName={getAuthorName}
                    getCategoryColor={getCategoryColor}
                    formatDate={formatDate}
                  />
                  <div className="absolute -bottom-4 -right-4 bg-white/10 backdrop-blur-lg rounded-2xl p-3 w-40 border border-white/20 shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300 hidden md:block">
                    <div className="text-white text-sm font-medium">Top Story</div>
                    <div className="text-white/80 text-xs mt-1 line-clamp-1">
                      {featuredBlog ? truncateTitle(featuredBlog.title, 20) : 'New content'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Subcategories Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Lifestyle Subcategories</h2>
          <div className="flex flex-wrap gap-2">
            {lifestyleSubcategories.map((subcategory) => (
              <button
                key={subcategory}
                onClick={() => setActiveFilter(subcategory)}
                className={`px-4 py-2 rounded-full text-sm font-medium text-white ${getCategoryColor(
                  subcategory
                )} hover:opacity-90 transition-opacity`}
              >
                {subcategory.charAt(0) + subcategory.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8 flex flex-wrap justify-center">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap mx-1 my-1 transition-colors ${
              activeFilter === 'ALL'
                ? 'bg-[#7734E3] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            aria-pressed={activeFilter === 'ALL'}
          >
            All
          </button>
          {lifestyleSubcategories.map((subcategory) => (
            <button
              key={subcategory}
              onClick={() => setActiveFilter(subcategory)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap mx-1 my-1 transition-colors ${
                activeFilter === subcategory
                  ? `${getCategoryColor(subcategory)} text-white shadow-md`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              aria-pressed={activeFilter === subcategory}
            >
              {subcategory.charAt(0) + subcategory.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Main Content and Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Articles List */}
          <div className="lg:w-2/3">
            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#7734E3] mx-auto"></div>
                <p className="mt-4 text-lg text-gray-600">Loading articles...</p>
              </div>
            )}
            {error && (
              <div className="text-center py-12 bg-red-50 rounded-xl p-6 border border-red-200">
                <div className="text-red-600 text-lg font-medium mb-2">Failed to load articles</div>
                <p className="text-red-500">Please try again later or check your connection.</p>
              </div>
            )}
            {!isLoading && !error && filteredBlogs.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="text-gray-600 text-lg font-medium mb-2">No articles found</div>
                <p className="text-gray-500">Try changing your filter or check back later for new content.</p>
              </div>
            )}
            {!isLoading && !error && filteredBlogs.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredBlogs.map((blog) => (
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
              <div className="bg-gradient-to-r from-[#7734E3] to-[#5E30B2] rounded-xl shadow-sm p-6 text-white">
                <h3 className="text-lg font-bold mb-2">Join Our Newsletter</h3>
                <p className="text-sm mb-4 text-purple-100">
                  Subscribe to receive the latest lifestyle tips, trends, and updates directly in your inbox.
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
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Browse Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {lifestyleSubcategories.map((subcategory) => (
                    <button
                      key={subcategory}
                      onClick={() => setActiveFilter(subcategory)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${getCategoryColor(
                        subcategory
                      )} bg-opacity-10 text-gray-700 hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-${
                        getCategoryColor(subcategory).replace('bg-', '') + '-300'
                      }`}
                      aria-pressed={activeFilter === subcategory}
                    >
                      {subcategory.charAt(0) + subcategory.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
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

export default Lifestyle;
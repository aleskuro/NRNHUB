import React, { useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useFetchBlogsQuery } from '../../../Redux/features/blogs/blogApi';
import axios from 'axios';
import { toast } from 'react-toastify';
import noImage from '../../../assets/images.png';
import { Clock, BookOpen, Heart, Share2 } from 'lucide-react';

// Reusable Blog Card Component
const BlogCard = ({ blog, truncateTitle, getReadTime, getAuthorName, getCategoryColor, formatDate }) => (
  <Link
    to={`/blogs/${blog._id}`}
    className="block group hover:transform hover:scale-[1.01] transition-all duration-300"
    onClick={() => window.scrollTo(0, 0)}
  >
    <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-sm overflow-hidden mb-6 hover:shadow-md transition-shadow border border-purple-100">
      <div className="relative w-full h-48 md:h-48 ">
        <img
          src={blog.coverImg || noImage}
          alt={blog.title}
          className="w-full h-full object-cover"
          onError={(e) => (e.target.src = noImage)}
        />
        <span
          className={`absolute top-2 left-2 ${getCategoryColor(
            blog.category
          )} text-white text-xs px-2 py-1 rounded-full font-medium bg-opacity-80 backdrop-blur-sm`}
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

// Featured Blog Card
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
          {blog?.category || 'HEALTH'}
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

const Health = () => {
  const [activeFilter, setActiveFilter] = useState('HEALTH');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all blogs
  const { data: blogs = [], error, isLoading } = useFetchBlogsQuery({ search: '', category: '' });
  const ads = useSelector((state) => state.ads);

  // Filter blogs by HEALTH and sort by latest
  const healthBlogs = useMemo(
    () =>
      blogs
        .filter((blog) => blog.category?.toUpperCase() === 'HEALTH')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [blogs]
  );

  // Featured blog
  const featuredBlog = healthBlogs[0];

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
      HEALTH: 'bg-green-600',
      default: 'bg-gray-600',
    }),
    []
  );

  const getCategoryColor = useCallback(
    (category) => {
      const normalizedCategory = category?.toUpperCase();
      return categoryColors[normalizedCategory] || categoryColors.default;
    },
    [categoryColors]
  );

  const renderAdSpace = useCallback((adType, positionLabel) => (
    <div className="w-full bg-red-500 rounded-xl overflow-hidden shadow-md flex items-center justify-center mb-6 h-60 lg:h-72">
      <div className="text-center p-6">
        <div className="text-xl uppercase tracking-wide text-white mb-2 font-bold">Advertisement</div>
        <div className="text-white font-medium">{positionLabel} Placement</div>
      </div>
    </div>
  ), []);

  // Subscription handler
  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.post(`${window.location.origin}/api/subscribers`, { email });
      toast.success('Successfully subscribed to the newsletter!');
      setEmail('');
    } catch (error) {
      console.error('Error subscribing:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800">
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
                Wellness Insights
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white leading-tight">
                Health <span className="text-purple-200">Blog</span>
              </h1>
              <p className="text-lg md:text-xl text-purple-100 max-w-xl mx-auto md:mx-0 leading-relaxed">
                Empower your well-being with our health blog, where wellness, fitness, and mental health insights converge. Discover expert tips, inspiring stories, and practical advice to live a healthier, happier life.
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
        {/* Articles Section */}
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
            {!isLoading && !error && healthBlogs.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="text-gray-600 text-lg font-medium mb-2">No articles found</div>
                <p className="text-gray-500">Check back later for new health content.</p>
              </div>
            )}
            {!isLoading && !error && healthBlogs.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6">
                {healthBlogs.map((blog) => (
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

          {/* Advertisement Sidebar */}
          <div className="lg:w-1/3">
            <div className="sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="bg-[#7734E3] w-2 h-6 mr-2 rounded-sm inline-block"></span>
                Sponsored Content
              </h2>
              {renderAdSpace('healthSidebar', 'Health Sidebar')}
              {renderAdSpace('healthTopAd', 'Health Top')}
              <div className="bg-gradient-to-r from-[#7734E3] to-[#5E30B2] rounded-xl shadow-sm p-6 text-white mb-6">
                <h3 className="text-lg font-bold mb-2">Stay Updated</h3>
                <p className="text-sm mb-4 text-purple-100">
                  Get the latest health and wellness tips delivered to your inbox.
                </p>
                <form onSubmit={handleSubscribe} className="flex">
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-l-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-white border-2 border-white placeholder-gray-400"
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    className="bg-white text-[#7734E3] px-4 py-2 rounded-r-lg font-medium hover:bg-gray-100 transition-colors border-2 border-white focus:outline-none focus:ring-2 focus:ring-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Promo */}
      <div className="bg-gray-100 py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Explore More Topics</h2>
            <p className="text-lg text-gray-600 mb-6">
              Dive into other categories for inspiring articles and stay connected with the latest trends.
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

      <style jsx>{`
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
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Health;
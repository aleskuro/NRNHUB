import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SearchBlog from './SearchBlog';
import { useFetchBlogsQuery } from '../../Redux/features/blogs/blogApi';
import noImage from '../../assets/images.png';
import { ChevronLeft, ChevronRight, Clock, BookOpen, TrendingUp, Star, Heart, Share2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Reusable Blog Card Component
const BlogCard = ({ blog, trackBlogInteraction, truncateTitle, getReadTime, getAuthorName, getCategoryColor, formatDate }) => (
  <Link
    to={`/blogs/${blog._id}`}
    key={blog._id}
    className="block group"
    onClick={() => {
      trackBlogInteraction(blog._id, 'view');
      window.scrollTo(0, 0);
    }}
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
          {blog.category || 'General'}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
          <div className="p-5 text-white">
            <div className="font-medium">Read full article</div>
          </div>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[#883FFF] transition-colors">
          {truncateTitle(blog.title, 45)}
        </h3>
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <Clock size={14} className="mr-1" />
          <span className="mr-3">{getReadTime(blog)} min read</span>
          <span>By {getAuthorName(blog.author)}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <Heart size={14} className="mr-1" />
          <span className="mr-3">{blog.likes || 0}</span>
          <Share2 size={14} className="mr-1" />
          <span className="mr-3">{blog.shares || 0}</span>
          <span>{blog.commentCount || 0} Comments</span>
        </div>
        <p className="text-gray-600 line-clamp-2 mb-4">
          {blog.description || 'Discover more by diving in...'}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">{formatDate(blog.createdAt)}</span>
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                trackBlogInteraction(blog._id, 'like');
              }}
              className="text-[#883FFF] hover:text-[#7623EA]"
            >
              <Heart size={16} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                trackBlogInteraction(blog._id, 'share');
              }}
              className="text-[#883FFF] hover:text-[#7623EA]"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  </Link>
);

// Reusable Blog Grid Component
const BlogGrid = ({ blogs, start, end, ...props }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {blogs.slice(start, end).map((blog) => (
      <BlogCard key={blog._id} blog={blog} {...props} />
    ))}
  </div>
);

const Blogs = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState({ search: '', category: '' });
  const { data: blogs = [], error, isLoading } = useFetchBlogsQuery(query);
  const [activeTab, setActiveTab] = useState('new');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ads = useSelector((state) => state.ads);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const readTimeStartRef = useRef({});

  const trackBlogInteraction = async (blogId, action, readTime = null) => {
    try {
      const apiUrl = `${window.location.origin}/api/blogs`;
      if (action === 'view') {
        readTimeStartRef.current[blogId] = Date.now();
      } else if (action === 'read') {
        const startTime = readTimeStartRef.current[blogId];
        if (startTime) {
          const readTimeSeconds = Math.round((Date.now() - startTime) / 1000);
          await axios.post(`${apiUrl}/${blogId}/read-time`, { readTime: readTimeSeconds });
          delete readTimeStartRef.current[blogId];
        }
      } else if (action === 'like') {
        await axios.post(`${apiUrl}/${blogId}/like`, {}, { withCredentials: true });
        toast.success('Blog liked!');
      } else if (action === 'share') {
        await axios.post(`${apiUrl}/${blogId}/share`);
        toast.success('Blog shared!');
      }
    } catch (error) {
      console.error(`Error tracking ${action} for blog ${blogId}:`, error);
      toast.error(`Failed to ${action} blog`);
    }
  };

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

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      console.log('Redirecting to /category/', categoryParam);
      navigate(`/category/${categoryParam.toLowerCase()}`, { replace: true });
    }
  }, [searchParams, navigate]);

  const scrollRef = useRef(null);

  const handleSearchChange = (e) => setSearch(e.target.value);
  const handleSearch = () => setQuery({ search, category });

  const truncateTitle = (title, maxLength = 30) => {
    if (!title) return 'Untitled';
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength - 3) + '...';
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const newReleases = useMemo(
    () => [...blogs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 20),
    [blogs]
  );

  const popular = useMemo(
    () => [...blogs].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 20),
    [blogs]
  );

  const suggestions = useMemo(
    () => [...blogs].filter((blog) => blog.rating > 3).slice(0, 20),
    [blogs]
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently published';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getReadTime = (blog) => {
    try {
      if (blog.readCount > 0) {
        return Math.round(blog.readTime / blog.readCount / 60);
      }
      let wordCount = 500;
      if (blog.content && Array.isArray(blog.content.blocks)) {
        wordCount = blog.content.blocks.reduce((acc, block, index) => {
          if (!block || typeof block !== 'object' || !block.type || !block.data) {
            if (process.env.NODE_ENV === 'development') {
              console.warn(`Invalid block at index ${index} in blog ${blog._id}:`, block);
            }
            return acc;
          }
          if (block.type === 'paragraph' && block.data.text && typeof block.data.text === 'string') {
            return acc + block.data.text.split(' ').filter((word) => word.length > 0).length;
          } else if (block.type === 'list' && Array.isArray(block.data.items)) {
            return (
              acc +
              block.data.items.reduce((itemAcc, item) => {
                if (typeof item === 'string') {
                  return itemAcc + item.split(' ').filter((word) => word.length > 0).length;
                }
                return itemAcc;
              }, 0)
            );
          } else if (block.type === 'header' && block.data.text && typeof block.data.text === 'string') {
            return acc + block.data.text.split(' ').filter((word) => word.length > 0).length;
          }
          if (process.env.NODE_ENV === 'development') {
            console.warn(`Unsupported block type "${block.type}" at index ${index} in blog ${blog._id}:`, block);
          }
          return acc;
        }, 0) || 500;
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Invalid or missing content.blocks for blog:', blog._id, blog.content);
        }
      }
      return Math.max(3, Math.round(wordCount / 200));
    } catch (error) {
      console.error('Error calculating read time for blog:', blog._id, error);
      return 3;
    }
  };
  const getAuthorName = (author) => {
    if (!author) return 'Editor';
    if (typeof author === 'string') return author;
    if (typeof author === 'object') {
      return author.email || author.name || 'Editor';
    }
    return 'Editor';
  };

  const categoryColors = {
    technology: 'bg-blue-600',
    travel: 'bg-emerald-600',
    food: 'bg-amber-600',
    lifestyle: 'bg-rose-600',
    fashion: 'bg-violet-600',
    health: 'bg-teal-600',
    finance: 'bg-orange-600',
    entertainment: 'bg-red-600',
    general: 'bg-[#883FFF]',
  };

  const getCategoryColor = (category) => {
    const normalizedCategory = category?.toLowerCase() || 'general';
    return categoryColors[normalizedCategory] || 'bg-[#883FFF]';
  };

  const allCategories = useMemo(() => {
    const categories = blogs.map((blog) => blog.category?.toLowerCase() || 'general').filter(Boolean);
    return [...new Set(categories)];
  }, [blogs]);

  const randomCategories = useMemo(() => {
    const shuffled = [...allCategories].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [allCategories]);

  const getLatestBlogsByCategory = (categoryName) => {
    return blogs
      .filter((blog) => (blog.category?.toLowerCase() || 'general') === categoryName.toLowerCase())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);
  };

  const renderAdSpace = (adType, positionLabel) => {
    const isAdVisible = ads[`${adType}AdVisible`];
    const adImage = ads.adImages[adType];
    const adLink = ads.adLinks[adType];
    if (!isAdVisible) return null;
    if (!adImage) {
      return (
        <div className="w-full h-56 bg-gray-100 rounded-xl overflow-hidden shadow-md flex items-center justify-center">
          <div className="text-center p-6">
            <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Advertisement</div>
            <div className="text-gray-400 font-medium">{positionLabel} Ad Placement</div>
          </div>
        </div>
      );
    }
    return (
      <div className="w-full h-56 bg-gray-100 rounded-xl overflow-hidden shadow-md">
        {adLink ? (
          <a href={adLink} target="_blank" rel="noopener noreferrer">
            <img
              src={adImage}
              alt={`${positionLabel} Ad`}
              className="w-full h-56 object-cover"
              onError={(e) => {
                console.error(`Failed to load ad image: ${adImage}`);
                e.target.src = noImage;
              }}
            />
          </a>
        ) : (
          <img
            src={adImage}
            alt={`${positionLabel} Ad`}
            className="w-full h-56 object-cover"
            onError={(e) => {
              console.error(`Failed to load ad image: ${adImage}`);
              e.target.src = noImage;
            }}
          />
        )}
      </div>
    );
  };

  const blogGridProps = {
    trackBlogInteraction,
    truncateTitle,
    getReadTime,
    getAuthorName,
    getCategoryColor,
    formatDate,
  };

  return (
    <div className="mt-16 bg-gradient-to-b from-[#E6F0FA] to-[#F3E8FF] min-h-screen text-gray-800">
      {isLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Searching for wisdom...</p>
          </div>
        </div>
      )}
      {error && !isLoading && (
        <div className="p-8 text-center text-[#883FFF]">
          Oops! Something went sideways. {error?.message || 'Failed to fetch blogs.'}
        </div>
      )}
      {!isLoading && !error && blogs.length === 0 && (
        <div className="mt-12 text-center text-lg text-gray-600">
          No blogs found. (It's a bit quiet here, isn't it?)
        </div>
      )}
      {!isLoading && !error && (
        <>
          <div className="relative py-20 bg-gradient-to-r from-[#883FFF] to-[#6023BB] overflow-hidden rounded-2xl">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-white/30 blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/20 blur-3xl"></div>
              <div className="absolute top-1/4 right-1/4 w-48 h-48 rounded-full bg-white/20 blur-3xl"></div>
            </div>
            <div className="container mx-auto px-4 relative z-10">
              <div className="md:flex items-center justify-between">
                <div className="md:w-7/12 mb-10 md:mb-0">
                  <span className="inline-block px-4 py-1 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
                    Discover stories that matter
                  </span>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-tight">
                    NRNHUB <span className="text-purple-200">Blog</span>
                  </h1>
                  <p className="text-lg md:text-xl text-purple-100 mb-8 max-w-xl leading-relaxed">
                    Explore insights, ideas, and inspiration from our community of thought leaders and experts.
                  </p>
                  <div className="max-w-lg">
                    <SearchBlog
                      search={search}
                      handleSearchChange={handleSearchChange}
                      handleSearch={handleSearch}
                    />
                  </div>
                </div>
                <div className="md:w-5/12 hidden md:block">
                  <div className="relative">
                    <div className="absolute -top-6 -left-6 w-32 h-32 rounded-lg border-2 border-purple-300/30"></div>
                    <div className="rounded-2xl overflow-hidden shadow-xl transform rotate-2 hover:rotate-0 transition-transform duration-300">
                      <img
                        src={newReleases.length > 0 ? newReleases[0].coverImg : noImage}
                        alt="Featured blog"
                        className="w-full h-64 object-cover"
                        onError={(e) => (e.target.src = noImage)}
                      />
                    </div>
                    <div className="absolute -bottom-6 -right-6 bg-white/10 backdrop-blur-lg rounded-2xl p-4 w-48 border border-white/20 shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                      <div className="text-white text-sm font-medium">Latest Article</div>
                      <div className="text-white/80 text-xs mt-1">
                        {newReleases.length > 0 ? truncateTitle(newReleases[0].title, 20) : 'Discover new content'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {!query.search && (
            <div className="container mx-auto px-4 mb-8 mt-8">
              <div className="flex overflow-x-auto pb-2 gap-2 border-b border-gray-200">
                <button
                  className={`px-5 py-3 text-base font-semibold rounded-t-lg whitespace-nowrap transition-colors ${
                    activeTab === 'new' ? 'text-[#883FFF] border-b-2 border-[#883FFF]' : 'text-gray-600 hover:text-[#883FFF]'
                  }`}
                  onClick={() => setActiveTab('new')}
                >
                  <div className="flex items-center">
                    <Clock size={18} className="mr-2 size-7" />
                    New Releases
                  </div>
                </button>
                <button
                  className={`px-5 py-3 text-base font-semibold rounded-t-lg whitespace-nowrap transition-colors ${
                    activeTab === 'popular' ? 'text-[#883FFF] border-b-2 border-[#883FFF]' : 'text-gray-600 hover:text-[#883FFF]'
                  }`}
                  onClick={() => setActiveTab('popular')}
                >
                  <div className="flex items-center">
                    <TrendingUp size={18} className="mr-2 size-7" />
                    Popular
                  </div>
                </button>
                <button
                  className={`px-5 py-3 text-base font-semibold rounded-t-lg whitespace-nowrap transition-colors ${
                    activeTab === 'suggestions' ? 'text-[#883FFF] border-b-2 border-[#883FFF]' : 'text-gray-600 hover:text-[#883FFF]'
                  }`}
                  onClick={() => setActiveTab('suggestions')}
                >
                  <div className="flex items-center">
                    <Star size={18} className="mr-2 size-7" />
                    Suggestions
                  </div>
                </button>
              </div>
              <div className="mb-12">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Top Stories</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => scroll('left')}
                      className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 text-gray-700"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => scroll('right')}
                      className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 text-gray-700"
                      aria-label="Scroll right"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
                <div
                  ref={scrollRef}
                  className="flex overflow-x-auto pb-4 gap-4 snap-x snap-mandatory scrollbar-hide"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {newReleases
                    .filter((blog) => {
                      const tenDaysAgo = new Date();
                      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
                      return new Date(blog.createdAt) >= tenDaysAgo;
                    })
                    .slice(0, 6)
                    .map((blog) => (
                      <Link
                        to={`/blogs/${blog._id}`}
                        key={blog._id}
                        className="snap-start flex-shrink-0 w-72 md:w-80"
                        onClick={() => {
                          trackBlogInteraction(blog._id, 'view');
                          window.scrollTo(0, 0);
                        }}
                      >
                        <div className="bg-white rounded-xl shadow-md overflow-hidden h-full hover:shadow-xl transition-shadow">
                          <div className="relative">
                            <img
                              src={blog.coverImg || noImage}
                              alt={blog.title}
                              className="w-full h-48 object-cover"
                              onError={(e) => (e.target.src = noImage)}
                            />
                            <div
                              className={`absolute top-3 left-3 ${getCategoryColor(blog.category)} text-white text-xs px-2 py-1 rounded-full`}
                            >
                              {blog.category || 'General'}
                            </div>
                          </div>
                          <div className="p-5">
                            <h3 className="text-lg font-bold text-gray-800 mb-2">{truncateTitle(blog.title)}</h3>
                            <div className="flex items-center text-sm text-gray-500 mb-3">
                              <Clock size={14} className="mr-1" />
                              <span className="mr-3">{getReadTime(blog)} min</span>
                              <BookOpen size={14} className="mr-1" />
                              <span>By {getAuthorName(blog.author)}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500 mb-3">
                              <Heart size={14} className="mr-1" />
                              <span className="mr-3">{blog.likes || 0}</span>
                              <Share2 size={14} className="mr-1" />
                              <span className="mr-3">{blog.shares || 0}</span>
                              <span>{blog.commentCount || 0} Comments</span>
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                              {blog.description || 'Discover more by diving in...'}
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">{formatDate(blog.createdAt)}</span>
                              <div className="flex space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    trackBlogInteraction(blog._id, 'like');
                                  }}
                                  className="text-[#883FFF] hover:text-[#7623EA]"
                                >
                                  <Heart size={16} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    trackBlogInteraction(blog._id, 'share');
                                  }}
                                  className="text-[#883FFF] hover:text-[#7623EA]"
                                >
                                  <Share2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          )}
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {query.search
                ? 'Search Results'
                : activeTab === 'new'
                ? 'Latest Articles'
                : activeTab === 'popular'
                ? 'Most Popular'
                : 'Recommended For You'}
            </h2>
            <div className="grid grid-cols-1 gap-8">
              <BlogGrid
                blogs={query.search ? blogs : activeTab === 'new' ? newReleases : activeTab === 'popular' ? popular : suggestions}
                start={0}
                end={3}
                {...blogGridProps}
              />
              {renderAdSpace('blogsHome1', 'First')}
              {randomCategories[0] && (
                <div className="mb-12">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 capitalize">Latest in {randomCategories[0]}</h2>
                    <Link
                      to={`/category/${randomCategories[0]}`}
                      className="text-sm font-medium text-[#883FFF] hover:text-[#7623EA]"
                      onClick={() => window.scrollTo(0, 0)}
                    >
                      View all →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {getLatestBlogsByCategory(randomCategories[0]).map((blog) => (
                      <Link
                        to={`/blogs/${blog._id}`}
                        key={blog._id}
                        className="block group"
                        onClick={() => {
                          trackBlogInteraction(blog._id, 'view');
                          window.scrollTo(0, 0);
                        }}
                      >
                        <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                          <div className="relative">
                            <img
                              src={blog.coverImg || noImage}
                              alt={blog.title}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => (e.target.src = noImage)}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                              <div className="p-4 text-white">
                                <div className="font-medium text-sm">Read article</div>
                              </div>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#883FFF] transition-colors line-clamp-2">
                              {blog.title}
                            </h3>
                            <div className="flex items-center text-xs text-gray-500 mb-2">
                              <Clock size={12} className="mr-1" />
                              <span className="mr-2">{getReadTime(blog)} min</span>
                              <span>By {getAuthorName(blog.author)}</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500 mb-2">
                              <Heart size={12} className="mr-1" />
                              <span className="mr-2">{blog.likes || 0}</span>
                              <Share2 size={12} className="mr-1" />
                              <span className="mr-2">{blog.shares || 0}</span>
                              <span>{blog.commentCount || 0} Comments</span>
                            </div>
                            <span className="text-xs text-gray-500">{formatDate(blog.createdAt)}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              <BlogGrid
                blogs={query.search ? blogs : activeTab === 'new' ? newReleases : activeTab === 'popular' ? popular : suggestions}
                start={3}
                end={6}
                {...blogGridProps}
              />
              {renderAdSpace('blogsHome2', 'Second')}
              {randomCategories[1] && (
                <div className="mb-12">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 capitalize">Latest in {randomCategories[1]}</h2>
                    <Link
                      to={`/category/${randomCategories[1]}`}
                      className="text-sm font-medium text-[#883FFF] hover:text-[#7623EA]"
                      onClick={() => window.scrollTo(0, 0)}
                    >
                      View all →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {getLatestBlogsByCategory(randomCategories[1]).map((blog) => (
                      <Link
                        to={`/blogs/${blog._id}`}
                        key={blog._id}
                        className="block group"
                        onClick={() => {
                          trackBlogInteraction(blog._id, 'view');
                          window.scrollTo(0, 0);
                        }}
                      >
                        <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                          <div className="relative">
                            <img
                              src={blog.coverImg || noImage}
                              alt={blog.title}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => (e.target.src = noImage)}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                              <div className="p-4 text-white">
                                <div className="font-medium text-sm">Read article</div>
                              </div>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#883FFF] transition-colors line-clamp-2">
                              {blog.title}
                            </h3>
                            <div className="flex items-center text-xs text-gray-500 mb-2">
                              <Clock size={12} className="mr-1" />
                              <span className="mr-2">{getReadTime(blog)} min</span>
                              <span>By {getAuthorName(blog.author)}</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500 mb-2">
                              <Heart size={12} className="mr-1" />
                              <span className="mr-2">{blog.likes || 0}</span>
                              <Share2 size={12} className="mr-1" />
                              <span className="mr-2">{blog.shares || 0}</span>
                              <span>{blog.commentCount || 0} Comments</span>
                            </div>
                            <span className="text-xs text-gray-500">{formatDate(blog.createdAt)}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              <BlogGrid
                blogs={query.search ? blogs : activeTab === 'new' ? newReleases : activeTab === 'popular' ? popular : suggestions}
                start={6}
                end={9}
                {...blogGridProps}
              />
              {renderAdSpace('blogsHome3', 'Third')}
              {randomCategories[2] && (
                <div className="mb-12">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 capitalize">Latest in {randomCategories[2]}</h2>
                    <Link
                      to={`/category/${randomCategories[2]}`}
                      className="text-sm font-medium text-[#883FFF] hover:text-[#7623EA]"
                      onClick={() => window.scrollTo(0, 0)}
                    >
                      View all →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {getLatestBlogsByCategory(randomCategories[2]).map((blog) => (
                      <Link
                        to={`/blogs/${blog._id}`}
                        key={blog._id}
                        className="block group"
                        onClick={() => {
                          trackBlogInteraction(blog._id, 'view');
                          window.scrollTo(0, 0);
                        }}
                      >
                        <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                          <div className="relative">
                            <img
                              src={blog.coverImg || noImage}
                              alt={blog.title}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => (e.target.src = noImage)}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                              <div className="p-4 text-white">
                                <div className="font-medium text-sm">Read article</div>
                              </div>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#883FFF] transition-colors line-clamp-2">
                              {blog.title}
                            </h3>
                            <div className="flex items-center text-xs text-gray-500 mb-2">
                              <Clock size={12} className="mr-1" />
                              <span className="mr-2">{getReadTime(blog)} min</span>
                              <span>By {getAuthorName(blog.author)}</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500 mb-2">
                              <Heart size={12} className="mr-1" />
                              <span className="mr-2">{blog.likes || 0}</span>
                              <Share2 size={12} className="mr-1" />
                              <span className="mr-2">{blog.shares || 0}</span>
                              <span>{blog.commentCount || 0} Comments</span>
                            </div>
                            <span className="text-xs text-gray-500">{formatDate(blog.createdAt)}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              <BlogGrid
                blogs={query.search ? blogs : activeTab === 'new' ? newReleases : activeTab === 'popular' ? popular : suggestions}
                start={9}
                end={12}
                {...blogGridProps}
              />
              {renderAdSpace('blogsHome1', 'blogsHome1')}
              <BlogGrid
                blogs={query.search ? blogs : activeTab === 'new' ? newReleases : activeTab === 'popular' ? popular : suggestions}
                start={12}
                end={15}
                {...blogGridProps}
              />
              {renderAdSpace('blogsHome2', 'Home2')}
              <BlogGrid
                blogs={query.search ? blogs : activeTab === 'new' ? newReleases : activeTab === 'popular' ? popular : suggestions}
                start={15}
                end={18}
                {...blogGridProps}
              />
              {renderAdSpace('blogsSixth', 'Sixth')}
              <BlogGrid
                blogs={query.search ? blogs : activeTab === 'new' ? newReleases : activeTab === 'popular' ? popular : suggestions}
                start={18}
                end={undefined}
                {...blogGridProps}
              />
            </div>
            <div className="mt-16 bg-gradient-to-r from-[#883FFF]/10 to-[#6023BB]/10 rounded-2xl p-8 md:p-12">
              <div className="md:flex items-center justify-between">
                <div className="md:w-2/3 mb-6 md:mb-0">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Stay updated with our newsletter</h3>
                  <p className="text-gray-600">Get the latest articles, resources, and updates right in your inbox.</p>
                </div>
                <div className="md:w-1/3">
                  <form onSubmit={handleSubscribe} className="flex">
                    <input
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-l-lg border-y border-l border-gray-500 focus:outline-none focus:ring-1 focus:ring-[#883FFF]/50"
                      disabled={isSubmitting}
                    />
                    <button
                      type="submit"
                      className="bg-[#883FFF] text-white px-4 py-3 rounded-r-lg hover:bg-[#7623EA] transition-colors disabled:bg-[#883FFF]/50"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      <style jsx>{`
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
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );

}
export default Blogs;
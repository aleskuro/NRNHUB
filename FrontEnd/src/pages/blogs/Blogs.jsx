// src/pages/blogs/Blogs.jsx
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useFetchBlogsQuery } from '../../Redux/features/blogs/blogApi';
import noImage from '../../assets/images.png';
import { ChevronLeft, ChevronRight, Clock, TrendingUp, Star, Heart, Share2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { normalizeAdImage } from '@utilis/normalizeAdImage'; // FIXED

const API_URL = import.meta.env.VITE_API_URL;

const SearchBlog = ({ search, handleSearchChange, handleSearch }) => (
  <div className="flex flex-col sm:flex-row gap-2 max-w-4xl mx-auto">
    <input
      type="text"
      placeholder="Search articles..."
      value={search}
      onChange={handleSearchChange}
      className="flex-1 px-4 py-3 rounded-lg bg-white border-2 border-black focus:outline-none focus:ring-2 focus:ring-[#883FFF]/50 text-gray-800"
    />
    <button
      onClick={handleSearch}
      className="w-full sm:w-auto px-6 py-3 bg-[#883FFF] text-white rounded-lg hover:bg-[#7623EA] transition-colors duration-300 font-medium"
    >
      Search
    </button>
  </div>
);

const BlogCard = ({ blog, trackBlogInteraction, truncateTitle, getReadTime, getAuthorName, getCategoryColor, formatDate }) => {
  const imageUrl = blog.coverImg
    ? blog.coverImg.startsWith('http')
      ? blog.coverImg
      : `${API_URL}${blog.coverImg}`
    : noImage;

  return (
    <Link
      to={`/blogs/${blog._id}`}
      className="block group"
      onClick={() => {
        trackBlogInteraction(blog._id, 'view');
        window.scrollTo(0, 0);
      }}
    >
      <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
        <div className="relative">
          <img
            src={imageUrl}
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
};

const BlogGrid = ({ blogs, start, end, ...props }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {blogs.slice(start, end).map((blog) => (
      <BlogCard key={blog._id} blog={blog} {...props} />
    ))}
  </div>
);

const Blogs = () => {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState({ search: '', category: '' });
  const { data: blogs = [], error, isLoading } = useFetchBlogsQuery(query);
  const [activeTab, setActiveTab] = useState('new');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // SAFE: default to empty objects
  const { adImages = {}, adLinks = {}, visibility = {} } = useSelector((state) => state.ads || {});

  const [emailInput, setEmailInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const readTimeStartRef = useRef({});
  const scrollRef = useRef(null);

  const trackBlogInteraction = async (blogId, action) => {
    try {
      const apiUrl = `${API_URL}/api/blogs`;
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
      toast.error(`Failed to ${action} blog`);
    }
  };

  const handleSubscribe = async () => {
    if (!emailInput || !/\S+@\S+\.\S+/.test(emailInput)) {
      toast.error('Enter a valid email');
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/subscribers`, { email: emailInput });
      toast.success('Subscribed!');
      setEmailInput('');
    } catch {
      toast.error('Subscription failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      navigate(`/category/${categoryParam.toLowerCase()}`, { replace: true });
    }
  }, [searchParams, navigate]);

  const handleSearchChange = (e) => setSearch(e.target.value);
  const handleSearch = () => setQuery({ search, category: '' });

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
  const suggestions = useMemo(() => [...blogs].filter(b => b.rating > 3).slice(0, 20), [blogs]);

  const truncateTitle = (title, max = 30) => title?.length > max ? title.substring(0, max - 3) + '...' : title || 'Untitled';
  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const getAuthorName = (author) => author?.name || author?.email?.split('@')[0] || 'Editor';

  const getReadTime = (blog) => {
    let wordCount = 500;
    if (blog.content?.blocks) {
      wordCount = blog.content.blocks.reduce((acc, b) => {
        if (b.type === 'paragraph' && b.data?.text) return acc + b.data.text.split(' ').length;
        if (b.type === 'header' && b.data?.text) return acc + b.data.text.split(' ').length;
        return acc;
      }, 0);
    }
    return Math.max(3, Math.round(wordCount / 200));
  };

  const categoryColors = {
    technology: 'bg-blue-600',
    travel: 'bg-emerald-600',
    food: 'bg-amber-600',
    lifestyle: 'bg-rose-600',
    general: 'bg-[#883FFF]',
  };
  const getCategoryColor = (cat) => categoryColors[cat?.toLowerCase()] || 'bg-[#883FFF]';

  const allCategories = useMemo(() => [...new Set(blogs.map(b => b.category?.toLowerCase()).filter(Boolean))], [blogs]);
  const randomCategories = useMemo(() => [...allCategories].sort(() => 0.5 - Math.random()).slice(0, 3), [allCategories]);

  const getLatestBlogsByCategory = (cat) => blogs
    .filter(b => (b.category?.toLowerCase() || 'general') === cat.toLowerCase())
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  // SAFE AD RENDERER
  const renderAdSpace = (adType, label) => {
    const isVisible = visibility[adType];
    const image = adImages[adType];
    const link = adLinks[adType];

    if (!isVisible) return null;

    if (!image) {
      return (
        <div key={`${adType}-placeholder`} className="w-full h-56 bg-gray-100 rounded-xl flex items-center justify-center shadow-md">
          <div className="text-center text-gray-500">
            <div className="text-xs uppercase">{label} Ad</div>
            <div className="text-sm">Placement</div>
          </div>
        </div>
      );
    }

    const imgSrc = normalizeAdImage(image, API_URL);

    if (!imgSrc) {
      return (
        <div key={`${adType}-invalid`} className="w-full h-56 bg-gray-100 rounded-xl flex items-center justify-center shadow-md">
          <span className="text-gray-500">Invalid Ad</span>
        </div>
      );
    }

    return (
      <div key={adType} className="w-full h-56 bg-gray-100 rounded-xl overflow-hidden shadow-md">
        {link ? (
          <a href={link} target="_blank" rel="noopener noreferrer">
            <img
              src={imgSrc}
              alt={`${label} Ad`}
              className="w-full h-56 object-cover"
              onError={(e) => (e.target.src = noImage)}
              loading="lazy"
            />
          </a>
        ) : (
          <img
            src={imgSrc}
            alt={`${label} Ad`}
            className="w-full h-56 object-cover"
            onError={(e) => (e.target.src = noImage)}
            loading="lazy"
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
            <p className="mt-4 text-lg text-gray-600">Loading blogs...</p>
          </div>
        </div>
      )}

      {error && <div className="p-8 text-center text-red-600">Failed to load blogs.</div>}
      {blogs.length === 0 && !isLoading && <div className="text-center py-12 text-gray-600">No blogs found.</div>}

      {!isLoading && !error && (
        <div>
          {/* Hero Section */}
          <div className="relative py-20 bg-gradient-to-r from-[#883FFF] to-[#6023BB] overflow-hidden rounded-2xl">
            <div className="container mx-auto px-4">
              <div className="md:flex items-center justify-between">
                <div className="md:w-7/12">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
                    NRNHUB <span className="text-purple-200">Blog</span>
                  </h1>
                  <p className="text-lg text-purple-100 mb-8 max-w-xl">Explore insights, ideas, and inspiration.</p>
                </div>
                {newReleases[0] && (
                  <div className="md:w-5/12 hidden md:block">
                    <img
                      src={newReleases[0].coverImg?.startsWith('http') ? newReleases[0].coverImg : `${API_URL}${newReleases[0].coverImg}`}
                      alt="Featured"
                      className="w-full h-64 object-cover rounded-2xl shadow-xl"
                      onError={(e) => (e.target.src = noImage)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="container mx-auto px-4 py-8">
            <SearchBlog search={search} handleSearchChange={handleSearchChange} handleSearch={handleSearch} />
          </div>

          {/* Tabs + Top Stories */}
          {!query.search && (
            <div className="container mx-auto px-4 mb-8">
              <div className="flex overflow-x-auto pb-2 gap-2 border-b border-gray-200">
                {['new', 'popular', 'suggestions'].map(tab => (
                  <button
                    key={tab}
                    className={`px-5 py-3 font-semibold rounded-t-lg ${activeTab === tab ? 'text-[#883FFF] border-b-2 border-[#883FFF]' : 'text-gray-600'}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === 'new' && <><Clock size={18} className="inline mr-2" />New</>}
                    {tab === 'popular' && <><TrendingUp size={18} className="inline mr-2" />Popular</>}
                    {tab === 'suggestions' && <><Star size={18} className="inline mr-2" />Suggestions</>}
                  </button>
                ))}
              </div>

              <div className="mb-12">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Top Stories</h2>
                  <div className="flex space-x-2">
                    <button onClick={() => scroll('left')} className="p-2 rounded-full bg-white shadow"><ChevronLeft size={20} /></button>
                    <button onClick={() => scroll('right')} className="p-2 rounded-full bg-white shadow"><ChevronRight size={20} /></button>
                  </div>
                </div>
                <div ref={scrollRef} className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-hide">
                  {newReleases.slice(0, 6).map(blog => (
                    <Link to={`/blogs/${blog._id}`} key={blog._id} className="snap-start w-72">
                      <div className="bg-white rounded-xl shadow-md overflow-hidden h-full">
                        <img
                          src={blog.coverImg?.startsWith('http') ? blog.coverImg : `${API_URL}${blog.coverImg}`}
                          alt={blog.title}
                          className="w-full h-48 object-cover"
                          onError={(e) => (e.target.src = noImage)}
                        />
                        <div className="p-5">
                          <h3 className="text-lg font-bold">{truncateTitle(blog.title)}</h3>
                          <p className="text-sm text-gray-500">{getReadTime(blog)} min • {getAuthorName(blog.author)}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">
              {query.search ? 'Search Results' : activeTab === 'new' ? 'Latest' : activeTab === 'popular' ? 'Popular' : 'Recommended'}
            </h2>

            <BlogGrid
              blogs={query.search ? blogs : activeTab === 'new' ? newReleases : activeTab === 'popular' ? popular : suggestions}
              start={0}
              end={3}
              {...blogGridProps}
            />
            {renderAdSpace('blogsHome1', 'First')}
            {renderAdSpace('blogsHome2', 'Second')}
            {renderAdSpace('blogsHome3', 'Third')}

            <BlogGrid
              blogs={query.search ? blogs : activeTab === 'new' ? newReleases : activeTab === 'popular' ? popular : suggestions}
              start={3}
              end={undefined}
              {...blogGridProps}
            />

            {/* Newsletter */}
            <div className="mt-16 bg-gradient-to-r from-[#883FFF]/10 to-[#6023BB]/10 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-3">Subscribe to Our Newsletter</h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg border"
                  disabled={isSubmitting}
                />
                <button
                  onClick={handleSubscribe}
                  disabled={isSubmitting}
                  className="bg-[#883FFF] text-white px-6 py-3 rounded-lg hover:bg-[#7623EA] disabled:opacity-50"
                >
                  {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
};

export default Blogs;
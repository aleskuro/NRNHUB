import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import SearchBlog from './SearchBlog';
import { useFetchBlogsQuery } from '../../Redux/features/blogs/blogApi';
import 'react-toastify/dist/ReactToastify.css';
import noImage from '../../assets/images.png';
import { ChevronLeft, ChevronRight, Clock, BookOpen, TrendingUp, Star } from 'lucide-react';

const Blogs = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState({ search: '', category: '' });
  const { data: blogs = [], error, isLoading } = useFetchBlogsQuery(query);
  const [activeTab, setActiveTab] = useState('new');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Handle redirection from /blogs?category=travel to /category/travel
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      console.log('Redirecting to /category/', categoryParam);
      navigate(`/category/${categoryParam.toLowerCase()}`, { replace: true });
    }
  }, [searchParams, navigate]);

  // Refs for scrolling
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
    () =>
      [...blogs]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 20),
    [blogs]
  );

  const popular = useMemo(
    () => [...blogs].filter((_, index) => index % 2 === 0).slice(0, 20),
    [blogs]
  );

  const suggestions = useMemo(
    () => [...blogs].filter((_, index) => index % 2 !== 0).slice(0, 20),
    [blogs]
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently published';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getReadTime = () => Math.floor(Math.random() * 10) + 3;

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

  return (
    <div className="mt-16 bg-gradient-to-b from-[#E6F0FA] to-[#F3E8FF] min-h-screen text-gray-800">
      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Searching for wisdom...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-8 text-center text-[#883FFF]">
          Oops! Something went sideways. {error?.message || 'Failed to fetch blogs.'}
        </div>
      )}

      {/* No Blogs State */}
      {!isLoading && !error && blogs.length === 0 && (
        <div className="mt-12 text-center text-lg text-gray-600">
          No blogs found. (It's a bit quiet here, isn't it?)
        </div>
      )}

      {/* Main Content */}
      {!isLoading && !error && (
        <>
          {/* Hero Section */}
          <div className="relative py-20 bg-gradient-to-r from-[#883FFF] to-[#6023BB] overflow-hidden">
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

          {/* Category Tabs for Non-Search Results */}
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
                    <Clock size={18} className="mr-2" />
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
                    <TrendingUp size={18} className="mr-2" />
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
                    <Star size={18} className="mr-2" />
                    Suggestions
                  </div>
                </button>
              </div>

              {/* Top Stories Row - Constant for 10 days */}
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
                      <Link to={`/blogs/${blog._id}`} key={blog._id} className="snap-start flex-shrink-0 w-72 md:w-80" onClick={() => window.scrollTo(0, 0)}>
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
                              <span className="mr-3">{getReadTime()} min</span>
                              <BookOpen size={14} className="mr-1" />
                              <span>By {getAuthorName(blog.author)}</span>
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                              {blog.description || 'Discover more by diving in...'}
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">{formatDate(blog.createdAt)}</span>
                              <button className="text-[#883FFF] hover:text-[#7623EA] font-medium text-sm">
                                Read more →
                              </button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Article List with Horizontal Ads and Category Sections */}
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
              {/* First set of articles */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(query.search ? blogs : activeTab === 'new' ? newReleases : activeTab === 'popular' ? popular : suggestions)
                  .slice(query.search ? 0 : 0, 3)
                  .map((blog) => (
                    <Link to={`/blogs/${blog._id}`} key={blog._id} className="block group" onClick={() => window.scrollTo(0, 0)}>
                      <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                        <div className="relative">
                          <img
                            src={blog.coverImg || noImage}
                            alt={blog.title}
                            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => (e.target.src = noImage)}
                          />
                          <div
                            className={`absolute top-3 left-3 ${getCategoryColor(blog.category)} text-white text-xs px-2 py-1 rounded-full`}
                          >
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
                            <span className="mr-3">{getReadTime()} min read</span>
                            <span>By {getAuthorName(blog.author)}</span>
                          </div>
                          <p className="text-gray-600 line-clamp-2 mb-4">
                            {blog.description || 'Discover more by diving in...'}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">{formatDate(blog.createdAt)}</span>
                            <button className="text-[#883FFF] hover:text-[#7623EA] font-medium text-sm">
                              Read more →
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>

              {/* First Ad Space */}
              <div className="w-full h-56 bg-gray-100 rounded-xl overflow-hidden shadow-md flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Advertisement</div>
                  <div className="text-gray-400 font-medium">Ad Space Available</div>
                </div>
              </div>

              {/* First Category Section */}
              {randomCategories[0] && (
                <div className="mb-12">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 capitalize">
                      Latest in {randomCategories[0]}
                    </h2>
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
                      <Link to={`/blogs/${blog._id}`} key={blog._id} className="block group" onClick={() => window.scrollTo(0, 0)}>
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
                              <span className="mr-2">{getReadTime()} min</span>
                              <span>By {getAuthorName(blog.author)}</span>
                            </div>
                            <span className="text-xs text-gray-500">{formatDate(blog.createdAt)}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Second set of articles */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(query.search ? blogs : activeTab === 'new' ? newReleases : activeTab === 'popular' ? popular : suggestions)
                  .slice(query.search ? 3 : 3, 6)
                  .map((blog) => (
                    <Link to={`/blogs/${blog._id}`} key={blog._id} className="block group" onClick={() => window.scrollTo(0, 0)}>
                      <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                        <div className="relative">
                          <img
                            src={blog.coverImg || noImage}
                            alt={blog.title}
                            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => (e.target.src = noImage)}
                          />
                          <div
                            className={`absolute top-3 left-3 ${getCategoryColor(blog.category)} text-white text-xs px-2 py-1 rounded-full`}
                          >
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
                            <span className="mr-3">{getReadTime()} min read</span>
                            <span>By {getAuthorName(blog.author)}</span>
                          </div>
                          <p className="text-gray-600 line-clamp-2 mb-4">
                            {blog.description || 'Discover more by diving in...'}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">{formatDate(blog.createdAt)}</span>
                            <button className="text-[#883FFF] hover:text-[#7623EA] font-medium text-sm">
                              Read more →
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>

              {/* Second Ad Space */}
              <div className="w-full h-56 bg-gray-100 rounded-xl overflow-hidden shadow-md flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Advertisement</div>
                  <div className="text-gray-400 font-medium">Premium Ad Placement</div>
                </div>
              </div>

              {/* Second Category Section */}
              {randomCategories[1] && (
                <div className="mb-12">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 capitalize">
                      Latest in {randomCategories[1]}
                    </h2>
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
                      <Link to={`/blogs/${blog._id}`} key={blog._id} className="block group" onClick={() => window.scrollTo(0, 0)}>
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
                              <span className="mr-2">{getReadTime()} min</span>
                              <span>By {getAuthorName(blog.author)}</span>
                            </div>
                            <span className="text-xs text-gray-500">{formatDate(blog.createdAt)}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Third set of articles */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(query.search ? blogs : activeTab === 'new' ? newReleases : activeTab === 'popular' ? popular : suggestions)
                  .slice(query.search ? 6 : 6, 9)
                  .map((blog) => (
                    <Link to={`/blogs/${blog._id}`} key={blog._id} className="block group" onClick={() => window.scrollTo(0, 0)}>
                      <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                        <div className="relative">
                          <img
                            src={blog.coverImg || noImage}
                            alt={blog.title}
                            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => (e.target.src = noImage)}
                          />
                          <div
                            className={`absolute top-3 left-3 ${getCategoryColor(blog.category)} text-white text-xs px-2 py-1 rounded-full`}
                          >
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
                            <span className="mr-3">{getReadTime()} min read</span>
                            <span>By {getAuthorName(blog.author)}</span>
                          </div>
                          <p className="text-gray-600 line-clamp-2 mb-4">
                            {blog.description || 'Discover more by diving in...'}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">{formatDate(blog.createdAt)}</span>
                            <button className="text-[#883FFF] hover:text-[#7623EA] font-medium text-sm">
                              Read more →
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>

              {/* Third Category Section */}
              {randomCategories[2] && (
                <div className="mb-12">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 capitalize">
                      Latest in {randomCategories[2]}
                    </h2>
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
                      <Link to={`/blogs/${blog._id}`} key={blog._id} className="block group" onClick={() => window.scrollTo(0, 0)}>
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
                              <span className="mr-2">{getReadTime()} min</span>
                              <span>By {getAuthorName(blog.author)}</span>
                            </div>
                            <span className="text-xs text-gray-500">{formatDate(blog.createdAt)}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Remaining articles */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(query.search ? blogs : activeTab === 'new' ? newReleases : activeTab === 'popular' ? popular : suggestions)
                  .slice(query.search ? 9 : 9)
                  .map((blog) => (
                    <Link to={`/blogs/${blog._id}`} key={blog._id} className="block group" onClick={() => window.scrollTo(0, 0)}>
                      <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                        <div className="relative">
                          <img
                            src={blog.coverImg || noImage}
                            alt={blog.title}
                            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => (e.target.src = noImage)}
                          />
                          <div
                            className={`absolute top-3 left-3 ${getCategoryColor(blog.category)} text-white text-xs px-2 py-1 rounded-full`}
                          >
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
                            <span className="mr-3">{getReadTime()} min read</span>
                            <span>By {getAuthorName(blog.author)}</span>
                          </div>
                          <p className="text-gray-600 line-clamp-2 mb-4">
                            {blog.description || 'Discover more by diving in...'}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">{formatDate(blog.createdAt)}</span>
                            <button className="text-[#883FFF] hover:text-[#7623EA] font-medium text-sm">
                              Read more →
                            </button>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>

            {/* Newsletter Section */}
            <div className="mt-16 bg-gradient-to-r from-[#883FFF]/10 to-[#6023BB]/10 rounded-2xl p-8 md:p-12">
              <div className="md:flex items-center justify-between">
                <div className="md:w-2/3 mb-6 md:mb-0">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Stay updated with our newsletter</h3>
                  <p className="text-gray-600">Get the latest articles, resources, and updates right in your inbox.</p>
                </div>
                <div className="md:w-1/3">
                  <div className="flex">
                    <input
                      type="email"
                      placeholder="Your email address"
                      className="flex-1 px-4 py-3 rounded-l-lg border-y border-l border-gray-500 focus:outline-none focus:ring-1 focus:ring-[#883FFF]/50"
                    />
                    <button className="bg-[#883FFF] text-white px-4 py-3 rounded-r-lg hover:bg-[#7623EA] transition-colors">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
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
};

export default Blogs;
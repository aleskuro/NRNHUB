import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useFetchBlogsByCategoryQuery, useFetchBlogsQuery } from '../../Redux/features/blogs/blogApi';
import noImage from '../../assets/images.png';
import { Clock, BookOpen } from 'lucide-react';
import {Helmet} from 'react-helmet';



const Category = () => {
  const { category } = useParams();
  const normalizedCategory = category?.toLowerCase() || 'general';

  // Fetch blogs for the specific category
  const {
    data: blogs = [],
    isLoading,
    error,
    isError,
    refetch,
  } = useFetchBlogsByCategoryQuery(normalizedCategory, {
    skip: !normalizedCategory,
  });

  // Fetch all blogs for suggestions
  const { data: allBlogs = [] } = useFetchBlogsQuery({
    search: '',
    category: '',
  });

  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [remainingBlogs, setRemainingBlogs] = useState([]);
  const [suggestedBlogs, setSuggestedBlogs] = useState([]);

  // Debug logs
  useEffect(() => {
    console.log('--- Category Debug Start ---');
    console.log('Category Param:', category);
    console.log('Normalized Category:', normalizedCategory);
    console.log('API Request URL:', `http://localhost:5000/api/blogs/category/${encodeURIComponent(normalizedCategory)}`);
    console.log('API Response Data:', blogs);
    console.log('Blogs Count:', blogs.length);
    console.log('Is Loading:', isLoading);
    console.log('Is Error:', isError);
    console.log('Error Details:', error);
    console.log('All Blogs Count:', allBlogs.length);
    console.log('--- Category Debug End ---');

    if (isError && error) {
      console.error('Error Details:', JSON.stringify(error, null, 2));
    }

    refetch();
  }, [normalizedCategory, error, isLoading, isError, allBlogs, refetch]); // Removed 'blogs' from dependencies

  // Process blogs
  useEffect(() => {
    if (blogs.length > 0) {
      const sortedBlogs = [...blogs].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setFeaturedBlogs(sortedBlogs.slice(0, 3));
      setRemainingBlogs(sortedBlogs.slice(3));

      const blogIds = new Set(blogs.map((blog) => blog._id));
      const otherBlogs = allBlogs.filter(
        (blog) =>
          !blogIds.has(blog._id) &&
          blog.category?.toLowerCase() !== normalizedCategory
      );
      const shuffled = [...otherBlogs].sort(() => Math.random() - 0.5);
      setSuggestedBlogs(shuffled.slice(0, 3));
    } else {
      setFeaturedBlogs([]);
      setRemainingBlogs([]);
      setSuggestedBlogs([]);
    }
  }, [blogs, allBlogs, normalizedCategory]);

  // Utility functions
  const truncateTitle = (title, maxLength = 45) => {
    if (!title) return 'Untitled';
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength - 3) + '...';
  };

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
    cars: 'bg-indigo-600',
    general: 'bg-[#883FFF]',
    sasa: 'bg-purple-600',
  };

  const getCategoryColor = (category) => {
    const normalizedCat = category?.toLowerCase() || 'general';
    return categoryColors[normalizedCat] || 'bg-[#883FFF]';
  };

  const scrollToTop = () => window.scrollTo(0, 0);

  const BlogCard = ({ blog, featured = false }) => (
    <Link to={`/blogs/${blog._id}`} onClick={scrollToTop} className="block group">
      <div
        className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${
          featured ? 'h-full' : ''
        }`}
      >
        <div className="relative">
          <img
            src={blog.coverImg || noImage}
            alt={blog.title}
            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => (e.target.src = noImage)}
          />
          <div
            className={`absolute top-3 left-3 ${getCategoryColor(
              blog.category
            )} text-white text-xs px-2 py-1 rounded-full`}
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
            {truncateTitle(blog.title)}
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
            <span className="text-xs text-gray-500">
              {formatDate(blog.createdAt)}
            </span>
            <button className="text-[#883FFF] hover:text-[#7623EA] font-medium text-sm">
              Read more →
            </button>
          </div>
        </div>
      </div>
    </Link>
  );

  const CompactBlogCard = ({ blog }) => (
    <Link
      to={`/blogs/${blog._id}`}
      onClick={scrollToTop}
      className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-r from-gray-50 to-gray-100"
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
          {(blog.title || 'Untitled').substring(0, 70)}
          {blog.title?.length > 70 ? '...' : ''}
        </h4>
        <p className="text-gray-600 text-sm">
          {(blog.description || 'No description available').substring(0, 100)}...
        </p>
        <div className="mt-2">
          <span
            className={`inline-block ${getCategoryColor(
              blog.category
            )} text-white text-xs px-2 py-1 rounded-full`}
          >
            {blog.category || 'General'}
          </span>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="mt-16 bg-gradient-to-b from-[#E6F0FA] to-[#F3E8FF] min-h-screen text-gray-800">
      <Helmet>
        <link rel="canonical" href={`http://localhost:5173/category/${normalizedCategory}`} />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative py-16 bg-gradient-to-r from-[#883FFF] to-[#6023BB] rounded-2xl mb-12 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-white/30 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/20 blur-3xl"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center">
              <span
                className={`inline-block px-4 py-1 rounded-full ${getCategoryColor(
                  normalizedCategory
                )} bg-opacity-80 text-white text-sm font-medium mb-4`}
              >
                Browse by Category
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 capitalize">
                {normalizedCategory} <span className="text-purple-200">Blogs</span>
              </h1>
              <p className="text-lg text-purple-100 max-w-2xl mx-auto">
                Explore our latest articles, insights, and stories in the{' '}
                {normalizedCategory} category.
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#883FFF] mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">
              Loading {normalizedCategory} blogs...
            </p>
          </div>
        )}

        {/* Error State */}
        {isError && error && (
          <div className="p-8 text-center bg-red-50 rounded-xl text-red-600 my-8">
            <h3 className="text-xl font-bold mb-2">Oops! Something went wrong.</h3>
            <p>
              {error?.status === 404
                ? `No blogs found for category: ${normalizedCategory}`
                : error?.data?.message ||
                  error?.message ||
                  `Failed to fetch ${normalizedCategory} blogs.`}
            </p>
          </div>
        )}

        {/* No Blogs State */}
        {!isLoading && !isError && blogs.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen size={40} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No blogs found
            </h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any blogs in the {normalizedCategory} category.
            </p>
            <Link
              to="/blogs"
              className="inline-block px-6 py-3 bg-[#883FFF] text-white rounded-lg hover:bg-[#7623EA] transition-colors"
            >
              Browse all blogs
            </Link>
          </div>
        )}

        {/* Featured Blogs */}
        {!isLoading && !isError && featuredBlogs.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-6">
              Featured {normalizedCategory} Blogs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredBlogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} featured={true} />
              ))}
            </div>
          </div>
        )}

        {/* Ad Space */}
        <div className="my-12 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((adNum) => (
            <div
              key={`ad-${adNum}`}
              className="w-full bg-gradient-to-r from-gray-100 to-gray-200 p-4 text-center rounded-lg shadow-md h-32 flex items-center justify-center"
            >
              <div className="text-center">
                <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                  Advertisement
                </div>
                <div className="text-gray-400 font-medium">
                  Premium Ad Placement {adNum}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* More Articles */}
        {!isLoading && !isError && remainingBlogs.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-teal-600 mb-6">
              More {normalizedCategory} Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {remainingBlogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          </div>
        )}

        {/* Suggested Blogs */}
        {!isLoading && !isError && suggestedBlogs.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-rose-600 mb-6">
              You Might Also Be Interested In
            </h2>
            <div className="mt-6 space-y-6">
              {suggestedBlogs.map((blog) => (
                <CompactBlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          </div>
        )}

        {/* Categories Navigation */}
        <div className="mt-12 bg-white shadow-md rounded-xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Explore Other Categories
          </h3>
          <div className="flex flex-wrap gap-3">
            {Object.keys(categoryColors).map((cat) => (
              <Link
                key={cat}
                to={`/category/${cat}`}
                onClick={scrollToTop}
                className={`px-4 py-2 rounded-full text-sm ${
                  normalizedCategory === cat
                    ? `${getCategoryColor(cat)} text-white`
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                } transition-colors capitalize`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-16 bg-gradient-to-r from-[#883FFF]/10 to-[#6023BB]/10 rounded-2xl p-8 md:p-12">
          <div className="md:flex items-center justify-between">
            <div className="md:w-2/3 mb-6 md:mb-0">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                Stay updated with our newsletter
              </h3>
              <p className="text-gray-600">
                Get the latest {normalizedCategory} articles right in your inbox.
              </p>
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

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Category;


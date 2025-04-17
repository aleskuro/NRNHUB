import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useFetchBlogsByCategoryQuery } from '../../Redux/features/blogs/blogApi';
import noImage from '../../assets/images.png';
import { Clock } from 'lucide-react';

const Category = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category') || 'general';

  const { data: blogs = [], isLoading, error } = useFetchBlogsByCategoryQuery(category);

  // Utility functions (copied from Blogs.jsx for consistency)
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

  const getReadTime = () => {
    return Math.floor(Math.random() * 10) + 3;
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
    cars: 'bg-indigo-600', // Added for cars
    general: 'bg-[#883FFF]',
  };

  const getCategoryColor = (category) => {
    const normalizedCategory = category?.toLowerCase() || 'general';
    return categoryColors[normalizedCategory] || 'bg-[#883FFF]';
  };

  return (
    <div className="mt-16 bg-gradient-to-b from-[#E6F0FA] to-[#F3E8FF] min-h-screen text-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-bold text-[#883FFF] mb-8 capitalize">
          {category} Blogs
        </h1>

        {/* Loading State */}
        {isLoading && (
          <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mx-auto"></div>
              <p className="mt-4 text-lg text-gray-600">Loading {category} blogs...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="p-8 text-center text-[#883FFF]">
            Oops! Something went wrong. {error?.message || 'Failed to fetch blogs.'}
          </div>
        )}

        {/* No Blogs State */}
        {!isLoading && !error && blogs.length === 0 && (
          <div className="text-center text-lg text-gray-600">
            No blogs found in the {category} category.
          </div>
        )}

        {/* Blog Grid */}
        {!isLoading && !error && blogs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <Link to={`/blogs/${blog._id}`} key={blog._id} className="block group">
                <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                  <div className="relative">
                    <img
                      src={blog.coverImg}
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
        )}
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
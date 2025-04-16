import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBlog from './SearchBlog';
import { useFetchBlogsQuery } from '../../Redux/features/blogs/blogApi';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector, useDispatch } from 'react-redux';
import noImage from '../../assets/images.png';

const Blogs = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState({ search: '', category: '' });
  const { data: blogs = [], error, isLoading } = useFetchBlogsQuery(query);

  const handleSearchChange = (e) => setSearch(e.target.value);
  const handleSearch = () => setQuery({ search, category });

  const truncateTitle = (title, maxLength = 30) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength - 3) + '...';
  };

  const newReleases = [...blogs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 20);

  const popular = [...blogs]
    .filter((_, index) => index % 2 === 0)
    .slice(0, 20);

  const suggestions = [...blogs]
    .filter((_, index) => index % 2 !== 0)
    .slice(0, 20);

  const sections = query.search
    ? [{ title: 'Search Results', blogs }]
    : [
        { title: 'New Releases', blogs: newReleases },
        { title: 'Popular', blogs: popular },
        { title: 'Suggestions', blogs: suggestions },
      ];

  return (
    <div className="mt-16 bg-gradient-to-b from-[#E6F0FA] to-[#F3E8FF] min-h-screen text-gray-800 px-4">
      <div className="container mx-auto py-6">
        <SearchBlog
          search={search}
          handleSearchChange={handleSearchChange}
          handleSearch={handleSearch}
        />
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Searching for wisdom...</p>
          </div>
        </div>
      )}

      {error && !isLoading && (
        <div className="p-8 text-center text-red-500">
          Oops! Something went sideways. {error?.message || 'Failed to fetch blogs.'}
        </div>
      )}

      {blogs.length === 0 && !isLoading && !error && (
        <div className="mt-12 text-center text-lg text-gray-600">
          No blogs found. (It’s a bit quiet here, isn’t it?)
        </div>
      )}

      {blogs.length > 0 && !isLoading && (
        <div className="container mx-auto pb-12 space-y-16">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-3xl font-bold mb-6 px-4 text-red-700">{section.title}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 px-4">
                {section.blogs.map((blog) => (
                  <Link
                    to={`/blogs/${blog._id}`}
                    key={blog._id}
                    className="block"
                  >
                    <div className="relative rounded-xl overflow-hidden shadow-lg bg-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                      <img
                        src={blog.coverImg}
                        alt={blog.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => (e.target.src = noImage)}
                      />
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-1">
                          {truncateTitle(blog.title)}{' '}
                          <span className="text-sm text-red-500 font-medium">
                            ({blog.category || 'General'})
                          </span>
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {blog.description || 'Discover more by diving in...'}
                        </p>
                        <button className="mt-3 bg-red-500 text-white px-4 py-1 rounded-full text-sm font-medium hover:bg-red-600 transition-colors">
                          Read Now
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

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

export default Blogs;

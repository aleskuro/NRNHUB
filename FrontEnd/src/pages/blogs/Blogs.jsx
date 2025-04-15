import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import SearchBlog from './SearchBlog';
import { useFetchBlogsQuery } from '../../Redux/features/blogs/blogAPI';
import 'react-toastify/dist/ReactToastify.css';
import { logout } from '../../Redux/features/auth/authSlice';
import { toast } from 'react-toastify'; // Changed from /unstyled
// import { noImage} from '/Users/user/Desktop/nnrnhub/FrontEnd/src/assets/images.jpeg'
import { useSelector, useDispatch } from 'react-redux';
import noImage from '../../assets/images.png';
// C:\Users\user\Desktop\nnrnhub\FrontEnd\src\assets\images.jpeg

const Blogs = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState({ search: '', category: '' });
  const { data: blogs = [], error, isLoading } = useFetchBlogsQuery(query);
  const scrollRefs = useRef({});

  const handleSearchChange = (e) => setSearch(e.target.value);
  const handleSearch = () => setQuery({ search, category });

  // Truncate title function
  const truncateTitle = (title, maxLength = 30) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength - 3) + '...';
  };

  // Blog sections
  const newReleases = [...blogs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);
  const popular = [...blogs]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 10);
  const suggestions = [...blogs].sort(() => Math.random() - 0.5).slice(0, 10);

  const sections = query.search
    ? [{ title: 'Search Results', blogs }]
    : [
        { title: 'New Releases', blogs: newReleases },
        { title: 'Popular', blogs: popular },
        { title: 'Suggestions', blogs: suggestions },
      ];

  const scrollLeft = (title) => {
    const container = scrollRefs.current[title];
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = (title) => {
    const container = scrollRefs.current[title];
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="mt-16 bg-gradient-to-b from-[#E6F0FA] to-[#F3E8FF] min-h-screen text-gray-800 px-4">
      {/* Search Header */}
      <div className="container mx-auto py-6">
        <SearchBlog
          search={search}
          handleSearchChange={handleSearchChange}
          handleSearch={handleSearch}
        />
      </div>

      {/* Loading Screen for Search */}
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
        <div className="p-8 text-center text-red-500">
          Oops! Something went sideways. {error?.message || 'Failed to fetch blogs.'}
        </div>
      )}

      {/* Empty State */}
      {blogs.length === 0 && !isLoading && !error && (
        <div className="mt-12 text-center text-lg text-gray-600">
          No blogs found. (It’s a bit quiet here, isn’t it?)
        </div>
      )}

      {/* Blog Sections */}
      {blogs.length > 0 && !isLoading && (
        <div className="container mx-auto pb-12">
          {sections.map((section) => (
            <div key={section.title} className="mb-12">
              <h2 className="text-3xl font-bold mb-6 px-4 text-indigo-700">{section.title}</h2>
              <div className="relative">
                <div
                  ref={(el) => (scrollRefs.current[section.title] = el)}
                  className="flex overflow-x-auto scrollbar-hide space-x-6 px-4 snap-x snap-mandatory"
                >
                  {section.blogs.map((blog) => (
                    <Link
                      to={`/blogs/${blog._id}`}
                      key={blog._id}
                      className="flex-shrink-0 w-72 snap-start"
                    >
                      <div className="relative rounded-xl overflow-hidden shadow-lg bg-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                        <img
                          src={blog.coverImg}
                          alt={blog.title}
                          className="w-full h-52 object-cover"
                          onError={(e) => (e.target.src = noImage)}
                        />
                        <div className="p-4">
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">
                            {truncateTitle(blog.title)}{' '}
                            <span className="text-sm text-indigo-500">
                              ({blog.category || 'General'})
                            </span>
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {blog.description || 'Discover more by diving in...'}
                          </p>
                          <button className="mt-3 bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-medium hover:bg-indigo-600 transition-colors">
                            Read Now
                          </button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
                {/* Scroll Arrows */}
                <button
                  onClick={() => scrollLeft(section.title)}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-indigo-100 p-3 rounded-full shadow-md hover:bg-indigo-200 transition-all focus:outline-none"
                  aria-label={`Scroll ${section.title} left`}
                >
                  <svg className="w-5 h-5 text-indigo-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M12.707 15.707a1 1 0 01-1.414 0L5.586 10l5.707-5.707a1 1 0 011.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z" />
                  </svg>
                </button>
                <button
                  onClick={() => scrollRight(section.title)}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-indigo-100 p-3 rounded-full shadow-md hover:bg-indigo-200 transition-all focus:outline-none"
                  aria-label={`Scroll ${section.title} right`}
                >
                  <svg className="w-5 h-5 text-indigo-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7.293 15.707a1 1 0 001.414 0L14.414 10l-5.707-5.707a1 1 0 00-1.414 1.414L11.586 10l-4.293 4.293a1 1 0 000 1.414z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Scrollbar Hiding CSS */}
      <style >{`
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
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
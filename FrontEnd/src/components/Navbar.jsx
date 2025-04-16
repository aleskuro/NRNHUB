import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../Redux/features/auth/authSlice';
import { useFetchBlogsQuery } from '../Redux/features/blogs/blogApi';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import commentor from '../assets/commentor.png';
import noImage from '../assets/images.png';

// Define the navigation links and their paths
const Navlists = [
  { name: 'HOME', path: '/' },
  {
    name: 'CULTURE',
    path: '/culture',
    dropdown: [
      { name: 'FESTIVAL', path: '/culture/festivals' },
      { name: 'TRADITION', path: '/culture/tradition' },
    ],
  },
  { name: 'SOCIAL', path: '/social' },
  { name: 'ECONOMY', path: '/economy' },
  {
    name: 'BLOG',
    path: '/blog',
    dropdown: [
      { name: 'TECHNOLOGY', path: '/blog/technology' },
      { name: 'TRAVEL', path: '/blog/travel' },
    ],
  },
  { name: 'TRENDING', path: '/trending' },
  { name: 'EVENTS', path: '/events' },
];

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdowns, setDropdowns] = useState({});
  const [mobileDropdowns, setMobileDropdowns] = useState({});

  // Fetch latest blogs for BLOG dropdown
  const { data: blogs = [], isLoading } = useFetchBlogsQuery({ search: '', category: '' });
  const latestBlogs = [...blogs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3); // Limit to 3 for dropdown

  const formatDate = () =>
    new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const handleMouseEnter = (name) => {
    clearTimeout(dropdowns[name]?.timeout);
    setDropdowns((prev) => ({
      ...prev,
      [name]: { visible: true, timeout: null },
    }));
  };

  const handleMouseLeave = (name) => {
    const timeout = setTimeout(() => {
      setDropdowns((prev) => ({
        ...prev,
        [name]: { ...prev[name], visible: false },
      }));
    }, 1200);
    setDropdowns((prev) => ({
      ...prev,
      [name]: { ...prev[name], timeout },
    }));
  };

  const toggleMobileDropdown = (name) => {
    setMobileDropdowns((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleLogout = () => {
    dispatch(logout()).then(() => {
      toast.success('Logged out successfully!');
      navigate('/');
      setMenuOpen(false);
      setDropdowns((prev) => ({ ...prev, profile: { visible: false } }));
    });
  };

  const toggleProfileDropdown = () => {
    setDropdowns((prev) => ({
      ...prev,
      profile: { visible: !prev.profile?.visible },
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setDropdowns((prev) => ({ ...prev, profile: { visible: false } }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileRef]);

  // Truncate title function from Blogs
  const truncateTitle = (title, maxLength = 30) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength - 3) + '...';
  };

  return (
    <header className="bg-white text-black shadow sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4 py-2 flex items-center relative">
        {/* Left Section - Logo and Date */}
        <div className="flex flex-col">
          <NavLink to="/" className="flex flex-col items-center">
            <h1
              className="relative text-4xl md:text-5xl font-extrabold tracking-wider"
              style={{ fontFamily: '"Luxurious Roman", serif' }}
            >
              <span className="text-blue-600">NRN</span>
              <span className="text-red-600">HUB</span>
              <span
                className="absolute inset-0 text-4xl md:text-5xl font-extrabold tracking-wider text-gray-200 opacity-10 blur-md"
                style={{ fontFamily: '"Luxurious Roman", serif' }}
              >
                NRNHUB
              </span>
            </h1>
          </NavLink>
          <div
            className="text-sm text-gray-700 mt-1 hidden md:block"
            style={{ fontFamily: '"Luxurious Roman", serif' }}
          >
            {formatDate()}
          </div>
        </div>

        {/* Right Section - Menu Trigger and User/Auth */}
        <div className="flex items-center gap-4 ml-auto">
          {/* Mobile Menu Trigger */}
          <button
            className="text-2xl md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Menu"
            style={{ fontFamily: '"Luxurious Roman", serif' }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>

          {/* User/Auth */}
          {!user && (
            <div className="hidden md:flex items-center gap-4">
              <NavLink
                to="/login"
                className="px-5 py-2 rounded-lg text-lg font-semibold bg-[#2260bf] text-white hover:bg-[#1e55a8] transition-all duration-300 shadow-lg hover:shadow-[#1e55a8]/50"
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="px-5 py-2 rounded-lg text-lg font-semibold bg-[#2260bf] text-white hover:bg-[#1e55a8] transition-all duration-300 shadow-lg hover:shadow-[#1e55a8]/50"
              >
                Sign In
              </NavLink>
            </div>
          )}
          {user && (
            <div className="relative" ref={profileRef}>
              <button
                className="focus:outline-none"
                onClick={toggleProfileDropdown}
                aria-label="User Profile"
              >
                <img
                  src={commentor}
                  alt="User"
                  className="w-10 h-10 rounded-full border-2 border-indigo-500 shadow-md hover:scale-105 hover:rotate-6 transition-all duration-300 ease-in-out cursor-pointer animate-[pulse-border_2s_infinite]"
                />
              </button>
              {dropdowns.profile?.visible && (
                <div
                  className={`absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-xl z-50 transition-all duration-300 ease-in-out ${
                    dropdowns.profile?.visible
                      ? 'opacity-100 pointer-events-auto translate-y-0'
                      : 'opacity-0 pointer-events-none -translate-y-2'
                  }`}
                >
                  <div className="px-4 py-3 text-base font-medium text-gray-900 border-b border-gray-100">
                    👋 {user.username || 'User'}
                  </div>
                  {user.role === "admin" && (
                    <NavLink
                      to="/dashboard"
                      className="block px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 hover:text-[#2260bf] transition-all duration-200 cursor-pointer"
                      onClick={() => setDropdowns((prev) => ({ ...prev, profile: { visible: false } }))}
                    >
                      Dashboard
                    </NavLink>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:block w-full" style={{ backgroundColor: '#2260bf' }}>
        <div className="mx-auto px-4 py-3 flex justify-start">
          <ul className="flex gap-8 ml-120">
            {Navlists.map((list, index) => (
              <li key={index} className="relative">
                {list.dropdown ? (
                  <div
                    onMouseEnter={() => handleMouseEnter(list.name)}
                    onMouseLeave={() => handleMouseLeave(list.name)}
                  >
                    <NavLink
                      to={list.path}
                      className={({ isActive }) =>
                        `text-lg font-bold text-white hover:text-[#70c9ff] transition-all duration-300 ${
                          isActive ? 'text-[#70c9ff]' : ''
                        }`
                      }
                      style={{ fontFamily: '"Luxurious Roman", serif' }}
                    >
                      {list.name} <span className="ml-1 text-sm">▼</span>
                    </NavLink>
                    <div
                      className={`absolute left-0 mt-2 w-96 bg-white border border-gray-100 rounded-lg shadow-xl z-10 transition-all duration-300 ease-in-out ${
                        dropdowns[list.name]?.visible
                          ? 'opacity-100 pointer-events-auto translate-y-0'
                          : 'opacity-0 pointer-events-none -translate-y-2'
                      }`}
                    >
                      {list.name === 'BLOG' && (
                        <div className="p-5 border-b border-gray-100">
                          <h3 className="text-xl font-semibold text-gray-900 mb-4">
                            Latest Blogs
                          </h3>
                          {isLoading ? (
                            <div className="text-center text-gray-600 text-base">Loading...</div>
                          ) : latestBlogs.length > 0 ? (
                            latestBlogs.map((blog) => (
                              <NavLink
                                key={blog._id}
                                to={`/blogs/${blog._id}`}
                                className="flex gap-4 p-3 hover:bg-gray-50 rounded-md transition-all duration-300 group"
                              >
                                <img
                                  src={blog.coverImg}
                                  alt={blog.title}
                                  className="w-16 h-16 object-cover rounded group-hover:scale-105 transition-transform"
                                  onError={(e) => (e.target.src = noImage)}
                                />
                                <div>
                                  <h4 className="text-base font-medium text-gray-900 group-hover:text-[#2260bf]">
                                    {truncateTitle(blog.title)}
                                  </h4>
                                  <span className="text-sm text-[#70c9ff]">
                                    {blog.category || 'General'}
                                  </span>
                                </div>
                              </NavLink>
                            ))
                          ) : (
                            <div className="text-center text-gray-600 text-base">
                              No blogs available.
                            </div>
                          )}
                        </div>
                      )}
                      <ul>
                        {list.dropdown.map((item, idx) => (
                          <li key={idx}>
                            <NavLink
                              to={item.path}
                              className={({ isActive }) =>
                                `block px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 hover:text-[#2260bf] transition-all duration-200 ${
                                  isActive ? 'text-[#2260bf]' : ''
                                }`
                              }
                              style={{ fontFamily: '"Luxurious Roman", serif' }}
                            >
                              {item.name}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <NavLink
                    to={list.path}
                    className={({ isActive }) =>
                      `text-lg font-bold text-white hover:text-[#70c9ff] transition-all duration-300 ${
                        isActive ? 'text-[#70c9ff]' : ''
                      }`
                    }
                    style={{ fontFamily: '"Luxurious Roman", serif' }}
                  >
                    {list.name}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {menuOpen && (
        <nav className="md:hidden px-4 pb-6">
          <div className="flex flex-col items-center mb-4">
            <div
              className="text-sm text-gray-700 mb-2"
              style={{ fontFamily: '"Luxurious Roman", serif' }}
            >
              {formatDate()}
            </div>
            {!user && (
              <div className="flex flex-col gap-2 w-full items-center mb-3">
                <NavLink
                  to="/login"
                  className="block w-full bg-[#2260bf] text-white text-center py-3 px-5 rounded-md text-lg font-semibold hover:bg-[#1e55a8] transition shadow-lg hover:shadow-[#1e55a8]/50"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="block w-full bg-[#2260bf] text-white text-center py-3 px-5 rounded-md text-lg font-semibold hover:bg-[#1e55a8] transition shadow-lg hover:shadow-[#1e55a8]/50"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign In
                </NavLink>
              </div>
            )}
            {user && (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center space-x-2">
                  <img
                    src={commentor}
                    alt="Mobile User"
                    className="rounded-full h-8 w-8 object-cover"
                  />
                  <span style={{ fontFamily: '"Luxurious Roman", serif' }}>
                    {user.username || 'User'}
                  </span>
                </div>
                {user.role === "admin" && (
                  <NavLink
                    to="/dashboard"
                    className="block w-full text-center py-2 text-green-600 hover:text-green-700 mt-2 rounded-md border border-green-200"
                  >
                    Dashboard
                  </NavLink>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-center py-2 text-red-600 hover:bg-red-100 text-sm cursor-pointer rounded-md border border-red-200"
                  style={{ fontFamily: '"Luxurious Roman", serif' }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
          <ul className="flex flex-col gap-2">
            {Navlists.map((list, index) => (
              <li key={index}>
                {list.dropdown ? (
                  <div>
                    <button
                      className="w-full text-left py-2 flex justify-between items-center"
                      onClick={() => toggleMobileDropdown(list.name)}
                      style={{ fontFamily: '"Luxurious Roman", serif' }}
                    >
                      {list.name}
                      <span>{mobileDropdowns[list.name] ? '▲' : '▼'}</span>
                    </button>
                    {mobileDropdowns[list.name] && (
                      <ul className="ml-4 border-l pl-4 space-y-1">
                        {list.name === 'BLOG' && (
                          <>
                            {latestBlogs.map((blog) => (
                              <li key={blog._id}>
                                <NavLink
                                  to={`/blogs/${blog._id}`}
                                  className="block py-2 text-sm hover:text-[#70c9ff]"
                                  onClick={() => setMenuOpen(false)}
                                  style={{ fontFamily: '"Luxurious Roman", serif' }}
                                >
                                  {truncateTitle(blog.title)}
                                </NavLink>
                              </li>
                            ))}
                          </>
                        )}
                        {list.dropdown.map((item, idx) => (
                          <li key={idx}>
                            <NavLink
                              to={item.path}
                              className="block py-2 text-sm hover:text-[#70c9ff]"
                              onClick={() => setMenuOpen(false)}
                              style={{ fontFamily: '"Luxurious Roman", serif' }}
                            >
                              {item.name}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <NavLink
                    to={list.path}
                    className="block py-2 text-sm hover:text-[#70c9ff]"
                    onClick={() => setMenuOpen(false)}
                    style={{ fontFamily: '"Luxurious Roman", serif' }}
                  >
                    {list.name}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'; // ← useDispatch
import { logout } from '../Redux/features/auth/authSlice';
import { useFetchBlogsQuery } from '../Redux/features/blogs/blogApi';
import { fetchAdsFromServer } from '../Redux/features/ads/adThunks'; // ← ADD THIS
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import commentor from '../assets/commentor.png';
import noImage from '../assets/images.png';
import logo from './logo.png';
import { useNepaliDate, useNepaliTime } from "/utilis/nepaliDateTime.js";

const Navlists = [
  { name: 'HOME', path: '/' },
  {
    name: 'LIFESTYLE',
    path: '/lifestyle',
    dropdown: [
      { name: 'Health', path: '/lifestyle/health' },
      { name: 'Parenting', path: '/lifestyle/parenting' },
      { name: 'Travel', path: '/lifestyle/travel' },
      { name: 'Food', path: '/lifestyle/food' },
      { name: 'Entertainment', path: '/lifestyle/entertainment' },
      { name: 'Sports', path: '/lifestyle/sports' },
    ],
  },
  {
    name: 'ECONOMY',
    path: '/economy',
    dropdown: [
      { name: 'Market', path: '/economy/market' },
      { name: 'Entrepreneurship', path: '/economy/small-business' },
      { name: 'Real Estate', path: '/economy/real-estate' },
      { name: 'Start-Up', path: '/economy/startup' },
      { name: 'Global', path: '/economy/global' },
      { name: 'Personal Finance', path: '/economy/personal-finance' },
    ],
  },
  {
    name: 'PODCAST',
    path: '/podcast',
    dropdown: [
      { name: 'Interviews', path: '/podcast/interviews' },
      { name: 'Videos', path: '/podcast/videos' },
    ],
  },
  {
    name: 'EDU-HUB',
    path: '/edu-hub',
    dropdown: [
      { name: 'Finance', path: '/edu-hub/finance' },
      { name: 'Health', path: '/edu-hub/health' },
      { name: 'Business', path: '/edu-hub/business' },
      { name: 'Language', path: '/edu-hub/language' },
    ],
  },
  { name: 'EVENTS', path: '/events' },
  {
    name: 'CONSULT WITH US',
    path: '/book-call',
    dropdown: [
      { name: 'Legal', path: '/book-call' },
      { name: 'Business', path: '/book-call' },
      { name: 'Real Estate', path: '/book-call' },
      { name: 'Immigration & Visa', path: '/book-call' },
      { name: 'Career', path: '/book-call' },
    ],
  },
];

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const { adImages = {}, adLinks = {}, visibility = {} } = useSelector((state) => state.ads || {});
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdowns, setDropdowns] = useState({});
  const [mobileDropdowns, setMobileDropdowns] = useState({});
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  const { englishDate, nepaliBsDate } = useNepaliDate();
  const { nepaliTime } = useNepaliTime();

  const { isLoading } = useFetchBlogsQuery({ search: '', category: '' });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
      if (width >= 1024 && menuOpen) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [menuOpen]);

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
        [name]: { visible: false, timeout: null },
      }));
    }, 1200);
    setDropdowns((prev) => ({
      ...prev,
      [name]: { visible: true, timeout },
    }));
  };

  const toggleTabletDropdown = (name) => {
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

  const handleNavLinkClick = () => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setDropdowns((prev) => ({ ...prev, profile: { visible: false } }));
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const truncateTitle = (title, maxLength = 30) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength - 3) + '...';
  };

  return (
    <header className="bg-white text-black shadow sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4 py-2 flex items-center relative">
        {/* Logo and Title for Tablet/Mobile */}
        <div className={`flex items-center mr-6 ${isDesktop ? 'hidden' : ''}`}>
          <NavLink to="/" className="flex items-center gap-2" onClick={handleNavLinkClick}>
            <img
              src={logo}
              alt="NRNHUB Logo"
              className="h-10 transform transition-transform duration-300 hover:scale-105"
            />
            <span
              className="text-xl font-bold text-black hover:text-[#C4A1FF] transition-colors duration-300"
              style={{ fontFamily: '"Baumans", sans-serif' }}
            >
              NRNHUB
            </span>
          </NavLink>
        </div>

        {/* Middle Section - Ad Banner */}
        {visibility.navbar && (
          <div className="flex-1 flex justify-center items-center ml-2 md:ml-8 lg:ml-16 md:px-6 lg:px-14">
            {adImages.navbar ? (
              <a
                href={adLinks.navbar || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
                onClick={() => console.log('Navbar ad clicked:', adLinks.navbar)}
              >
                <img
                  src={adImages.navbar}
                  alt="Navbar Ad"
                  className="w-full h-12 md:h-16 lg:h-20 object-cover rounded-lg shadow"
                  onError={(e) => {
                    console.error(`Failed to load navbar ad image: ${adImages.navbar}`);
                    e.target.src = noImage;
                  }}
                />
              </a>
            ) : (
              <div className="w-full bg-gray-100 p-3 rounded-lg shadow-md text-center">
                <p className="text-gray-600 font-semibold text-sm">
                  Navbar Ad Placeholder - Upload an image in Manage Ads
                </p>
              </div>
            )}
          </div>
        )}

        {/* Right Section - Date, Time, Menu Trigger */}
        <div className="flex items-center ml-auto gap-4">
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm font-semibold tracking-wide" style={{ color: '#000000' }}>{englishDate}</span>
            <span className="text-sm text-purple-400 font-light">|</span>
            <span className="text-sm font-semibold tracking-wide text-gray-900">{nepaliBsDate}</span>
          </div>
          <button
            className="text-2xl lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Menu"
            style={{ fontFamily: '"Luxurious Roman", serif' }}
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav
        className="hidden lg:flex w-full items-center px-43 transition-all duration-500 hover:bg-[length:200%_auto] hover:bg-right bg-white"
        style={{
          backgroundSize: '200% auto',
          backgroundPosition: 'left center',
        }}
      >
        <div className="mr-4 xl:mr-6">
          <NavLink to="/" className="flex items-center gap-3 xl:gap-4" onClick={handleNavLinkClick}>
            <img
              src={logo}
              alt="NRNHUB Logo"
              className="h-12 xl:h-14 transform transition-transform duration-300 hover:scale-105"
            />
            <span
              className="text-2xl xl:text-3xl font-bold text-black hover:text-[#C4A1FF] transition-colors duration-300"
              style={{ fontFamily: '"Baumans", sans-serif' }}
            >
              NRNHUB
            </span>
          </NavLink>
        </div>

        <div className="flex-1 flex justify-center">
          <ul className="flex gap-1 xl:gap-2">
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
                        `inline-block px-2 xl:px-4 py-2 text-base xl:text-lg font-bold bg-white hover:text-[#C4A1FF] rounded-md transition-all duration-300 ${
                          isActive ? 'text-[#C4A1FF] underline underline-offset-4 decoration-[#C4A1FF]' : 'text-black'
                        }`
                      }
                      onClick={handleNavLinkClick}
                    >
                      {list.name}
                    </NavLink>
                    <div
                      className={`absolute left-0 mt-2 bg-white border border-gray-100 rounded-lg shadow-xl z-10 transition-all duration-300 ease-in-out ${
                        dropdowns[list.name]?.visible
                          ? 'opacity-100 pointer-events-auto translate-y-0'
                          : 'opacity-0 pointer-events-none -translate-y-2'
                      } ${list.name === 'ECONOMY' ? 'w-[294px]' : 'w-64'}`}
                    >
                      <ul className={`${list.dropdown.length > 5 ? 'grid grid-cols-2' : ''}`}>
                        {list.dropdown.map((item, idx) => (
                          <li key={idx}>
                            <NavLink
                              to={item.path}
                              className={({ isActive }) =>
                                `block px-4 py-3 text-base font-medium 
                                 /* TEXT-ONLY PURPLE GLOW */
                                 hover:text-[#C4A1FF] hover:text-shadow-glow 
                                 transition-all duration-200
                                 ${isActive 
                                   ? 'text-[#C4A1FF] underline underline-offset-4 decoration-[#C4A1FF]' 
                                   : 'text-gray-900'
                                 }
                                 ${item.name === 'Personal Finance' ? 'whitespace-nowrap' : ''}`
                              }
                              onClick={handleNavLinkClick}
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
                      `inline-block px-2 xl:px-4 py-2 text-base xl:text-lg font-bold bg-white hover:text-[#C4A1FF] rounded-md transition-all duration-300 ${
                        isActive ? 'text-[#C4A1FF] underline underline-offset-4 decoration-[#C4A1FF]' : 'text-black'
                      }`
                    }
                    onClick={handleNavLinkClick}
                  >
                    {list.name}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-2">
          {!user ? (
            <>
              <NavLink
                to="/register"
                className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold shadow-md hover:scale-105 transition-transform"
                onClick={handleNavLinkClick}
              >
                REGISTER
              </NavLink>
              <NavLink
                to="/login"
                className="inline-block px-5 py-2 text-lg font-bold uppercase border-1 border-white bg-transparent rounded-lg hover:bg-white/20 hover:scale-105 transition-all duration-300"
                onClick={handleNavLinkClick}
              >
                Login
              </NavLink>
            </>
          ) : (
            <div className="relative mr-4" ref={profileRef}>
              <button
                className="focus:outline-none"
                onClick={toggleProfileDropdown}
                aria-label="User Profile"
              >
                <img
                  src={user.profileImage || commentor}
                  alt="User"
                  className="w-10 h-10 rounded-full border-2 border-[#C4A1FF] shadow-md hover:scale-105 hover:rotate-6 transition-all duration-300 ease-in-out cursor-pointer animate-[pulse-border_2s_infinite]"
                />
              </button>
              {dropdowns.profile?.visible && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-xl z-50 transition-all duration-300 ease-in-out">
                  <div className="px-4 py-3 text-base font-medium text-gray-900 border-b border-gray-100">
                    Hello {user.username || 'User'}
                  </div>
                  {user.role === 'admin' && (
                    <NavLink
                      to="/dashboard"
                      className="block px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 hover:text-[#C4A1FF] transition-all duration-200 cursor-pointer"
                      onClick={() => {
                        setDropdowns((prev) => ({ ...prev, profile: { visible: false } }));
                        handleNavLinkClick();
                      }}
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
      </nav>

      {/* Tablet/iPad Navigation */}
      {menuOpen && (
        <nav className="lg:hidden px-4 pb-6">
          <div className="flex flex-col items-center mb-4">
            {user && (
              <div className="flex flex-col items-center gap-2 mb-3">
                <div className="flex items-center space-x-2">
                  <img
                    src={user.profileImage || commentor}
                    alt="User"
                    className="rounded-full h-10 w-10 object-cover"
                  />
                  <span className="text-lg font-medium">{user.username || 'User'}</span>
                </div>
                {user.role === 'admin' && (
                  <NavLink
                    to="/dashboard"
                    className="block w-full text-center py-2 text-green-600 hover:text-green-700 mt-2 rounded-md border border-green-200"
                    onClick={handleNavLinkClick}
                  >
                    Dashboard
                  </NavLink>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-center py-2 text-red-600 hover:bg-red-100 text-base cursor-pointer rounded-md border border-red-200"
                >
                  Logout
                </button>
              </div>
            )}
            {!user && (
              <div className="flex flex-col md:flex-row gap-2 w-full">
                <NavLink
                  to="/login"
                  className="block w-full text-center px-5 py-2 text-lg font-bold border-2 border-gray-200 bg-transparent rounded-lg hover:bg-gray-50 hover:scale-105 transition-all duration-300"
                  onClick={handleNavLinkClick}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="block w-full text-center px-5 py-2 text-lg font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 hover:scale-105 transition-all duration-300"
                  onClick={handleNavLinkClick}
                >
                  Register
                </NavLink>
              </div>
            )}
          </div>

          <ul className="flex flex-col gap-2">
            {Navlists.map((list, index) => (
              <li key={index}>
                {list.dropdown ? (
                  <div>
                    <button
                      className="w-full text-left py-3 px-4 flex justify-between items-center text-lg font-semibold bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200"
                      onClick={() => toggleTabletDropdown(list.name)}
                    >
                      {list.name}
                      <svg
                        className={`w-5 h-5 transition-transform duration-200 ${
                          mobileDropdowns[list.name] ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {mobileDropdowns[list.name] && (
                      <div className="mt-2 rounded-lg">
                        <ul
                          className={`grid ${
                            isTablet && list.dropdown.length > 3 ? 'md:grid-cols-2' : 'grid-cols-1'
                          } gap-2 p-2`}
                        >
                          {list.dropdown.map((item, idx) => (
                            <li key={idx}>
                              <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                  `block px-4 py-2.5 text-base font-medium bg-white 
                                   /* TEXT-ONLY PURPLE GLOW */
                                   hover:text-[#C4A1FF] hover:text-shadow-glow 
                                   rounded-lg shadow-sm border border-gray-100 transition-all duration-200
                                   ${isActive 
                                     ? 'text-[#C4A1FF] bg-purple-50 border-purple-200' 
                                     : 'text-gray-700'
                                   }`
                                }
                                onClick={handleNavLinkClick}
                              >
                                {item.name}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    to={list.path}
                    className={({ isActive }) =>
                      `block py-3 px-4 text-lg font-semibold bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200 ${
                        isActive ? 'text-[#C4A1FF] bg-purple-50' : ''
                      }`
                    }
                    onClick={handleNavLinkClick}
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
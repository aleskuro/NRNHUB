import React, { useState, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination, Autoplay } from 'swiper/modules';
import { NavLink } from 'react-router-dom';
import { useFetchBlogsQuery } from '../../Redux/features/blogs/blogApi';
import noImage from '../../assets/images.png';

const Hero = () => {
  const [email, setEmail] = useState('');
  const {
    data: blogs = [],
    isLoading,
    error,
  } = useFetchBlogsQuery({ search: '', category: '' });

  // Sort and get the 5 most recent blogs
  const latestBlogs = useMemo(() => {
    return blogs
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [blogs]);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      alert('Please enter a valid email address.');
      return;
    }
    alert(`Subscribed with: ${email}`);
    setEmail('');
  };

  const getImageSrc = (img) => {
    if (!img) return noImage;
    if (/^data:image|^https?:\/\//.test(img)) return img;
    return `http://localhost:5000/${img}`;
  };

  return (
    <section className="container mx-auto py-10 px-4 flex flex-col lg:flex-row bg-white">
      {/* === Text Section === */}
      <article className="lg:w-1/2 flex flex-col justify-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Welcome to{' '}
          <span
            className="text-[#2260bf]"
            style={{ fontFamily: '"Luxurious Roman", serif' }}
          >
            NRN
          </span>
          <span
            className="text-red-500"
            style={{ fontFamily: '"Luxurious Roman", serif' }}
          >
            HUB
          </span>
        </h1>

        <p className="text-sm md:text-base text-gray-600 mt-3">
          Welcome to my personal website. Stay updated by subscribing below!
        </p>

        {/* === Subscribe Form + Book a Call === */}
        <form
          onSubmit={handleSubscribe}
          className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3"
        >
          <input
            type="email"
            placeholder="Enter your email"
            className="w-64 px-4 py-3 rounded-xl border border-gray-300 focus:ring-[#68bef8] focus:ring-2 focus:outline-none text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="submit"
            className="bg-red-600 hover:bg-red-500 transition px-5 py-3 rounded-xl text-white text-sm shadow-md"
          >
            Subscribe
          </button>

          {/* Beautified Book a Call Button */}
          <NavLink to="/bookcall">
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-500 transition px-5 py-2.5 rounded-xl text-white text-sm shadow-md flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Book a Call
            </button>
          </NavLink>
        </form>
      </article>

      {/* === Carousel Section === */}
      <article className="lg:w-1/2 mt-10 lg:mt-0">
        {error ? (
          <p className="text-center text-red-500">
            Failed to load blogs. Please try again.
          </p>
        ) : isLoading ? (
          <p className="text-center text-gray-500">Loading blogs...</p>
        ) : latestBlogs.length === 0 ? (
          <p className="text-center text-gray-500">No blogs available.</p>
        ) : (
          <Swiper
            modules={[Pagination, Autoplay]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            slidesPerView={1}
            className="h-full"
          >
            {latestBlogs.map((blog) => (
              <SwiperSlide key={blog._id}>
                <NavLink to={`/blogs/${blog._id}`}>
                  <div className="relative h-[400px] sm:h-[350px] rounded-xl overflow-hidden group shadow-lg">
                    <img
                      src={getImageSrc(blog.coverImg)}
                      alt={blog.title}
                      className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = noImage;
                      }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-5 text-white backdrop-blur-sm">
                      <h4 className="text-xl font-extrabold drop-shadow-md">
                        {blog.title.length > 40
                          ? `${blog.title.slice(0, 37)}...`
                          : blog.title}
                      </h4>
                      <p className="text-sm font-bold text-[#68bef8] mt-2 drop-shadow-sm">
                        {blog.category || 'General'}
                      </p>
                    </div>
                  </div>
                </NavLink>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </article>
    </section>
  );
};

export default Hero;
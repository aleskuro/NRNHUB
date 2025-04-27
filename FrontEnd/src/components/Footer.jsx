import React from 'react';
import { FaEnvelope, FaFacebook, FaInstagram, FaTiktok, FaTwitter, FaYoutube } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import logo from './logo.png';


const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-[#ffffff] to-[#ffffff] text-gray-800 py-16 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo & About */}
          <div className="animate-fade-in-up">
            <img
              src={logo}
              alt="NRNHUB Logo"
              className="h-16 mb-6 transform transition-transform duration-300 hover:scale-105"
            />
            <p className="text-gray-700 text-sm leading-relaxed ">
              NRNHUB connects NRNs to their roots—through culture, community, and collective initiatives worldwide.
            </p>
            <hr className="my-4 border-gray-300" />
            <p className="text-sm text-black ">© 2025 NRNHUB. All rights reserved.</p>
          </div>

          {/* Events & Initiatives */}
          <div className="animate-fade-in-up animation-delay-200">
            <h3 className="text-lg font-semibold text-[#883FFF] mb-4">Events & Initiatives</h3>
            <ul className="space-y-3 text-sm">
              {[
                'Global NRN Meetups',
                'Youth Empowerment',
                'Collaborative Projects',
                'Diaspora Dialogue',
                'Podcast',
              ].map((item, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="hover:text-indigo-600 transition duration-300 transform hover:translate-x-2 inline-block"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

           {/* Quick Links */}
        <div className="animate-fade-in-up animation-delay-400">
          <h3 className="text-lg font-semibold text-[#883FFF] mb-4">Quick Links</h3>
          <ul className="space-y-3 text-sm">
            {[
              { name: 'Contact Us', path: '/messages' },
              { name: 'Disclaimer', path: '#' },
              { name: 'Privacy Policy', path: '#' },
              { name: 'Terms & Conditions', path: '#' },
              { name: 'About Us', path: '#' },
            ].map((item, index) => (
              <li key={index}>
                {item.path === '#' ? (
                  <a
                    href={item.path}
                    className="hover:text-indigo-600 transition duration-300 transform hover:translate-x-2 inline-block"
                  >
                    {item.name}
                  </a>
                ) : (
                  <NavLink
                  onClick={() => window.scrollTo(0, 0)}
                    to={item.path}
                    className="hover:text-indigo-600 transition duration-300 transform hover:translate-x-2 inline-block"
                  >
                    {item.name}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </div>

          {/* Contact Info */}
          <div className="animate-fade-in-up animation-delay-600">
            <h3 className="text-lg font-semibold text-[#883FFF] mb-4">Follow Us</h3>
            <div className="space-y-4 text-sm">
              {/* Social Links - Vertical */}
              <div className="space-y-3 text-lg">
                <div className="flex items-center gap-3">
                  <a
                    href="https://facebook.com/NRNHUB"
                    className="text-gray-600 hover:text-indigo-600 transition duration-300 transform hover:scale-125"
                    aria-label="Visit NRNHUB on Facebook"
                  >
                    <FaFacebook />
                  </a>
                  <span className="text-sm text-gray-700">Facebook @NRNHUB</span>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="https://twitter.com/NRNHUB"
                    className="text-gray-600 hover:text-indigo-600 transition duration-300 transform hover:scale-125"
                    aria-label="Visit NRNHUB on Twitter"
                  >
                    <FaTwitter />
                  </a>
                  <span className="text-sm text-gray-700">Twitter @NRNHUB</span>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="https://instagram.com/NRNHUB"
                    className="text-gray-600 hover:text-indigo-600 transition duration-300 transform hover:scale-125"
                    aria-label="Visit NRNHUB on Instagram"
                  >
                    <FaInstagram />
                  </a>
                  <span className="text-sm text-gray-700">Instagram @NRNHUB</span>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="https://tiktok.com/@NRNHUB"
                    className="text-gray-600 hover:text-indigo-600 transition duration-300 transform hover:scale-125"
                    aria-label="Visit NRNHUB on TikTok"
                  >
                    <FaTiktok />
                  </a>
                  <span className="text-sm text-gray-700">TikTok @NRNHUB</span>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="https://youtube.com/@NRNHUB"
                    className="text-gray-600 hover:text-indigo-600 transition duration-300 transform hover:scale-125"
                    aria-label="Visit NRNHUB on YouTube"
                  >
                    <FaYoutube />
                  </a>
                  <span className="text-sm text-gray-700">YouTube @NRNHUB</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 mt-12 pt-6 text-center text-sm text-gray-500 animate-fade-in-up animation-delay-800" >
          <NavLink to="/advertisers" onClick={() => window.scrollTo(0, 0)}>
            <span
              className="relative inline-block mt-6 px-6 py-3 bg-[#883FFF] text-white font-semibold rounded-lg overflow-hidden group shadow-lg transition-all duration-300 hover:bg-red-700"
            >
              <span className="relative z-10">Advertise with Us</span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#883FFF] to-[#9452fd] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="absolute top-0 left-0 w-full h-0 bg-white opacity-20 group-hover:h-full transition-all duration-500"></span>
            </span>
          </NavLink>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
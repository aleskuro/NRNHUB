import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import logo from './logo.png';

const Footer = () => {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(link);

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  const quickLinks = [
    { name: 'About Us', path: '/About' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'Disclaimer', path: '/Disclaimer' },
    { name: 'Privacy Policy', path: '/Privacy' },
    { name: 'Terms & Conditions', path: '/Terms' },
  ];

  const socialLinks = [
    { 
      icon: 'fa-brands fa-facebook-f',
      url: 'https://facebook.com/NRNHUB', 
      label: 'Facebook',
      bgColor: '#1877F2',
      hoverBg: '#166FE5',
      delay: '0ms',
      isLucide: false
    },
    { 
      icon: X,
      url: 'https://twitter.com/NRNHUB', 
      label: 'X',
      bgColor: '#000000',
      hoverBg: '#333333',
      delay: '100ms',
      isLucide: true
    },
    { 
      icon: 'fa-brands fa-instagram',
      url: 'https://instagram.com/NRNHUB', 
      label: 'Instagram',
      bgColor: 'linear-gradient(45deg, #F58529, #DD2A7B, #8134AF, #515BD4)',
      hoverBg: 'linear-gradient(45deg, #E57820, #C91F6E, #7129A0, #4850C5)',
      delay: '200ms',
      isLucide: false
    },
    { 
      icon: 'fa-brands fa-tiktok',
      url: 'https://tiktok.com/@NRNHUB', 
      label: 'TikTok',
      bgColor: '#000000',
      hoverBg: '#EE1D52',
      delay: '300ms',
      isLucide: false
    },
    { 
      icon: 'fa-brands fa-youtube',
      url: 'https://youtube.com/@NRNHUB', 
      label: 'YouTube',
      bgColor: '#FF0000',
      hoverBg: '#CC0000',
      delay: '400ms',
      isLucide: false
    },
  ];

  return (
    <footer className="relative bg-white text-gray-800 overflow-hidden border-t border-gray-100">
      <div className="flex">
        {/* Left ad space */}
        <div className="hidden lg:block w-48 flex-shrink-0"></div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-16 flex-grow">
          <div className="flex flex-col items-start gap-12 opacity-0 animate-fade-in-up">
            
            {/* Logo Section */}
            <div className="w-full flex justify-center xl:justify-start">
              <div className="relative flex flex-row items-center gap-4">
                <img
                  src={logo}
                  alt="NRNHUB Logo"
                  className="h-12 lg:h-16 w-12 lg:w-16 object-contain"
                />
                <div className="flex flex-col items-start justify-center gap-0">
                  <h3 className="text-3xl lg:text-4xl font-bold text-gray-800 leading-tight" style={{ fontFamily: '"Baumans", sans-serif' }}>
                    NRNHUB
                  </h3>
                  <p
                    className="text-sm lg:text-base text-gray-700 italic tracking-wide"
                    style={{
                      fontFamily: '"Great Vibes", "Brush Script MT", "Lucida Handwriting", cursive',
                      fontWeight: '500',
                      letterSpacing: '0.95px',
                      fontSize: '1.02rem',
                      lineHeight: '1.2',
                      textShadow: '0 1px 1px rgba(0,0,0,0.1)',
                      marginTop: '-2px',
                    }}
                  >
                    From Routes to Roots
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Links + Social Links Row */}
            <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
              
              {/* Quick Links */}
              <nav className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 lg:gap-8 w-full lg:w-auto">
                {quickLinks.map((item, index) => (
                  <div
                    key={index}
                    className="text-center lg:text-left group opacity-0 animate-fade-in-up"
                    style={{ animationDelay: `${index * 100 + 200}ms` }}
                  >
                    <a
                      href={item.path}
                      className="relative text-xs md:text-sm font-medium text-gray-600 hover:text-gray-900 transition-all duration-300 hover:translate-y-[-3px] block group-hover:scale-105 whitespace-nowrap"
                    >
                      <span className="relative z-10">{item.name}</span>
                      <span className="absolute bottom-[-4px] left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 group-hover:w-full"></span>
                      <span className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md -z-10 scale-110"></span>
                    </a>
                  </div>
                ))}
              </nav>

              {/* Social Links */}
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-300 transform hover:scale-110 opacity-0 animate-fade-in-up social-icon"
                    style={{
                      background: social.bgColor,
                      animationDelay: social.delay,
                    }}
                    onMouseEnter={(e) => {
                      if (!social.isLucide && !social.bgColor.includes('gradient')) {
                        e.currentTarget.style.background = social.hoverBg;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!social.isLucide && !social.bgColor.includes('gradient')) {
                        e.currentTarget.style.background = social.bgColor;
                      }
                    }}
                  >
                    {social.isLucide ? (
                      <social.icon className="w-5 h-5" />
                    ) : (
                      <i className={`${social.icon} text-lg`} />
                    )}
                  </a>
                ))}
              </div>
            </div>

            {/* Copyright */}
            <div className="mt-16 pt-8 border-t border-gray-200 w-full text-center opacity-0 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
              <p className="text-sm text-gray-600 font-semibold hover:text-gray-900 transition-colors duration-300">
                © 2025 NRNHUB. All rights reserved.
              </p>
              <div className="flex items-center justify-center space-x-2 mt-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right ad space */}
        <div className="hidden lg:block w-48 flex-shrink-0"></div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .social-icon:hover { filter: brightness(1.1); }
      `}</style>
    </footer>
  );
};

export default Footer;
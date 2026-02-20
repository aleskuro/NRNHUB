// src/pages/minipage/About.jsx
import React from 'react';
import logo from '../../components/logo.png';

// ---------------------------------------------------------------------
// 1. LOGO + TITLE + SLOGAN
// ---------------------------------------------------------------------
const LogoWithSlogan = () => (
  <div className="flex items-center justify-center gap-4">
    <img
      src={logo}
      alt="NRNHUB Logo"
      className="h-12 lg:h-16 w-12 lg:w-16 object-contain"
    />
    <div className="flex flex-col justify-center text-center">
      <h3
        className="text-3xl lg:text-4xl font-bold text-gray-800"
        style={{ fontFamily: '"Baumans", sans-serif' }}
      >
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
);

// ---------------------------------------------------------------------
// 2. ABOUT PAGE CONTENT
// ---------------------------------------------------------------------
const About = () => {
  const Paragraph = ({ children }) => (
    <p className="text-base lg:text-lg text-gray-700 leading-relaxed">{children}</p>
  );

  return (
    <main>
      <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          {/* Logo + Title + Slogan */}
          <div className="flex justify-center mb-12">
            <LogoWithSlogan />
          </div>

          {/* Text Section */}
          <div className="space-y-6 text-center px-6">
            <div className="max-w-2xl mx-auto">
              <Paragraph>
                We are a one-stop digital hub where the global Nepali diaspora stays connected to our roots while navigating life across the routes.
              </Paragraph>
            </div>

            <div className="max-w-2xl mx-auto">
              <Paragraph>
                Our slogan,{' '}
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
                  </p>{' '}
                reflects a simple philosophy, our journey and quest to external paths shouldn’t dim our legacy, heritage and belongings to our roots.
              </Paragraph>
            </div>

            <div className="max-w-2xl mx-auto">
              <Paragraph>
                Born from the shared reality of an ever-increasing Nepalese community moving abroad to study, work, and start a new life where too often, Nepali diaspora abroad finds that useful information is scattered all-over, regulations are hard to understand, and opportunities feel out of reach due to distance.
              </Paragraph>
            </div>

            <div className="max-w-2xl mx-auto">
              <Paragraph>
                Hence, we want to bridge geographic gaps by offering useful contents, actionable guides, practical resources, inspiring stories, and customised services crafted for NRNs from all walks of life globally.
              </Paragraph>
            </div>

            <div className="max-w-3xl mx-auto mt-6">
              <p className="text-lg lg:text-xl font-bold text-gray-800">
                Dive into our updates, explore resources, and join the community
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
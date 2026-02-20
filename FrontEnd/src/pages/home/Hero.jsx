import React from 'react';

const Hero = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image - zoomed in and positioned to cut from bottom */}
<div 
  className="absolute inset-0 bg-no-repeat"
  style={{
    backgroundImage: 'url(https://images.pexels.com/photos/31410274/pexels-photo-31410274.jpeg)', 
    backgroundPosition: 'center top',
    backgroundSize: '200%',
    filter: 'brightness(1.2)', // Makes image 20% brighter
  }}
></div>

{/* Gradient overlay for better text readability - lighter overlay */}
<div className="absolute inset-0 "></div>



      {/* Content positioned higher with 10vh padding from top */}
      <div className="relative z-10 flex items-start min-h-screen">
        <div className="w-full px-6 pt-[8vh] lg:px-8">
          <div className="max-w-6xl mx-auto text-center">
            {/* Main heading: Apple Chancery font + text shadow */}
            <h1 
              className="text-5xl font-bold tracking-tight text-[#BB86FC] sm:text-7xl lg:text-8xl mb-10 whitespace-nowrap"
              style={{ 
                fontFamily: '"Apple Chancery", cursive',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' 
              }}
            >
              "From Routes to Roots"
            </h1>

            {/* Description paragraphs (kept clean, no Apple Chancery) */}
            <div className="space-y-13 mt-10">
              <p 
                className="text-2xl sm:text-2xl leading-relaxed text-white max-w-4xl mx-auto px-6"
                style={{ textShadow: '1px 2px 3px rgba(0, 0, 0, 3)' }}
              >
                We bridge geographic distance by offering a one stop digital hub, <br />
                where global Nepali diaspora stay connected to their roots,<br />
                 while navigating life across various routes.
              </p>

              <p 
                className="text-2xl sm:text-2xl leading-relaxed text-gray-100 max-w-4xl mx-auto px-6"
                style={{ textShadow: '1px 2px 3px rgba(0, 0, 0, 3)' }}
              >
                Explore useful informations, actionable guides, inspiring stories<br />
                and convenient services crafted to inform, empower,<br />
                and enrich life of NRNs all over the world.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
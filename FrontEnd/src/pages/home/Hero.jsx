import React from 'react';
import { NavLink } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative isolate bg-white">
      {/* Subtle geometric background pattern instead of blur */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#883FFF]/20 to-[#6023BB]/20 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" 
          style={{clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"}}></div>
      </div>
      
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
          <div className="flex">
            <div className="relative flex items-center gap-x-2 rounded-full px-4 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10">
              <span className="font-semibold text-[#883FFF]">Join our community</span>
              <span className="h-4 w-px bg-gray-900/10" aria-hidden="true"></span>
              <NavLink to="/about" className="flex items-center gap-x-1 font-semibold text-[#883FFF]">
                <span>Learn more</span>
                <svg className="h-4 w-4 fill-current" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6.75 5.75 9.25 8l-2.5 2.25" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </NavLink>
            </div>
          </div>
          
          <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Finding Home, <span className="text-[#883FFF]">Beyond Borders</span>
          </h1>
          
          <p className="mt-6 text-lg leading-8 text-gray-600">
            NRNHUB bridges the distance, offering a digital haven where NRNs connect with their Nepali heritage and community, no matter where they are in the world.
          </p>
          
          <div className="mt-10 flex items-center gap-x-6">
            <NavLink 
              to="/BookACall" 
              className="rounded-full bg-[#883FFF] px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-[#7023EA] transition-colors  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#883FFF]"
            >
              Book a Call
            </NavLink>
            <NavLink to="/explore" className="text-base font-semibold text-gray-900 hover:text-[#883FFF] transition-colors">
              Explore Community <span aria-hidden="true">→</span>
            </NavLink>
          </div>
        </div>
        
        <div className="mt-16 sm:mt-20 lg:mt-0 lg:flex-shrink-0 lg:flex-grow">
          <div className="relative mx-auto border border-[#883FFF]/10 bg-gradient-to-b from-white to-[#883FFF]/5 rounded-2xl shadow-lg p-4 lg:p-6">
          <div>Connecting Nepalese Across World</div>
            {/* Decorative elements */}
            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full border-4 border-white bg-[#883FFF]/10 hidden sm:block"></div>
            <div className="absolute -top-4 -left-4 h-16 w-16 rounded-full border-4 border-white bg-[#883FFF]/10 hidden sm:block"></div>
          </div>
        </div>
      </div>
      
      {/* Bottom geometric pattern instead of blur */}
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden" aria-hidden="true">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#883FFF]/20 to-[#6023BB]/20 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" 
          style={{clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"}}></div>
      </div>
    </div>
  );
};

export default Hero;
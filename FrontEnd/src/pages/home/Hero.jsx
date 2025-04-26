import React from 'react';
import { NavLink } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative isolate bg-white">
      {/* Subtle geometric background pattern instead of blur */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden" aria-hidden="true">
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#883FFF]/20 to-[#6023BB]/20 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        ></div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 flex flex-col items-center text-center lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl">
          <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Finding Home, <span className="text-[#883FFF]">Beyond Borders</span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            NRNHUB bridges the distance, offering a digital haven where NRNs connect with their Nepali heritage and community, no matter where they are in the world.
          </p>

          <div className="mt-10 flex justify-center">
            <NavLink
              to="/BookACall"
              className="rounded-full bg-[#883FFF] px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-[#7023EA] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#883FFF]"
            >
              Book a Call
            </NavLink>
          </div>
        </div>
      </div>

      {/* Bottom geometric pattern instead of blur */}
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden" aria-hidden="true">
        <div
          className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#883FFF]/20 to-[#6023BB]/20 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        ></div>
      </div>
    </div>
  );
};

export default Hero;
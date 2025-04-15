import React from 'react';

const Hero = () => {
  return (
    <div className="flex flex-col md:flex-row justify-center items-center md:gap-14 gap-8 py-24 bg-gradient-to-br from-orange-50 to-blue-100">
      <div className="text-center">
        <h1 className="md:text-6xl text-4xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
          Finding Home, Beyond Borders
        </h1>
        <br></br>
        <br></br>
        <p className="py-8 text-lg text-gray-700 max-w-2xl mx-auto">
          NRNHUB bridges the distance, offering a digital haven where NRNs connect with their Nepali heritage and community, no matter where they are in the world.
        </p>
        <button className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-3 px-8 rounded-full mt-6 shadow-md">
Book a Call        </button>
      </div>
    </div>
  );
};

export default Hero;
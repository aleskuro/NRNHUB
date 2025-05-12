import React from 'react';

const SearchBlog = ({ search, handleSearchChange, handleSearch }) => {
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full flex items-center rounded-lg shadow-md overflow-hidden">
      <input
        type="text"
        placeholder="Search Nepal's Next Economic Hub..."
        value={search}
        onChange={handleSearchChange}
        onKeyPress={handleKeyPress}
        className="py-3 px-4 w-full bg-gray-100 focus:outline-none focus:ring focus:ring-blue-200 border-r border-gray-200"
      />
      <button
        onClick={handleSearch}
        className="bg-[#883FFF] hover:bg-[#893fffc4] text-white px-6 py-3 font-semibold transition-colors duration-300"
      >
        Search
      </button>
    </div> 
  );
};

export default SearchBlog;
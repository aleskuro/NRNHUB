import React from 'react';
import { Link } from 'react-router-dom';
import Category from './Category';

const CategoryNav = () => {
  const categories = [
    'technology', 'travel', 'food', 'lifestyle',
    'fashion', 'health', 'finance', 'entertainment', 'cars', 'general', 'sasa'
  ];

  const categoryColors = {
    technology: 'bg-blue-600',
    travel: 'bg-emerald-600',
    food: 'bg-amber-600',
    lifestyle: 'bg-rose-600',
    fashion: 'bg-violet-600',
    health: 'bg-teal-600',
    finance: 'bg-orange-600',
    entertainment: 'bg-red-600',
    cars: 'bg-indigo-600',
    general: 'bg-[#883FFF]',
    sasa: 'bg-purple-600',
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
      <h3 className="text-lg font-bold mb-3 text-gray-800">Browse by Category</h3>
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Link
            key={category}
            to={`/category/${category}`}
            className={`px-3 py-1 rounded-full text-sm text-white ${categoryColors[category]} hover:bg-opacity-80 transition-colors duration-300 capitalize`}
          >
            {category}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoryNav;
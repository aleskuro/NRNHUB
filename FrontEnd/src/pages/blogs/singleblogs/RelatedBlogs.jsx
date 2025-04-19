import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetchRelatedBlogsQuery, useFetchBlogsQuery } from '../../../Redux/features/blogs/blogApi';
import noImage from '/Users/user/Desktop/nnrnhub/FrontEnd/src/assets/images.png';

// Category colors reused from Blogs for consistency
const categoryColors = {
  technology: 'bg-blue-600',
  travel: 'bg-emerald-600', 
  food: 'bg-amber-600',
  health: 'bg-teal-600',
  general: 'bg-[#883FFF]',
};

// Function to select random blogs, avoiding duplicates with related blogs
const selectRandomBlogs = (blogs, relatedBlogs, count = 6) => {
  const relatedIds = new Set(relatedBlogs.map((blog) => blog._id));
  const availableBlogs = blogs.filter((blog) => !relatedIds.has(blog._id));
  const shuffled = [...availableBlogs].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, availableBlogs.length));
};

const RelatedBlogs = () => {
  const { id } = useParams();
  if (!id) {
    console.error('Invalid blog ID');
    return (
      <p className="p-8 text-red-600 font-semibold">
        Invalid blog ID. (Are you sure you're on the right path?)
      </p>
    );
  }

  console.log(`Fetching: /blogs/related/${id}`);
  const { data: relatedBlogs = [], error: relatedError, isLoading: relatedLoading } = useFetchRelatedBlogsQuery(id);
  console.log('Related Blogs API Response:', relatedBlogs);

  // Fetch all blogs for suggestions
  const { data: allBlogs = [], error: blogsError, isLoading: blogsLoading } = useFetchBlogsQuery({
    search: '',
    category: '',
  });
  console.log('All Blogs API Response:', allBlogs);

  // Select 6 random blogs, excluding related blogs
  const suggestedBlogs = selectRandomBlogs(allBlogs, relatedBlogs, 6);

  return (
    <div className="px-4 md:px-8">
      {/* Five Ad Spaces Above Related Blogs */}
      <div className="space-y-4 mt-8">
        {[1, 2, 3, 4, 5].map((adNum) => (
          <div
            key={`ad-${adNum}`}
            className={`w-full bg-gradient-to-r from-red-200 to-red-100 p-4 text-center rounded-lg shadow-md h-${
              adNum % 2 === 0 ? '32' : '40'
            } flex items-center justify-center`}
          >
            <p className="text-red-600 font-semibold">
              Advertisement {adNum} - Sponsored Content
            </p>
          </div>
        ))}
      </div>

      {/* Related Blogs Section */}
      <div className="mt-8">
        <h3 className="text-3xl font-semibold pt-8 px-0 pb-5 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-[#883FFF]">
          Explore Further
        </h3>
        <hr className="border-gray-200" />

        {relatedLoading && (
          <p className="p-8 text-gray-700 italic">
            Fetching related stories... (Hang tight, a tale is unfolding!)
          </p>
        )}

        {relatedError && (
          <p className="p-8 text-red-600 font-semibold">
            Oops! Something went sideways. (Related blogs decided to play hide-and-seek.)
          </p>
        )}

        {!relatedLoading && !relatedError && relatedBlogs.length === 0 && (
          <p className="p-8 text-gray-600 italic">
            No related tales found. (Perhaps, this story stands alone?)
          </p>
        )}

        {!relatedLoading && !relatedError && relatedBlogs.length > 0 && (
          <div className="mt-6 space-y-6">
            {relatedBlogs.map((blog) => (
              <Link
                to={`/blogs/${blog._id}`}
                key={blog._id}
                onClick={() => window.scrollTo(0, 0)} // Scroll to top on click
                className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-r from-gray-50 to-gray-100"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={blog.coverImg || noImage}
                    alt={blog.title || 'Blog Image'}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.src = noImage)}
                  />
                </div>
                <div className="flex-grow">
                  <h4 className="text-lg font-semibold text-[#883FFF] mb-2">
                    {(blog.title || 'Untitled').substring(0, 70)}
                    {blog.title?.length > 70 ? '...' : ''}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {(blog.description || 'No description available').substring(0, 100)}...
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Things You Might Be Interested In Section */}
      <div className="mt-12">
        <h3 className="text-3xl font-semibold pt-8 px-0 pb-5 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-[#883FFF]">
          Things You Might Be Interested In
        </h3>
        <hr className="border-gray-200" />

        {blogsLoading && (
          <p className="p-8 text-gray-700 italic">
            Loading suggestions... (More stories are on the way!)
          </p>
        )}

        {blogsError && (
          <p className="p-8 text-red-600 font-semibold">
            Oops! Couldn’t load suggestions. (The library’s taking a nap.)
          </p>
        )}

        {!blogsLoading && !blogsError && suggestedBlogs.length === 0 && (
          <p className="p-8 text-gray-600 italic">
            No suggestions found. (The library’s a bit quiet today.)
          </p>
        )}

        {!blogsLoading && !blogsError && suggestedBlogs.length > 0 && (
          <div className="mt-6 space-y-6">
            {suggestedBlogs.map((blog) => (
              <Link
                to={`/blogs/${blog._id}`}
                key={blog._id}
                onClick={() => window.scrollTo(0, 0)} // Scroll to top on click
                className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-r from-gray-50 to-gray-100"
              >
                <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={blog.coverImg || noImage}
                    alt={blog.title || 'Blog Image'}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.src = noImage)}
                  />
                </div>
                <div className="flex-grow">
                  <h4 className="text-lg font-semibold text-[#883FFF] mb-2">
                    {(blog.title || 'Untitled').substring(0, 70)}
                    {blog.title?.length > 70 ? '...' : ''}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {(blog.description || 'No description available').substring(0, 100)}...
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default RelatedBlogs;
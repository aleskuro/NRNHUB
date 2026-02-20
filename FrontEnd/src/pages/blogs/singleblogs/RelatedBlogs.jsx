// src/pages/blogs/singleblogs/RelatedBlogs.jsx
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  useFetchRelatedBlogsQuery,
  useFetchBlogsQuery,
} from '../../../Redux/features/blogs/blogApi';
import noImage from '../../../assets/images.png';

// ──────────────────────────────────────────────────────────────
// Random blog selector
// ──────────────────────────────────────────────────────────────
const selectRandomBlogs = (allBlogs = [], relatedBlogs = [], count = 6) => {
  const relatedIds = new Set(
    relatedBlogs
      .filter((b) => b?._id)
      .map((b) => b._id)
  );

  const filtered = allBlogs.filter(
    (b) => b?._id && !relatedIds.has(b._id)
  );

  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// ──────────────────────────────────────────────────────────────
// Category → Tailwind color map
// ──────────────────────────────────────────────────────────────
const categoryColors = {
  technology: 'bg-blue-600',
  travel: 'bg-emerald-600',
  food: 'bg-amber-600',
  health: 'bg-teal-600',
  general: 'bg-[#883FFF]',
  lifestyle: 'bg-rose-600',
  finance: 'bg-orange-600',
  entertainment: 'bg-red-600',
  cars: 'bg-indigo-600',
  sasa: 'bg-purple-600',
};

const getCategoryColor = (cat) => {
  const key = (cat && cat.toString().toLowerCase()) || 'general';
  return categoryColors[key] || 'bg-[#883FFF]';
};

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

// ──────────────────────────────────────────────────────────────
// Blog Card Component
// ──────────────────────────────────────────────────────────────
const BlogCard = ({ blog }) => {
  if (!blog) return null;

  return (
    <Link
      to={`/blogs/${blog._id}`}
      onClick={scrollToTop}
      className="group flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-white to-gray-50 border border-gray-100 cursor-pointer"
    >
      <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-[#883FFF]/20">
        <img
          src={blog.coverImg || noImage}
          alt={blog.title || 'Blog image'}
          className="w-full h-full object-cover"
          onError={(e) => (e.target.src = noImage)}
          loading="lazy"
        />
      </div>

      <div className="flex-grow">
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`text-xs px-2.5 py-1 rounded-full text-white font-medium ${getCategoryColor(
              blog.category
            )}`}
          >
            {blog.category || 'General'}
          </span>
          <span className="text-xs text-gray-500">
            {blog.createdAt
              ? new Date(blog.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              : 'N/A'}
          </span>
        </div>

        <h4 className="text-lg font-bold text-gray-800 group-hover:text-[#883FFF] transition-colors line-clamp-2">
          {(blog.title && blog.title.substring(0, 70)) || 'Untitled Blog'}
          {blog.title && blog.title.length > 70 ? '...' : ''}
        </h4>

        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {(blog.description && blog.description.substring(0, 100)) ||
            'No description available'}
          {' '}
          {blog.description && blog.description.length > 100 && '...'}
        </p>
      </div>
    </Link>
  );
};

// ──────────────────────────────────────────────────────────────
// Ad Space Component
// ──────────────────────────────────────────────────────────────
const AdSpace = ({ adType, adImages, adLinks, visibility }) => {
  const visible = visibility?.[adType];
  const imagePath = adImages?.[adType];
  const link = adLinks?.[adType];

  if (!visible || !imagePath) return null;

  const baseUrl = import.meta.env.VITE_API_URL || 'https://nrnhub.com.np';
  const imageUrl = imagePath.startsWith('http')
    ? imagePath
    : `${baseUrl.replace(/\/+$/, '')}/${imagePath.replace(/^\/+/, '')}`;

  return (
    <div className="my-6">
      <a href={link || '#'} target="_blank" rel="noopener noreferrer" className="block">
        <img
          src={imageUrl}
          alt="Advertisement"
          className="w-full h-auto max-h-48 object-contain rounded-xl shadow-lg"
          loading="lazy"
          onError={(e) => {
            console.warn('Ad failed to load:', imageUrl);
            e.target.style.display = 'none';
          }}
        />
      </a>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// Main Component – FULLY FIXED
// ──────────────────────────────────────────────────────────────
const RelatedBlogs = () => {
  const { id } = useParams();

  // HOOKS FIRST – ALWAYS called (never conditionally!)
  const {
    data: relatedBlogsRaw = [],
    isLoading: relatedLoading,
    isError: relatedError,
    isFetching: relatedFetching,
  } = useFetchRelatedBlogsQuery(id, {
    skip: !id, // This is the correct way to skip
  });

  const {
    data: allBlogsRaw = [],
    isLoading: allLoading,
    isError: allError,
  } = useFetchBlogsQuery({ search: '', category: '', location: '' });

  const { adImages = {}, adLinks = {}, visibility = {} } = useSelector(
    (state) => state?.ads || {}
  );

  // Safe to early return now (after all hooks)
  if (!id) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 font-bold text-xl">Invalid Blog ID</p>
      </div>
    );
  }

  // Normalize data
  const relatedBlogs = Array.isArray(relatedBlogsRaw) ? relatedBlogsRaw : [];
  const allBlogs = Array.isArray(allBlogsRaw) ? allBlogsRaw : [];
  const suggestedBlogs = selectRandomBlogs(allBlogs, relatedBlogs, 6);

  const adTypes = [
    'blogsFirst',
    'blogsSecond',
    'blogsThird',
    'blogsFourth',
    'blogsFifth',
  ];

  return (
    <div className="px-4 md:px-8 max-w-7xl mx-auto">
      {/* Ads */}
      {adTypes.map((type) => (
        <AdSpace
          key={type}
          adType={type}
          adImages={adImages}
          adLinks={adLinks}
          visibility={visibility}
        />
      ))}

      {/* Related Stories */}
      <section className="mt-12">
        <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-[#883FFF] bg-clip-text text-transparent mb-6">
          Related Stories
        </h3>
        <hr className="border-gray-300 mb-8" />

        {(relatedLoading || relatedFetching) && (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex gap-6 p-6 bg-gray-50 rounded-xl animate-pulse"
              >
                <div className="w-20 h-20 bg-gray-200 rounded-full" />
                <div className="flex-grow space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        )}

        {relatedError && (
          <p className="text-center text-gray-500 italic p-8">
            Failed to load related stories.
          </p>
        )}

        {!relatedLoading && !relatedFetching && relatedBlogs.length === 0 && (
          <p className="text-center text-gray-500 italic p-8">
            No related stories available.
          </p>
        )}

        {relatedBlogs.length > 0 && (
          <div className="space-y-6">
            {relatedBlogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        )}
      </section>

      {/* Suggested Blogs */}
      <section className="mt-16">
        <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-[#883FFF] bg-clip-text text-transparent mb-6">
          You Might Also Like
        </h3>
        <hr className="border-gray-300 mb-8" />

        {allLoading && (
          <div className="space-y-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex gap-6 p-6 bg-gray-50 rounded-xl animate-pulse"
              >
                <div className="w-20 h-20 bg-gray-200 rounded-full" />
                <div className="flex-grow space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        )}

        {allError && (
          <p className="text-center text-gray-500 italic p-8">
            Couldn’t load suggestions.
          </p>
        )}

        {!allLoading && !allError && suggestedBlogs.length === 0 && (
          <p className="text-center text-gray-500 italic p-8">
            No suggestions available right now.
          </p>
        )}

        {suggestedBlogs.length > 0 && (
          <div className="space-y-6">
            {suggestedBlogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        )}
      </section>

      {/* Line-clamp styles */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
};

export default RelatedBlogs;
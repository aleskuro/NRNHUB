
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import noImage from '../../assets/images.png';
import { Clock, BookOpen } from 'lucide-react';
import { Helmet } from 'react-helmet';

const Category = () => {
  const { category } = useParams();
  const normalizedCategory = category?.toLowerCase() || 'general';
  const API_URL = import.meta.env.VITE_API_URL;  // Using the specified API URL

  const [blogs, setBlogs] = useState([]);
  const [allBlogs, setAllBlogs] = useState([]);
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [remainingBlogs, setRemainingBlogs] = useState([]);
  const [suggestedBlogs, setSuggestedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const ads = useSelector((state) => state.ads);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const categoryUrl = `${API_URL}/api/blogs/category/${encodeURIComponent(normalizedCategory)}`;  // Construct URL as specified
        const response = await fetch(categoryUrl);
        if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
        const data = await response.json();
        setBlogs(data || []);
        const sortedBlogs = [...(data || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setFeaturedBlogs(sortedBlogs.slice(0, 3));
        setRemainingBlogs(sortedBlogs.slice(3));

        const allUrl = `${API_URL}/api/blogs`;  // Assuming similar structure for all blogs
        const allResponse = await fetch(allUrl);
        if (!allResponse.ok) throw new Error(`Failed to fetch all blogs: ${allResponse.status}`);
        const allData = await allResponse.json();
        setAllBlogs(allData || []);
        const blogIds = new Set((data || []).map((blog) => blog._id));
        const otherBlogs = (allData || []).filter(
          (blog) => !blogIds.has(blog._id) && blog.category?.toLowerCase() !== normalizedCategory
        );
        const shuffled = [...otherBlogs].sort(() => Math.random() - 0.5);
        setSuggestedBlogs(shuffled.slice(0, 3));
      } catch (err) {
        setError(err.message);
        setBlogs([]);
        setAllBlogs([]);
        setFeaturedBlogs([]);
        setRemainingBlogs([]);
        setSuggestedBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    if (normalizedCategory && API_URL) fetchData();
  }, [normalizedCategory, API_URL]);

  const renderAdSpace = (adType, positionLabel) => {
    const isAdVisible = ads[`${adType}AdVisible`];
    const adImage = ads.adImages[adType];
    const adLink = ads.adLinks[adType];

    useEffect(() => {
      console.log(`Ad data for ${adType}:`, { isAdVisible, adImage, adLink });
      console.log('Visibility flags:', { blogsFirstAdVisible: ads.blogsFirstAdVisible, blogsSecondAdVisible: ads.blogsSecondAdVisible });
      console.log('Ad Images:', ads.adImages);
      console.log('Ad Links:', ads.adLinks);
    }, [isAdVisible, adImage, adLink]);

    if (!isAdVisible) return null;
    if (!adImage) {
      return (
        <div className="w-full bg-gray-100 rounded-xl overflow-hidden shadow-md flex items-center justify-center py-8">
          <div className="text-center p-6">
            <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Advertisement</div>
            <div className="text-gray-700 font-semibold text-lg">{positionLabel} Ad Placement</div>
            <div className="text-gray-500 text-sm mt-2">Advertise with NRNHUB</div>
            <a href="https://nrnhub.com/advertise" className="mt-4 inline-block text-[#883FFF] hover:text-[#7623EA] text-sm font-medium">Learn More →</a>
          </div>
        </div>
      );
    }
    const isValidUrl = adImage && (adImage.startsWith('http://') || adImage.startsWith('https://') || adImage.startsWith('/'));
    if (!isValidUrl) return null;
    const handleAdClick = () => console.log(`Ad clicked: ${adType}, Link: ${adLink}`);
    return (
      <div className="w-full rounded-xl overflow-hidden shadow-md">
        {adLink ? (
          <a href={adLink} target="_blank" rel="noopener noreferrer" onClick={handleAdClick}>
            <img src={adImage} alt={`${positionLabel} Ad`} className="w-full h-auto max-w-[1152px] mx-auto rounded-xl object-contain" style={{ maxWidth: '100%' }} loading="lazy" onError={(e) => { e.target.src = noImage; }} />
          </a>
        ) : (
          <img src={adImage} alt={`${positionLabel} Ad`} className="w-full h-auto max-w-[1152px] mx-auto rounded-xl object-contain" style={{ maxWidth: '100%' }} loading="lazy" onError={(e) => { e.target.src = noImage; }} />
        )}
      </div>
    );
  };

  const truncateTitle = (title, maxLength = 45) => (title && title.length > maxLength ? title.substring(0, maxLength - 3) + '...' : title || 'Untitled');
  const formatDate = (dateString) => (dateString ? new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently published');
  const getReadTime = () => Math.floor(Math.random() * 10) + 3;
  const getAuthorName = (author) => (author ? (typeof author === 'string' ? author : author.email || author.name || 'Editor') : 'Editor');
  const categoryColors = { technology: 'bg-blue-600', travel: 'bg-emerald-600', food: 'bg-amber-600', lifestyle: 'bg-rose-600', fashion: 'bg-violet-600', health: 'bg-teal-600', finance: 'bg-orange-600', entertainment: 'bg-red-600', cars: 'bg-indigo-600', general: 'bg-[#883FFF]', sasa: 'bg-purple-600' };
  const getCategoryColor = (category) => categoryColors[category?.toLowerCase() || 'general'] || 'bg-[#883FFF]';
  const scrollToTop = () => window.scrollTo(0, 0);

  const BlogCard = ({ blog, featured = false }) => (
    <Link to={`/blogs/${blog._id}`} onClick={scrollToTop} className="block group">
      <div className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${featured ? 'h-full' : ''}`}>
        <div className="relative">
          <img src={blog.coverImg || noImage} alt={blog.title} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.src = noImage; }} />
          <div className={`absolute top-3 left-3 ${getCategoryColor(blog.category)} text-white text-xs px-2 py-1 rounded-full`}>{blog.category || 'General'}</div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-5"><div className="text-white font-medium">Read full article</div></div>
        </div>
        <div className="p-5">
          <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[#883FFF] transition-colors">{truncateTitle(blog.title)}</h3>
          <div className="flex items-center text-sm text-gray-500 mb-3"><Clock size={14} className="mr-1" /><span className="mr-3">{getReadTime()} min read</span><span>By {getAuthorName(blog.author)}</span></div>
          <p className="text-gray-600 line-clamp-2 mb-4">{blog.description || 'Discover more by diving in...'}</p>
          <div className="flex justify-between items-center"><span className="text-xs text-gray-500">{formatDate(blog.createdAt)}</span><button className="text-[#883FFF] hover:text-[#7623EA] font-medium text-sm">Read more →</button></div>
        </div>
      </div>
    </Link>
  );

  const CompactBlogCard = ({ blog }) => (
    <Link to={`/blogs/${blog._id}`} onClick={scrollToTop} className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-r from-gray-50 to-gray-100">
      <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0"><img src={blog.coverImg || noImage} alt={blog.title || 'Blog Image'} className="w-full h-full object-cover" onError={(e) => { e.target.src = noImage; }} /></div>
      <div className="flex-grow"><h4 className="text-lg font-semibold text-blue-700 mb-2">{(blog.title || 'Untitled').substring(0, 70)}{blog.title?.length > 70 ? '...' : ''}</h4><p className="text-gray-600 text-sm">{(blog.description || 'No description available').substring(0, 100)}...</p><div className="mt-2"><span className={`inline-block ${getCategoryColor(blog.category)} text-white text-xs px-2 py-1 rounded-full`}>{blog.category || 'General'}</span></div></div>
    </Link>
  );

  return (
    <div className="mt-16 bg-gradient-to-b from-[#E6F0FA] to-[#F3E8FF] min-h-screen text-gray-800">
      <Helmet><link rel="canonical" href={`http://localhost:5173/category/${normalizedCategory}`} /></Helmet>
      <div className="container mx-auto px-4 py-8">
        <div className="relative py-16 bg-gradient-to-r from-[#883FFF] to-[#6023BB] rounded-2xl mb-12 overflow-hidden">
          <div className="absolute inset-0 opacity-20"><div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-white/30 blur-3xl"></div><div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/20 blur-3xl"></div></div>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <span className={`inline-block px-4 py-1 rounded-full ${getCategoryColor(normalizedCategory)} bg-opacity-80 text-white text-sm font-medium mb-4`}>Browse by Category</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 capitalize">{normalizedCategory} <span className="text-purple-200">Blogs</span></h1>
            <p className="text-lg text-purple-100 max-w-2xl mx-auto">Explore our latest articles, insights, and stories in the {normalizedCategory} category.</p>
          </div>
        </div>
        {loading && <div className="text-center py-16"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#883FFF] mx-auto"></div><p className="mt-4 text-lg text-gray-600">Loading {normalizedCategory} blogs...</p></div>}
        {error && <div className="p-8 text-center bg-red-50 rounded-xl text-red-600 my-8"><h3 className="text-xl font-bold mb-2">Oops! Something went wrong.</h3><p>{error}</p></div>}
        {!loading && !error && blogs.length === 0 && <div className="text-center py-16"><div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6"><BookOpen size={40} className="text-gray-400" /></div><h3 className="text-2xl font-bold text-gray-700 mb-2">No blogs found</h3><p className="text-gray-600 mb-6">We couldn't find any blogs in the {normalizedCategory} category.</p><Link to="/blogs" className="inline-block px-6 py-3 bg-[#883FFF] text-white rounded-lg hover:bg-[#7623EA] transition-colors">Browse all blogs</Link></div>}
        {!loading && !error && featuredBlogs.length > 0 && <div className="mb-12"><h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-6">Featured {normalizedCategory} Blogs</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-8">{featuredBlogs.map((blog) => <BlogCard key={blog._id} blog={blog} featured={true} />)}</div></div>}
        <div className="my-12 grid grid-cols-1 md:grid-cols-2 gap-4">{renderAdSpace('blogsFirst', 'First')}{renderAdSpace('blogsSecond', 'Second')}</div>
        {!loading && !error && remainingBlogs.length > 0 && <div className="mb-12"><h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-teal-600 mb-6">More {normalizedCategory} Articles</h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">{remainingBlogs.map((blog) => <BlogCard key={blog._id} blog={blog} />)}</div></div>}
        {!loading && !error && suggestedBlogs.length > 0 && <div className="mb-12"><h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-rose-600 mb-6">You Might Also Be Interested In</h2><div className="mt-6 space-y-6">{suggestedBlogs.map((blog) => <CompactBlogCard key={blog._id} blog={blog} />)}</div></div>}
        <div className="mt-12 bg-white shadow-md rounded-xl p-6"><h3 className="text-xl font-bold text-gray-800 mb-4">Explore Other Categories</h3><div className="flex flex-wrap gap-3">{Object.keys(categoryColors).map((cat) => <Link key={cat} to={`/category/${cat}`} onClick={scrollToTop} className={`px-4 py-2 rounded-full text-sm ${normalizedCategory === cat ? `${getCategoryColor(cat)} text-white` : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} transition-colors capitalize`}>{cat}</Link>)}</div></div>
        <div className="mt-16 bg-gradient-to-r from-[#883FFF]/10 to-[#6023BB]/10 rounded-2xl p-8 md:p-12"><div className="md:flex items-center justify-between"><div className="md:w-2/3 mb-6 md:mb-0"><h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Stay updated with our newsletter</h3><p className="text-gray-600">Get the latest {normalizedCategory} articles right in your inbox.</p></div><div className="md:w-1/3"><div className="flex"><input type="email" placeholder="Your email address" className="flex-1 px-4 py-3 rounded-l-lg border-y border-l border-gray-500 focus:outline-none focus:ring-1 focus:ring-[#883FFF]/50" /><button className="bg-[#883FFF] text-white px-4 py-3 rounded-r-lg hover:bg-[#7623EA] transition-colors">Subscribe</button></div></div></div></div>
      </div>
      <style>{`.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }`}</style>
    </div>
  );
};

export default Category;

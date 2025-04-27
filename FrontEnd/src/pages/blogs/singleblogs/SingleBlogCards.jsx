import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { formatDate } from '../../../../utilis/dateFormater';
import { Share2, Facebook, Twitter, MessageCircle, Mail } from 'lucide-react';

// Category colors mapping (consistent with Category.jsx and CategoryNav.jsx)
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

// Parse content helper function (works for both content and conclusion)
const parseContent = (contentObj, type = 'content') => {
  try {
    if (!contentObj) {
      console.warn(`No ${type} available:`, contentObj);
      return `<p>No ${type} available.</p>`;
    }

    // Handle different content formats
    if (typeof contentObj === 'string') {
      console.log(`${type} is string:`, contentObj);
      return contentObj;
    } else if (contentObj.type === 'quill' && contentObj.data) {
      console.log(`${type} is quill format:`, contentObj.data);
      return contentObj.data;
    } else if (contentObj.blocks) {
      // Legacy EditorJS format support
      console.warn(`EditorJS ${type} format detected - consider migrating this content`);
      return `<p>This ${type} was created with the old editor. Please consider updating it.</p>`;
    } else {
      console.warn(`Unrecognized ${type} format:`, contentObj);
      return `<p>Unable to render this ${type} format.</p>`;
    }
  } catch (error) {
    console.error(`Error parsing ${type}:`, error.message, 'Content:', contentObj);
    return `<p>Error rendering ${type}: ${error.message}</p>`;
  }
};

// Calculate reading time based on content
const calculateReadingTime = (content) => {
  const WPM = 238;

  try {
    if (!content) {
      console.warn('Content is empty or null:', content);
      return '1 min read';
    }

    // Extract text from HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = typeof content === 'string' ? content : 
                        content.data ? content.data : '';
    const text = tempDiv.textContent || tempDiv.innerText || '';
    
    const words = text.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / WPM));
    return `${minutes} min read`;
  } catch (error) {
    console.error('Error calculating reading time:', error);
    return '1 min read';
  }
};

const SingleBlogCards = ({ blog }) => {
  const { adImages, adLinks, bottomAdVisible } = useSelector((state) => state.ads);

  // Debugging log
  console.log('SingleBlogCards received blog:', blog);

  if (!blog || !blog.title) {
    console.error('Invalid blog data:', blog);
    return (
      <div className="bg-white p-8">
        <p className="text-red-600 font-semibold">
          Error: Unable to load blog post. Please try again later.
        </p>
      </div>
    );
  }

  const { title, createdAt, author, content, conclusion, coverImg, category } = blog;

  // Debugging conclusion
  console.log('Conclusion data:', conclusion);

  const readingTime = useMemo(() => {
    return calculateReadingTime(content);
  }, [content]);

  const shareUrl = window.location.href;
  const shareTitle = title || 'Blog Post';

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank');
  };

  const shareToWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`, '_blank');
  };

  // Fixed email share function that works with native mail clients
  const shareToEmail = () => {
    try {
      const subject = encodeURIComponent(`Check out this blog: ${shareTitle}`);
      const body = encodeURIComponent(`I found this great blog post: ${shareTitle}\n\nRead it here: ${shareUrl}`);
      
      // Use the Windows-specific protocol when available
      if (navigator.userAgent.indexOf('Windows') !== -1) {
        // Try to use Windows Mail app protocol
        const mailtoLink = `ms-mail:?subject=${subject}&body=${body}`;
        
        // Create and click a hidden anchor
        const link = document.createElement('a');
        link.href = mailtoLink;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        // Remove the link after a short delay
        setTimeout(() => {
          document.body.removeChild(link);
        }, 100);
      } else {
        // Fallback to standard mailto for other platforms
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      }
    } catch (error) {
      console.error('Error opening email client:', error);
      alert('Could not open email client. You can copy the link and share it manually.');
    }
  };

  const handleGenericShare = () => {
    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        url: shareUrl,
      }).catch((err) => console.error('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  const authorName = author?.username || author?.name || (typeof author === 'string' ? author : author?.email) || 'Unknown Author';

  // Check if conclusion exists and has content
  const hasConclusion = conclusion && 
    ((conclusion.data && conclusion.data.trim() !== '') || 
     (typeof conclusion === 'string' && conclusion.trim() !== ''));

  return (
    <div className="bg-white p-8">
      <div className="mb-8">
        <span
          className={`inline-block px-3 py-1 rounded-md text-base font-medium text-white mb-4 ${
            categoryColors[category?.toLowerCase()] || categoryColors.travel
          }`}
        >
          {category || 'travel'}
        </span>
        <h1 className="text-3xl md:text-4xl font-medium mb-4">{title}</h1>
        <div className="flex flex-wrap items-center gap-2 text-base mb-1">
          <span className="text-gray-600">by</span>
          <span className="text-blue-600 font-bold">{authorName}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <span>{formatDate(createdAt)}</span>
          <span className="inline-block w-1 h-1 bg-gray-400 rounded-full"></span>
          <span>{readingTime}</span>
        </div>
      </div>

      <div className="relative mt-8">
        <div className="absolute left-0 top-40 flex flex-col gap-2 transform -translate-x-16">
          <button
            onClick={shareToFacebook}
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
            aria-label="Share on Facebook"
          >
            <Facebook size={20} />
          </button>
          <button
            onClick={shareToTwitter}
            className="bg-black text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
            aria-label="Share on X"
            title="Share on X (formerly Twitter)"
          >
            <Twitter size={20} />
          </button>
          <button
            onClick={shareToWhatsApp}
            className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors"
            aria-label="Share on WhatsApp"
          >
            <MessageCircle size={20} />
          </button>
          <button
            onClick={shareToEmail}
            className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-colors"
            aria-label="Share via Email"
            title="Share via Email (Windows Mail)"
          >
            <Mail size={20} />
          </button>
          <button
            onClick={handleGenericShare}
            className="bg-gray-200 text-gray-700 p-2 rounded-full hover:bg-gray-300 transition-colors"
            aria-label="Share this article"
          >
            <Share2 size={20} />
          </button>
        </div>

        <img
          src={coverImg || 'https://via.placeholder.com/800x520'}
          alt={title || 'Cover'}
          className="w-full md:h-[520px] object-cover rounded-lg shadow-md"
          onError={(e) => {
            console.error('Failed to load cover image:', coverImg);
            e.target.src = 'https://via.placeholder.com/800x520';
          }}
        />
      </div>

      <div className="mt-8 space-y-6 quill-content">
        <div dangerouslySetInnerHTML={{ __html: parseContent(content, 'content') }} />
      </div>

      {/* Conclusion Section with Border and Styling */}
      <div className="mt-12 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Conclusion</h2>
        <div className="border-2 border-emerald-600 rounded-lg p-6 bg-emerald-50">
          {hasConclusion ? (
            <div 
              className="quill-content prose max-w-none" 
              dangerouslySetInnerHTML={{ __html: parseContent(conclusion, 'conclusion') }} 
            />
          ) : (
            <p className="text-gray-600 italic">No conclusion provided for this blog.</p>
          )}
        </div>
      </div>

      <div className="mt-8">
        {bottomAdVisible && (
          <div>
            {adImages.bottom ? (
              <a
                href={adLinks.bottom || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <img
                  src={adImages.bottom}
                  alt="Bottom Ad"
                  className="w-full object-contain rounded-lg shadow-md"
                  onError={(e) => {
                    console.error('Failed to load ad image:', adImages.bottom);
                    e.target.src = 'https://via.placeholder.com/1152x160';
                  }}
                />
              </a>
            ) : (
              <div className="w-full bg-gradient-to-r from-red-200 to-red-100 p-4 text-center rounded-lg shadow-md flex items-center justify-center">
                <p className="text-red-600 font-semibold">Advertisement - Sponsored Content</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleBlogCards;
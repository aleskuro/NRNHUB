import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { formatDate } from '../../../../utilis/dateFormater';
import { Share2, Facebook, X, MessageCircle, Mail, ChevronUp, ChevronDown, AlertCircle } from 'lucide-react';

// Category colors mapping
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
  sports: 'bg-blue-600', // Added for SPORTS category (matches Sports.jsx)
};

// Parse content helper function (unchanged)
const parseContent = (contentObj, type = 'content') => {
  try {
    if (!contentObj) {
      console.warn(`No ${type} available:`, contentObj);
      return `<p>No ${type} available.</p>`;
    }

    if (typeof contentObj === 'string') {
      console.log(`${type} is string:`, contentObj);
      return contentObj;
    } else if (contentObj.type === 'quill' && contentObj.data) {
      console.log(`${type} is quill format:`, contentObj.data);
      return contentObj.data;
    } else if (contentObj.blocks) {
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

// Calculate reading time (unchanged)
const calculateReadingTime = (content) => {
  const WPM = 238;

  try {
    if (!content) {
      console.warn('Content is empty or null:', content);
      return '1 min read';
    }

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

  console.log('Conclusion data:', conclusion);

  const readingTime = useMemo(() => {
    return calculateReadingTime(content);
  }, [content]);

  const shareUrl = window.location.href;
  const shareTitle = title || 'Blog Post';

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareToX = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank');
  };

  const shareToWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`, '_blank');
  };

  const shareToEmail = () => {
    try {
      const subject = encodeURIComponent(`Check out this blog: ${shareTitle}`);
      const body = encodeURIComponent(`I found this great blog post: ${shareTitle}\n\nRead it here: ${shareUrl}`);
      
      if (navigator.userAgent.indexOf('Windows') !== -1) {
        const mailtoLink = `ms-mail:?subject=${subject}&body=${body}`;
        const link = document.createElement('a');
        link.href = mailtoLink;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
        }, 100);
      } else {
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

  const hasConclusion = conclusion && 
    ((conclusion.data && conclusion.data.trim() !== '') || 
     (typeof conclusion === 'string' && conclusion.trim() !== ''));

  return (
    <div className="bg-white p-8">
      <div className="mb-8">
        <span
          className={`inline-block px-3 py-1 rounded-md text-base font-medium text-white mb-4 ${
            categoryColors[category?.toLowerCase()] || categoryColors.general
          }`}
        >
          {category || 'general'}
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
            onClick={shareToX}
            className="bg-black text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
            aria-label="Share on X"
            title="Share on X (formerly Twitter)"
          >
            <X size={20} />
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

      {/* Collapsible Key Takeaways Section - Render only if hasConclusion is true */}
      {hasConclusion && (
        <div className="mt-12 mb-8">
          <div className="border border-[#883FFF] rounded-lg overflow-hidden">
            {(() => {
              const [isExpanded, setIsExpanded] = useState(true);
              return (
                <>
                  <div 
                    className="flex items-center justify-between p-4 bg-purple-50 cursor-pointer"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    <div className="flex items-center">
                      <span className="text-[#883FFF] font-bold text-lg mr-2">✦</span>
                      <h2 className="text-lg font-medium">Key Takeaways</h2>
                    </div>
                    {isExpanded ? 
                      <ChevronUp className="text-[#883FFF]" size={20} /> : 
                      <ChevronDown className="text-[#883FFF]" size={20} />
                    }
                  </div>
                  
                  {isExpanded && (
                    <div className="p-4">
                      <div 
                        className="quill-content prose max-w-none" 
                        dangerouslySetInnerHTML={{ __html: parseContent(conclusion, 'conclusion') }} 
                      />
                      <hr className="my-4 border-gray-200" />
                      <div className="text-right">
                        <a 
                          href="http://localhost:5173/messages" 
                          className="text-xs text-gray-500 hover:text-[#883FFF] transition-colors inline-flex items-center"
                        >
                          <span>See a mistake? Let us know.</span>
                        </a>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}

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
import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { formatDate } from '../../../../utilis/dateFormater';
import {
  Share2,
  Facebook,
  X,
  MessageCircle,
  Mail,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

// Category colors
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
  sports: 'bg-blue-600',
};

// Parse content
const parseContent = (contentObj, type = 'content') => {
  try {
    if (!contentObj) return `<p>No ${type} available.</p>`;
    if (typeof contentObj === 'string') return contentObj;
    if (contentObj.type === 'quill' && contentObj.data) return contentObj.data;
    if (contentObj.blocks) {
      return `<p>This ${type} was created with the old editor. Please consider updating it.</p>`;
    }
    return `<p>Unable to render this ${type} format.</p>`;
  } catch (error) {
    console.error(`Error parsing ${type}:`, error);
    return `<p>Error rendering ${type}.</p>`;
  }
};

// Reading time
const calculateReadingTime = (content) => {
  const WPM = 238;
  try {
    if (!content) return '1 min read';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = typeof content === 'string' ? content : content.data || '';
    const words = tempDiv.textContent.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / WPM));
    return `${minutes} min read`;
  } catch {
    return '1 min read';
  }
};

// Extract username from email
const extractUsernameFromEmail = (email) =>
  typeof email === 'string' && email.includes('@') ? email.split('@')[0] : email;

const KeyTakeaways = ({ conclusion }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const parsedConclusion = useMemo(() => parseContent(conclusion, 'conclusion'), [conclusion]);

  return (
    <div className="mt-12 mb-8">
      <div className="border border-[#883FFF] rounded-lg overflow-hidden">
        <div
          className="flex items-center justify-between p-4 bg-purple-50 cursor-pointer select-none"
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          <div className="flex items-center">
            <span className="text-[#883FFF] font-bold text-lg mr-2">Key</span>
            <h2 className="text-lg font-medium">Key Takeaways</h2>
          </div>
          {isExpanded ? (
            <ChevronUp className="text-[#883FFF]" size={20} />
          ) : (
            <ChevronDown className="text-[#883FFF]" size={20} />
          )}
        </div>

        {isExpanded && (
          <div className="p-4">
            <div
              className="quill-content prose max-w-none"
              dangerouslySetInnerHTML={{ __html: parsedConclusion }}
            />
            <hr className="my-4 border-gray-200" />
            <div className="text-right">
              <a
                href="/messages"
                className="text-xs text-gray-500 hover:text-[#883FFF] transition-colors inline-flex items-center"
              >
                See a mistake? Let us know.
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SingleBlogCards = ({ blog }) => {
  const { adImages = {}, adLinks = {}, bottomAdVisible } = useSelector((state) => state?.ads || {});

  // Early return BEFORE any hooks → this is safe
  if (!blog || !blog.title) {
    return (
      <div className="bg-white p-8 text-center">
        <p className="text-red-600 font-semibold">
          Error: Unable to load blog post. Please try again later.
        </p>
      </div>
    );
  }

  const {
    title,
    createdAt,
    author,
    content,
    conclusion,
    coverImg,
    category,
  } = blog;

  const readingTime = useMemo(() => calculateReadingTime(content), [content]);

  const shareUrl = window.location.href;
  const shareTitle = title || 'Check out this blog';

  const shareToFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  const shareToX = () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank');
  const shareToWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`, '_blank');
  const shareToEmail = () => {
    const subject = encodeURIComponent(`Check out this blog: ${shareTitle}`);
    const body = encodeURIComponent(`I found this great blog post: ${shareTitle}\n\nRead it here: ${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };
  const handleGenericShare = () => {
    if (navigator.share) {
      navigator.share({ title: shareTitle, url: shareUrl }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  const authorName =
    author?.username ||
    author?.name ||
    (typeof author === 'string' ? extractUsernameFromEmail(author) : extractUsernameFromEmail(author?.email)) ||
    'Unknown Author';

  const hasConclusion =
    conclusion &&
    ((typeof conclusion === 'string' && conclusion.trim()) ||
     (conclusion.data && conclusion.data.trim()));

  return (
    <div className="bg-white p-8">
      {/* Header */}
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

      {/* Share Buttons */}
      <div className="relative mt-8">
        <div className="absolute left-0 top-40 flex flex-col gap-2 transform -translate-x-16 z-10">
          <button onClick={shareToFacebook} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700" aria-label="Facebook">
            <Facebook size={20} />
          </button>
          <button onClick={shareToX} className="bg-black text-white p-2 rounded-full hover:bg-gray-800" aria-label="X">
            <X size={20} />
          </button>
          <button onClick={shareToWhatsApp} className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600" aria-label="WhatsApp">
            <MessageCircle size={20} />
          </button>
          <button onClick={shareToEmail} className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700" aria-label="Email">
            <Mail size={20} />
          </button>
          <button onClick={handleGenericShare} className="bg-gray-200 text-gray-700 p-2 rounded-full hover:bg-gray-300" aria-label="Share">
            <Share2 size={20} />
          </button>
        </div>

        <img
          src={coverImg || 'https://via.placeholder.com/800x520'}
          alt={title}
          class Globe
          className="w-full md:h-[520px] object-cover rounded-lg shadow-md"
          onError={(e) => (e.target.src = 'https://via.placeholder.com/800x520')}
        />
      </div>

      {/* Main Content */}
      <div className="mt-8 space-y-6 quill-content">
        <div dangerouslySetInnerHTML={{ __html: parseContent(content, 'content') }} />
      </div>

      {/* Key Takeaways – now safe */}
      {hasConclusion && <KeyTakeaways conclusion={conclusion} />}

      {/* Bottom Ad */}
      {bottomAdVisible && (
        <div className="mt-8">
          {adImages.bottom ? (
            <a href={adLinks.bottom || '#'} target="_blank" rel="noopener noreferrer" className="block">
              <img
                src={adImages.bottom}
                alt="Advertisement"
                className="w-full object-contain rounded-lg shadow-md"
                onError={(e) => (e.target.src = 'https://via.placeholder.com/1152x160')}
              />
            </a>
          ) : (
            <div className="bg-gradient-to-r from-red-200 to-red-100 p-4 text-center rounded-lg">
              <p className="text-red-600 font-semibold">Advertisement - Sponsored Content</p>
            </div>
          )}
        </div>
      )}

      {/* Quill Styles */}
      <style jsx>{`
        .quill-content {
          font-family: 'Nunito', sans-serif;
        }
        .quill-content h1 { font-family: 'Playfair Display', serif; }
        .quill-content h2, .quill-content h3 { font-family: 'Merriweather', serif; }
        .quill-content p { font-family: 'Nunito', sans-serif; }
        @import url('https://fonts.googleapis.com/css2?family=Montserrat&family=Roboto&family=Open+Sans&family=Lato&family=Fira+Sans&family=Merriweather&family=Playfair+Display&family=Nunito&family=Raleway&family=Rubik&family=Lora&display=swap');
      `}</style>
    </div>
  );
};

export default SingleBlogCards;
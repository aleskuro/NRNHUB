import React, { useMemo } from 'react';
import { formatDate } from '../../../../utilis/dateFormater';
import EditorJsHtml from 'editorjs-html';
import { Share2 } from 'lucide-react';
import "/Users/user/Desktop/nnrnhub/FrontEnd/src/index.css"; // Adjust path as needed

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

// Calculate reading time based on content
const calculateReadingTime = (content) => {
  const WPM = 238; // Average reading speed (words per minute)

  try {
    if (!content) {
      console.warn('Content is empty or null:', content);
      return '1 min read';
    }

    let text = '';

    // Handle string or object content
    const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;

    // Extract text from blocks
    if (parsedContent && parsedContent.blocks && Array.isArray(parsedContent.blocks)) {
      text = parsedContent.blocks
        .map((block) => {
          if (block.type === 'paragraph') return block.data.text || '';
          if (block.type === 'header') return block.data.text || '';
          if (block.type === 'list') {
            return Array.isArray(block.data.items)
              ? block.data.items
                  .map((item) => (typeof item === 'object' ? item.content || '' : item))
                  .join(' ')
              : '';
          }
          return '';
        })
        .join(' ');
    } else {
      console.warn('Invalid content structure:', parsedContent);
      return '1 min read';
    }

    // Count words and calculate reading time
    const words = text.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / WPM));
    return `${minutes} min read`;
  } catch (error) {
    console.error('Error calculating reading time:', error);
    return '1 min read';
  }
};

const edjsParser = EditorJsHtml({
  paragraph: (block) => `<p>${block.data.text}</p>`,
  header: (block) => `<h${block.data.level}>${block.data.text}</h${block.data.level}>`,
  list: (block) => {
    console.log('List Block Data:', JSON.stringify(block, null, 2));
    const items = block.data.items.map((item) => {
      const text = typeof item === 'object' ? item.content || JSON.stringify(item) : item;
      return `<li>${text}</li>`;
    }).join('');
    const style = block.data.style ? block.data.style.toLowerCase() : 'unordered';
    if (style === 'unordered') {
      return `<ul>${items}</ul>`;
    } else {
      // Handle ordered list with different counter types
      const counterType = block.data.meta?.counterType || 'numeric';
      let listType = 'decimal';
      switch (counterType) {
        case 'upper-alpha':
          listType = 'upper-alpha';
          break;
        case 'lower-alpha':
          listType = 'lower-alpha';
          break;
        case 'upper-roman':
          listType = 'upper-roman';
          break;
        case 'lower-roman':
          listType = 'lower-roman';
          break;
        case 'numeric':
        default:
          listType = 'decimal';
          break;
      }
      return `<ol type="${listType}">${items}</ol>`;
    }
  },
});

const SingleBlogCards = ({ blog }) => {
  if (!blog || !blog.title) {
    console.error('Invalid blog data:', blog);
    return <div className="bg-white p-8">Invalid blog data.</div>;
  }

  const { title, createdAt, author, content, coverImg, rating, category } = blog;

  // Calculate reading time
  const readingTime = useMemo(() => {
    return calculateReadingTime(content);
  }, [content]);

  // Handle share functionality
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title || 'Blog Post',
        url: window.location.href,
      }).catch((err) => console.error('Error sharing:', err));
    } else {
      // Fallback - copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  let htmlBlocks = [];
  try {
    console.log('Raw Content:', content);
    const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
    console.log('Parsed Content:', parsedContent);

    if (!parsedContent || !parsedContent.blocks || !Array.isArray(parsedContent.blocks)) {
      throw new Error('Invalid content structure: "blocks" is missing or not an array');
    }

    const parsedBlocks = edjsParser.parse(parsedContent);
    console.log('Parsed Blocks:', parsedBlocks);

    // Handle string or array output from edjsParser
    if (typeof parsedBlocks === 'string') {
      htmlBlocks = parsedBlocks.match(/<(?:h\d|p|ul|ol)[\s\S]*?(?:<\/(?:h\d|p|ul|ol)>|$)/gi) || [parsedBlocks];
    } else if (Array.isArray(parsedBlocks)) {
      htmlBlocks = parsedBlocks;
    } else {
      throw new Error('Unexpected parsedBlocks type: ' + typeof parsedBlocks);
    }

    console.log('Final htmlBlocks:', htmlBlocks);

    if (htmlBlocks.length === 0) {
      console.warn('No valid HTML blocks generated. Parsed Blocks:', parsedBlocks, 'Content:', parsedContent);
      htmlBlocks = ['<p>No content available.</p>'];
    }
  } catch (error) {
    console.error('Error parsing blog content:', error.message, 'Content:', content);
    htmlBlocks = [`<p>Error rendering blog content: ${error.message}</p>`];
  }

  return (
    <div className="bg-white p-8">
      <div>
        {/* Title row with reading time, category, and share button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 font-medium">{readingTime}</span>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm text-white ${
                categoryColors[category?.toLowerCase()] || 'bg-[#883FFF]'
              }`}
            >
              {category || 'General'}
            </span>
          </div>
          <h1 className="md:text-4xl text-3xl font-medium">{title}</h1>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Share this article"
          >
            <Share2 size={20} />
          </button>
        </div>

        <p className="mb-6">
          {formatDate(createdAt)} by
          <span className="text-blue-400 cursor-pointer"> {author?.email || author || 'Unknown Author'} </span>
        </p>
      </div>

      <div>
        <img
          src={coverImg || 'https://via.placeholder.com/800x520'}
          alt={title || 'Cover'}
          className="w-full md:h-[520px] object-cover rounded-lg shadow-md"
          onError={(e) => (e.target.src = 'https://via.placeholder.com/800x520')}
        />
      </div>

      <div className="mt-8 space-y-6 editorjsdiv">
        {htmlBlocks.map((block, index) => (
          <div key={index} dangerouslySetInnerHTML={{ __html: block }} />
        ))}
      </div>

      <div className="w-full bg-red-200 p-8 text-center mt-8 h-60">
        <p className="text-red-600 font-semibold">Ad Below Blog (Large)</p>
      </div>
    </div>
  );
};

export default SingleBlogCards;
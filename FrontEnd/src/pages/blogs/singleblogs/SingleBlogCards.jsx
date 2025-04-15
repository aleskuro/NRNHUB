import React from 'react';
import { formatDate } from '../../../../utilis/dateFormater';
import EditorJsHtml from 'editorjs-html';
import "/Users/user/Desktop/nnrnhub/FrontEnd/src/index.css"
 // Add this line (adjust path as needed)

 const edjsParser = EditorJsHtml({
    paragraph: (block) => `<p>${block.data.text}</p>`,
    header: (block) => `<h${block.data.level}>${block.data.text}</h${block.data.level}>`,
    list: (block) => {
      console.log('List Block Data:', JSON.stringify(block, null, 2));
      const items = block.data.items.map(item => {
        const text = typeof item === 'object' ? (item.content || JSON.stringify(item)) : item;
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

  const { title, createdAt, author, content, coverImg, rating } = blog;

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
        <h1 className="md:text-4xl text-3xl font-medium mb-4">{title}</h1>
        <p className="mb-6">
          {formatDate(createdAt)} by
          <span className="text-blue-400 cursor-pointer"> {author || 'Unknown Author'} </span>
        </p>
      </div>

      <div>
        <img
          src={coverImg}
          alt="Cover"
          className="w-full md:h-[520px] object-cover rounded-lg shadow-md"
        />
      </div>

      <div className="mt-8 space-y-6 editorjsdiv">
        {htmlBlocks.map((block, index) => (
          <div key={index} dangerouslySetInnerHTML={{ __html: block }} />
        ))}
      </div>

      <div className="mt-6 text-lg font-medium">
        Rating: <span className="text-yellow-500">{rating}</span>
      </div>

      <div className="w-full bg-red-200 p-8 text-center mt-8 h-60">
        <p className="text-red-600 font-semibold">Ad Below Blog (Large)</p>
      </div>
    </div>
  );
};

export default SingleBlogCards;
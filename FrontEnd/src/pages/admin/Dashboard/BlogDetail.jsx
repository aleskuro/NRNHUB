import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const BlogDetail = () => {
  const { id } = useParams();
  let readTimeStart = Date.now();

  useEffect(() => {
    return () => {
      // On component unmount (user leaves the page)
      const readTimeSeconds = Math.round((Date.now() - readTimeStart) / 1000);
      axios.post(`${window.location.origin}/api/blogs/${id}/read-time`, { readTime: readTimeSeconds })
        .catch((error) => console.error('Error tracking read time:', error));
    };
  }, [id]);

  // Rest of the component
  return <div>Blog Detail Page</div>;

  
};

export default BlogDetail;
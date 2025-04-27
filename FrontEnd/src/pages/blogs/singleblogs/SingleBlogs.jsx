import React from "react";
import { useParams } from "react-router-dom";
// import { useFetchBlogByIdQuery, useFetchBlogsQuery } from "../../../Redux/features/blogs/blogAPI";
import { useFetchBlogByIdQuery, useFetchBlogsQuery } from "../../../Redux/features/blogs/blogApi";
import SingleBlogCards from "./SingleBlogCards";
import CommentsCard from "../comments/CommentsCard";
import RelatedBlogs from "./RelatedBlogs";
import noImage from "../../../assets/images.png";
import { Link } from "react-router-dom";

// 🔥 INTERESTED BLOGS SECTION
const InterestedBlogs = () => {
  const { data: blogs = [], isLoading, error } = useFetchBlogsQuery({});
  
  // Just grabbing first 6 blogs people might be into
  const interested = blogs.slice(0, 6);

  const truncateTitle = (title, maxLength = 30) =>
    title.length <= maxLength ? title : title.substring(0, maxLength - 3) + '...';

  if (isLoading) return <p className="mt-4">Loading interests...</p>;
  if (error) return <p className="text-red-500 mt-4">Failed to load interested blogs.</p>;
  if (!interested.length) return null;

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">What People Are Interested In</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {interested.map((blog) => (
          <Link
            to={`/blogs/${blog._id}`}
            key={blog._id}
            onClick={() => window.scrollTo(0, 0)} // Scroll to top on click
          >
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden">
              <img
                src={blog.coverImg}
                alt={blog.title}
                onError={(e) => (e.target.src = noImage)}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="text-md font-bold mb-1 text-gray-900">
                  {truncateTitle(blog.title)}{" "}
                  <span className="text-sm text-[#883FFF]">({blog.category || "General"})</span>
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {blog.description || "Explore this blog for more insights..."}
                </p>
                <button className="mt-3 bg-[#883FFF] text-white px-3 py-1 rounded-full text-xs hover:bg-[#893fff9f]">
                  Read Now
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// 🔥 MAIN COMPONENT
const SingleBlogs = () => {
  const { id } = useParams();
  const { data: blog = {}, error, isLoading } = useFetchBlogByIdQuery(id);

  return (
    <div className="text-primary container mx-auto mt-8">
      {isLoading && <div>Loading...</div>}
      {error && <div>{error.message}</div>}

      {blog.post && (
        <div className="flex flex-col lg:flex-row justify-between items-start md:gap-12 gap-8">
          <div className="lg:w-2/3"> 
            <SingleBlogCards blog={blog.post} />
            <CommentsCard comments={blog.comments} />
            <InterestedBlogs/>
          </div>

          <div className="bg-white lg:w-1/3 w-full">
            <RelatedBlogs />
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleBlogs;
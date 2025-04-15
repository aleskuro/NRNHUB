import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetchRelatedBlogsQuery } from '../../../Redux/features/blogs/blogAPI';

const RelatedBlogs = () => {
    const { id } = useParams();
    if (!id) return <p className="p-8 text-red-600 font-semibold">Invalid blog ID. (Are you sure you're on the right path?)</p>;

    console.log(`Fetching: /blogs/related/${id}`);

    const { data = [], error, isLoading } = useFetchRelatedBlogsQuery(id);

    console.log("API Response:", data);

    if (isLoading) return <p className="p-8 text-gray-700 italic">Fetching related stories... (Hang tight, a tale is unfolding!)</p>;
    if (error) return <p className="p-8 text-red-600 font-semibold">Oops! Something went sideways. (Related blogs decided to play hide-and-seek.)</p>;

    return (
        <div>
            <div className="mt-8">
                <h3 className="text-3xl font-semibold pt-8 px-8 pb-5 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Explore Further</h3>
                <hr className="border-gray-200" />

                {data.length === 0 ? (
                    <p className='p-8 text-gray-600 italic'>No related tales found. (Perhaps, this story stands alone?)</p>
                ) : (
                    <div className='mt-6 space-y-6'>
                        {data.map((blog) => (
                            <Link
                                to={`/blogs/${blog._id}`}
                                key={blog._id}
                                className='flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-gradient-to-r from-gray-50 to-gray-100'
                            >
                                <div className='w-20 h-20 rounded-full overflow-hidden flex-shrink-0'>
                                    <img
                                        src={blog.coverImg || "https://via.placeholder.com/150"}
                                        alt={blog.title || "No Title"}
                                        className='w-full h-full object-cover'
                                    />
                                </div>

                                <div className='flex-grow'>
                                    <h4 className='text-lg font-semibold text-blue-700 mb-2'>
                                        {blog.title.substring(0, 70) || "No Title"}
                                    </h4>
                                    <p className="text-gray-600 text-sm">
                                        {blog.description?.substring(0, 100) || "No Description"}...
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Big Ad Below Related Blogs */}
            <div className="w-full bg-gradient-to-r from-red-200 to-red-100 p-8 text-center mt-8 h-60">
                <p className="text-red-600 font-semibold">Big Ad Below Related Blogs</p>
            </div>
        </div>
    );
};

export default RelatedBlogs;
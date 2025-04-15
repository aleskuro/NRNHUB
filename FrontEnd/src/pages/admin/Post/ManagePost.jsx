import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../../../utilis/dateFormater';
import { MdModeEdit } from 'react-icons/md';
import { useFetchBlogsQuery, useDeleteBlogMutation } from '../../../Redux/features/blogs/blogAPI';

const ManagePost = () => {
  const { data: blogs = [], error, isLoading, refetch } = useFetchBlogsQuery({ search: '', category: '', location: '' });


  const [deleteBlog] = useDeleteBlogMutation();

  const handleDelete = async (id) => {
    try {
      const response = await deleteBlog(id).unwrap();
      alert(response.message || 'Deleted successfully');
      refetch();
    } catch (error) {
      console.error('FAILED TO DELETE BLOG', error);
      alert('Failed to delete blog. Please try again.');
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <section className="py-1 bg-blueGray-50">
          <div className="w-full xl:w-8/12 mb-12 xl:mb-0 px-4 mx-auto mt-24">
            {error && (
              <div className="text-red-500 text-center py-2">
                Error loading blogs: {error?.data?.message || error?.error || "Server error"}
              </div>
            )}
            <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
              <div className="rounded-t mb-0 px-4 py-3 border-0">
                <div className="flex flex-wrap items-center">
                  <div className="relative w-full px-4 max-w-full flex-grow flex-1">
                    <h3 className="font-semibold text-base text-blueGray-700">All Blogs</h3>
                  </div>
                </div>
              </div>

              <div className="block w-full overflow-x-auto">
                <table className="items-center bg-transparent w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="px-6 text-xs font-semibold text-left">No.</th>
                      <th className="px-6 text-xs font-semibold text-left">Blog Name</th>
                      <th className="px-6 text-xs font-semibold text-left">Publishing Date</th>
                      <th className="px-6 text-xs font-semibold text-left">Edit</th>
                      <th className="px-6 text-xs font-semibold text-left">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogs.map((blog, index) => {
                      console.log(`Blog ID: ${blog._id}, publishedAt:`, blog.publishedAt); // ADD THIS LINE
                      return (
                        <tr key={blog._id}>
                          <td className="border-t-0 px-6 text-xs p-4">{index + 1}</td>
                          <td className="border-t-0 px-6 text-xs p-4">{blog.title}</td>
                          <td className="border-t-0 px-6 text-xs p-4">{formatDate(blog.createdAt)}</td>
                          <td className="border-t-0 px-6 text-xs p-4">
                            <Link to={`/dashboard/update-item/${blog._id}`} className="text-blue-600 hover:underline">
                              <span className="flex gap-1 items-center"><MdModeEdit /> Edit</span>
                            </Link>
                          </td>
                          <td className="border-t-0 px-6 text-xs p-4">
                            <button onClick={() => handleDelete(blog._id)} className="text-red-600 hover:underline">Delete</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default ManagePost;

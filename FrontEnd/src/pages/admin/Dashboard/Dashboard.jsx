import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaBlog, FaRegComment } from 'react-icons/fa';
import { FiUsers } from 'react-icons/fi';
import { RiAdminLine } from 'react-icons/ri';
import { useFetchBlogsQuery } from '../../../Redux/features/blogs/blogAPI';
import { useGetUserQuery } from '../../../Redux/features/auth/authAPI';
import { useGetCommentsQuery } from '../../../Redux/features/comments/CommentAPI';
import Blogschart from './Blogschart';


const Dashboard = () => {
  const [query, setQuery] = useState({ search: '', category: '' });
  const { data: blogs = [] } = useFetchBlogsQuery(query);
  const { data: users, isLoading: isUsersLoading, isError: isUsersError } = useGetUserQuery(); // Using useGetUsersQuery
  const { data: comments } = useGetCommentsQuery();
  const { user } = useSelector((state) => state.auth);

  const adminCount = users ? users.filter(u => u.role === 'admin').length : 0;
  const totalComments = comments?.totalComments || 0;

  let usersCountDisplay;
  if (isUsersLoading) {
    usersCountDisplay = 'Loading Users...';
  } else if (isUsersError) {
    usersCountDisplay = 'Error Fetching Users';
  } else {
    usersCountDisplay = users?.length || 0;
  }

  return (
    <div className='space-y-6'>
      <div className='bg-amber-50 p-5'>
        <h1>Hi, {user?.username} </h1>
        <p>Welcome to the Admin DashBoard</p>
        <p>Here, you can Manage Your Blog's posts, and other Administrative tasks</p>
      </div>

      {/* cards grid */}
      <div className="flex flex-col md:flex-row justify-between gap-8 pt-8">
        {/* certain grid to calculate total blogs, users */}
        <div className="bg-indigo-100 py-6 w-full rounded-sm space-y-1 flex flex-col items-center">
          <FiUsers className="size-8 text-indigo-600" />
          <p>{usersCountDisplay} Users</p>
        </div>
        <div className="bg-red-100 py-6 w-full rounded-sm space-y-1 flex flex-col items-center">
          <FaBlog className="size-8 text-red-600" />
          <p>{blogs.length} Blogs</p>
        </div>
        <div className="bg-lime-100 py-6 w-full rounded-sm space-y-1 flex flex-col items-center">
          <RiAdminLine className="size-8 text-lime-600" />
          <p>{adminCount} Admin{adminCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-orange-100 py-6 w-full rounded-sm space-y-1 flex flex-col items-center">
          <FaRegComment className="size-8 text-orange-600" />
          <p>{totalComments} Comments</p>
        </div>
      </div>

      {/* graph chart */}
      <div className="pt-5 pb-5">
        <Blogschart  blogs={blogs}/>
      </div>
     </div>
  );
};

export default Dashboard;
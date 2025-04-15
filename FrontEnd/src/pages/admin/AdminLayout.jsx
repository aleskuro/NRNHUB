import React from 'react';
import { Outlet, Navigate } from 'react-router-dom'; // Import Navigate here!
import AdminNavigation from './AdminNavigation';
import { useSelector } from 'react-redux';

const AdminLayout = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user || user.role !== 'admin') {
    alert("You must be an admin!");
    // Redirect to home or login if the user is not an admin
    return <Navigate to="/login" />;
  }

  return (
    <div className='container mx-auto flex flex-col md:flex-row gap-4 items-start justify-start'>

      <header className='lg:w-1/5 sm:2/5 w-full'>
        <AdminNavigation />
      </header>
      <main className='p-8 bg-white w-full'>
        <p>For Admin Content</p>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
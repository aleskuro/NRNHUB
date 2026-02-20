import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminNavigation from './AdminNavigation';
import { useSelector } from 'react-redux';

const AdminLayout = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user || user.role !== 'admin') {
    alert("You must be an admin!");
    return <Navigate to="/login" replace />;
  }

  return (
    <div className='container mx-auto flex flex-col md:flex-row gap-4 items-start justify-start'>
      {/* Warning Banner */}
     

      <header className='lg:w-1/5 sm:2/5 w-full'>
      
        <AdminNavigation />

      </header>

      
      <main className='p-8 bg-white w-full'>
         <div className='w-full bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4'>
        <div className='flex items-center'>
          <svg className='w-6 h-6 text-yellow-600 mr-3' fill='currentColor' viewBox='0 0 20 20'>
            <path fillRule='evenodd' d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
          </svg>
          <div>
            <p className='text-sm font-medium text-yellow-800'>
              Warning: Error 529 - High Server Load
            </p>
            <p className='text-xs text-yellow-700 mt-1'>
              The system is overloaded. Some features may be slower than usual.
            </p>
          </div>
        </div>
      </div>
        <p>For Admin Content</p>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
import React from 'react';
import AdminImg from '../../assets/admin.png';
import { NavLink } from 'react-router-dom';
import { useLoginUserMutation } from '../../Redux/features/auth/authAPI';
import { useDispatch } from 'react-redux';
import { logout } from '../../Redux/features/auth/authSlice'; // Assuming you have a logout action

const AdminNavigation = () => {
  const [logoutUser] = useLoginUserMutation();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
      dispatch(logout());
      // Optionally, redirect the user to the login page after successful logout
      // navigate('/login'); // Make sure to import useNavigate if you uncomment this
    } catch (error) {
      console.error("Failed to log out", error);
      // Optionally, display an error message to the user
    }
  };

  return (
    <div className="space-y-5 bg-white p-8 md:h-[calc(100vh-98px)] flex flex-col justify-between">
      <div>
        {/* Headers part */}
        <div className="mb-5 flex items-center space-x-3">
          <img src={AdminImg} alt="Admin Avatar" className="size-10" />
          <p className="font-semibold">Admin</p>
        </div>
        <hr />
        <nav>
          <ul className="space-y-3 mt-5">
            <li>
              <NavLink
                to="/dashboard"
                end
                className={({ isActive }) =>
                  isActive
                    ? 'text-blue-600 font-bold'
                    : 'text-gray-700 hover:text-blue-500 transition duration-300 block py-2'
                }
              >
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/dashboard/add-new-post"
                className={({ isActive }) =>
                  isActive
                    ? 'text-blue-600 font-bold'
                    : 'text-gray-700 hover:text-blue-500 transition duration-300 block py-2'
                }
              >
                New Post
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/dashboard/manage-items"
                className={({ isActive }) =>
                  isActive
                    ? 'text-blue-600 font-bold'
                    : 'text-gray-700 hover:text-blue-500 transition duration-300 block py-2'
                }
              >
                Manage Items
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/dashboard/users"
                className={({ isActive }) =>
                  isActive
                    ? 'text-blue-600 font-bold'
                    : 'text-gray-700 hover:text-blue-500 transition duration-300 block py-2'
                }
              >
                Users
              </NavLink>
              
              <NavLink
                to="/dashboard/ads-management"
                className={({ isActive }) =>
                  isActive
                    ? 'text-blue-600 font-bold'
                    : 'text-gray-700 hover:text-blue-500 transition duration-300 block py-2'
                }
              >
                Ads-management
              </NavLink>
              <NavLink
                to="/dashboard/cover-uploads"
                className={({ isActive }) =>
                  isActive
                    ? 'text-blue-600 font-bold'
                    : 'text-gray-700 hover:text-blue-500 transition duration-300 block py-2'
                }
              >
                Upload
              </NavLink>
              <NavLink
                to="/dashboard/ad-messages"
                className={({ isActive }) =>
                  isActive
                    ? 'text-blue-600 font-bold'
                    : 'text-gray-700 hover:text-blue-500 transition duration-300 block py-2'
                }
              >
                Ad Messages
              </NavLink>
              <NavLink
                to="/dashboard/Booked"
                className={({ isActive }) =>
                  isActive
                    ? 'text-blue-600 font-bold'
                    : 'text-gray-700 hover:text-blue-500 transition duration-300 block py-2'
                }
              >
                Booked Calls
              </NavLink>
              <NavLink
                to="/dashboard/Subscribers"
                className={({ isActive }) =>
                  isActive
                    ? 'text-blue-600 font-bold'
                    : 'text-gray-700 hover:text-blue-500 transition duration-300 block py-2'
                }
              >
                Subscribers
              </NavLink>
              <NavLink
                to="/dashboard/Blogs-Analytics"
                className={({ isActive }) =>
                  isActive
                    ? 'text-blue-600 font-bold'
                    : 'text-gray-700 hover:text-blue-500 transition duration-300 block py-2'
                }
              >
                Analytics
              </NavLink>

              <NavLink
                to="/dashboard/User-Analytics"
                className={({ isActive }) =>
                  isActive
                    ? 'text-blue-600 font-bold'
                    : 'text-gray-700 hover:text-blue-500 transition duration-300 block py-2'
                }
              >
               User
              </NavLink>
              
            </li>
          </ul>
        </nav>
      </div>

      <div className="mb-3">
        <hr className="mb-3" />
        <button
          onClick={handleLogout}
          className="text-white bg-red-500 font-medium px-5 py-2 rounded-sm hover:bg-red-600 transition duration-300"
        >
          Log out
        </button>
      </div>
    </div>
  );
};

export default AdminNavigation;
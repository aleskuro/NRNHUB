import { createBrowserRouter } from "react-router-dom";
import App from "../src/App";
import Home from "../src/pages/home/Home";
import Social from "../src/pages/minipage/Social";
import SingleBlogs from "../src/pages/blogs/singleblogs/SingleBlogs";
import Login from "../src/pages/user/Login"
import Register from "../src/pages/user/Registor"; // Fixed typo
import AdminLayout from "../src/pages/admin/AdminLayout";
import Dashboard from "../src/pages/admin/Dashboard/Dashboard";
import AddPost from "../src/pages/admin/Post/AddPost";
import ManagePost from "../src/pages/admin/Post/ManagePost";
import ManageUser from "../src/pages/admin/user/ManageUser";
import Advertisers from "../src/pages/admin/Messages/Advertisers";
import Messages from "../src/pages/admin/Messages/Messages";
import UpdatePost from "../src/pages/admin/Post/UpdatePost";
import UpdateUserModal from "../src/pages/admin/user/UpdateUserModal";
import ManageAds from "../src/pages/Ads/ManageAds";
import BookACall from "../src/pages/admin/Messages/BookACall";
import Subscribers from "../src/pages/admin/Messages/Subscribers";
// import Blogs from "../src/pages/blogs/Blogs";
import Blogs from "../src/pages/blogs/Blogs";
import Category from "../src/pages/minipage/Category"; 
// import BookACall from "../src/pages/admin/Messages/BookACall";
import BlogCover from "../src/pages/admin/Post/BlogCover";
import AdminAdvertisers from "../src/pages/admin/Messages/AdminMessages/AdminAdvertisers";
import AdminBookACall from "../src/pages/admin/Messages/AdminMessages/AdminBookACall";
import BlogAnalyticsDashboard from "../src/pages/admin/Dashboard/BlogAnalyticsDashboard";
import AdminSubscribers from "../src/pages/admin/Messages/AdminMessages/AdminSubscribers";
import UserAnalytics from "../src/pages/admin/Dashboard/UserAnalytics";

const router = createBrowserRouter([
  {
    path: "*",
    element: <App />,
    children: [
      { path: "", element: <Home /> },
      { path: "social", element: <Social /> },
      { path: "blogs", element: <Blogs /> }, // Route for /blogs
      { path: "blogs/:id", element: <SingleBlogs /> },
      // { path: "blog/technology", element: <Category /> }, 
      // { path: "blog/travel", element: <Category /> },
      { path: "category/:category", element: <Category /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "book-call", element: <BookACall /> },
      { path: "advertisers", element: <Advertisers /> },
      { path: "messages", element: <Messages /> },
      { path: "subscribe", element: <Subscribers/> },
      { path: "BookACall", element: <BookACall/>},
      {
        path: "dashboard",
        element: <AdminLayout />,
        children: [
          { path: "", element: <Dashboard /> },
          { path: "add-new-post", element: <AddPost /> },
          { path: "manage-items", element: <ManagePost /> },
          { path: "users", element: <ManageUser /> },
          { path: "update-item/:id", element: <UpdatePost /> },
          { path: "update", element: <UpdateUserModal /> },
          { path: "ads-management", element: <ManageAds /> },
          // { path: "cover-uploads", element: <Cover /> },
          {path: "cover-uploads" , element: <BlogCover />},
         
          {path: "ad-messages" , element: <AdminAdvertisers />},
          {path: "Booked" , element: <AdminBookACall />},
          {path: "Blogs-Analytics" , element: <BlogAnalyticsDashboard />},
          {path: "Subscribers" , element: <AdminSubscribers />},
          {path: "User-Analytics" , element: <UserAnalytics />},
        ],
      },
    ],
  },
]);

export default router;
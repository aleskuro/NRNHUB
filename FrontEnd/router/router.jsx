import { createBrowserRouter } from "react-router-dom";
import App from "../src/App";
import Home from "../src/pages/home/Home";
import Social from "../src/pages/minipage/Social";
import SingleBlogs from "../src/pages/blogs/singleblogs/SingleBlogs";
import Login from "../src/pages/user/Login";
import Registor from "../src/pages/user/Registor"; 
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

const router = createBrowserRouter([
  {
    path: "*", // ✅ FIXED: not "/*"
    element: <App />,
    children: [
      { path: "", element: <Home /> },
      { path: "social", element: <Social /> },
      { path: "blogs/:id", element: <SingleBlogs /> },
      { path: "login", element: <Login /> },
      { path: "registor", element: <Registor /> },
      {
        path: "dashboard",
        element: <AdminLayout />,
        children: [
          { path: "", element: <Dashboard /> },
          { path: "add-new-post", element: <AddPost /> },
          { path: "manage-items", element: <ManagePost /> },
          { path: "users", element: <ManageUser /> },
          { path: "advertisers", element: <Advertisers /> },
          { path: "messages", element: <Messages /> },
          { path: "update-item/:id", element: <UpdatePost /> },
          { path: "update", element: <UpdateUserModal /> },
          { path: "ads-management", element: <ManageAds /> },
        ],
      },
    ],
  },
]);

export default router;

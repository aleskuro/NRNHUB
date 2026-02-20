import { createBrowserRouter, Navigate } from 'react-router-dom'; // Added Navigate
import App from '../src/App';
import Home from '../src/pages/home/Home';
import SingleBlogs from '../src/pages/blogs/singleblogs/SingleBlogs';
import Login from '../src/pages/user/Login';
import Register from '../src/pages/user/Registor';
import AdminLayout from '../src/pages/admin/AdminLayout';
import Dashboard from '../src/pages/admin/Dashboard/Dashboard';
import AddPost from '../src/pages/admin/Post/AddPost';
import ManagePost from '../src/pages/admin/Post/ManagePost';
import ManageUser from '../src/pages/admin/user/ManageUser';
import Advertisers from '../src/pages/admin/Messages/Advertisers';
import Messages from '../src/pages/admin/Messages/Messages';
import UpdatePost from '../src/pages/admin/Post/UpdatePost';
import UpdateUserModal from '../src/pages/admin/user/UpdateUserModal';
import ManageAds from '../src/pages/Ads/ManageAds';
import BookACall from '../src/pages/admin/Messages/BookACall';
import Subscribers from '../src/pages/admin/Messages/Subscribers';
import Blogs from '../src/pages/blogs/Blogs';
import Category from '../src/pages/minipage/Category';
import BlogCover from '../src/pages/admin/Post/BlogCover';
import AdminAdvertisers from '../src/pages/admin/Messages/AdminMessages/AdminAdvertisers';
import AdminBookACall from '../src/pages/admin/Messages/AdminMessages/AdminBookACall';
import BlogAnalyticsDashboard from '../src/pages/admin/Dashboard/BlogAnalyticsDashboard';
import AdminSubscribers from '../src/pages/admin/Messages/AdminMessages/AdminSubscribers';
import UserAnalytics from '../src/pages/admin/Dashboard/UserAnalytics';
import CreateForm from '../src/pages/admin/Dashboard/CreateForm';
import Event from '../src/pages/Form/Event';
import FormData from '../src/pages/admin/Dashboard/FormData';
import EventDetails from '../src/pages/admin/Dashboard/EventDetails';
import Podcast from '../src/pages/videos/Podcast';
import UploadVideo from '../src/pages/admin/Dashboard/UploadVideo';
import Interview from '../src/pages/videos/Interview';
import Video from '../src/pages/videos/Video';
import Motivation from '../src/pages/videos/Motivation';
import Lifestyle from '../src/pages/categories/lifestyle/Lifestyle';
import Culture from '../src/pages/categories/lifestyle/Culture';
import Parenting from '../src/pages/categories/lifestyle/Parenting';
import Food from '../src/pages/categories/lifestyle/Food';
import Travel from '../src/pages/categories/lifestyle/Travel';
import Health from '../src/pages/categories/lifestyle/Health';
import Sports from '../src/pages/categories/lifestyle/Sports';
import Economy from '../src/pages/categories/Economy/Economy';
import Global from '../src/pages/categories/Economy/Global';
import PersonalFinace from '../src/pages/categories/Economy/Personalfinance'
import Realstate from '../src/pages/categories/Economy/Realstate';
import Smallbiz from '../src/pages/categories/Economy/Smallbiz';
import Startup from '../src/pages/categories/Economy/Startup';
import Market from '../src/pages/categories/Economy/Market';
import Eduhub from '../src/pages/videos/Eduhub';
import FinanceVideo from '../src/pages/videos/FinanceVideo';
import HealthVideo from '../src/pages/videos/HealthVideo';
import Contact from '../src/pages/admin/Messages/Contact';
import AdminContact from '../src/pages/admin/Messages/AdminMessages/AdminContact';
import About from '../src/pages/minipage/About';
import Privacy from '../src/pages/minipage/Privacy';
import Terms from '../src/pages/minipage/Terms';
import Disclaimer from '../src/pages/minipage/Disclaimer';

const router = createBrowserRouter([
  {
    path: '*',
    element: <App />,
    children: [
      { path: '', element: <Home /> },
      { path: 'blogs', element: <Blogs /> },
      { path: 'blogs/:id', element: <SingleBlogs /> },
      { path: 'category/:category', element: <Category /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'book-call', element: <BookACall /> },
      { path: 'advertisers', element: <Advertisers /> },
      { path: 'messages', element: <Messages /> },
      { path: 'subscribe', element: <Subscribers /> },
      { path: 'BookACall', element: <BookACall /> },
      { path: 'events', element: <Event /> },
      // Redirect /admin/events/:id/details to /dashboard/events/:id/details
      // { path: 'admin/events/:id/details', element: <Navigate to="/dashboard/events/:id/details" replace /> },
      { path: 'Podcast', element: <Podcast/> },
      { path: 'podcast/interviews', element: <Interview/> },
      { path: 'Podcast/videos', element: <Video/> },
      { path: 'Podcast/Motivation', element: <Motivation/> },
      { path: 'lifestyle', element: <Lifestyle/> },
      { path: 'lifestyle/culture', element: <Culture/> },
      { path: 'lifestyle/Parenting', element: <Parenting/> },
      { path: 'lifestyle/food', element: <Food/> },
      { path: 'lifestyle/travel', element: <Travel/> },
      { path: 'lifestyle/health', element: <Health/> },
      { path: 'lifestyle/sports', element: <Sports/> },
      { path: 'economy', element: <Economy/> },
      { path: 'economy/global', element: <Global/> },
      { path: 'economy/personal-finance', element: <PersonalFinace/> },
      { path: 'economy/market', element: <Market/> },
      { path: 'economy/real-estate', element: <Realstate/> },
      { path: 'economy/small-business', element: <Smallbiz/> },
      { path: 'economy/startup', element: <Startup/> },
      { path: 'edu-hub', element: <Eduhub/> },
      { path: 'edu-hub/finance', element: <FinanceVideo/> },
      { path: 'edu-hub/health', element: <HealthVideo/> },
      { path: 'Contact', element: <Contact/> },
      { path: 'About', element: <About/> },
      { path: 'Privacy', element: <Privacy/> },
      { path: 'Terms', element: <Terms/> },
      { path: 'Disclaimer', element: <Disclaimer/> },
      
     
      {
        path: 'dashboard',
        element: <AdminLayout />,
        children: [
          { path: '', element: <Dashboard /> },
          { path: 'add-new-post', element: <AddPost /> },
          { path: 'manage-items', element: <ManagePost /> },
          { path: 'users', element: <ManageUser /> },
          { path: 'update-item/:id', element: <UpdatePost /> },
          { path: 'update', element: <UpdateUserModal /> },
          { path: 'ads-management', element: <ManageAds /> },
          { path: 'cover-uploads', element: <BlogCover /> },
          { path: 'ad-messages', element: <AdminAdvertisers /> },
          { path: 'Booked', element: <AdminBookACall /> },
          { path: 'Blogs-Analytics', element: <BlogAnalyticsDashboard /> },
          { path: 'Subscribers', element: <AdminSubscribers /> },
          { path: 'User-Analytics', element: <UserAnalytics /> },
          { path: 'Create-form', element: <CreateForm /> },
          { path: 'Form-data', element: <FormData /> },
          { path: 'events/:id/details', element: <EventDetails /> },
          { path: 'Upload-Video', element: <UploadVideo /> },
          { path: 'AdminContact', element: <AdminContact /> },
          
        ],
      },
    ],
  },
]);

export default router;
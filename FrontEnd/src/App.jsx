import { Outlet } from "react-router-dom";
import Navbar from './components/Navbar';
import { fetchAdsFromServer } from './Redux/features/ads/adThunks';
import Footer from './components/Footer';


function App() {
  return (
    <div className="bg-bgPrimary min-h-screen flex flex-col">
      <Navbar />        {/* Navbar can now use useLocation safely */}
      <Outlet />        {/* Nested routes render here */}
      <Footer />
    </div>
  );
}

export default App;

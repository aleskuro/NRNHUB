import { Outlet } from "react-router-dom";
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <div className="bg-bgPrimary min-h-screen flex flex-col">
      <Navbar />
      <Outlet /> {/* this is where nested routes from router.jsx will render */}
      <Footer />
    </div>
  );
}

export default App;

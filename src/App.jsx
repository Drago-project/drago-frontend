// import { useTranslation } from "react-i18next"
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import ReadingPage from "./pages/ReadingPage";  
import LandingPage from "./pages/LandingPage";
import SignUp from "./pages/SignUp";
import LogIn from "./pages/LogIn";
import Dashboard from "./pages/Dashboard";
import NavBar from "./components/NavBar";
import NavInside from "./components/NavInside";

// component wrapper for conditional NavBar
function Layout() {
  const location = useLocation();

  const hideNavBarOn = ["/home", "/reading", "/dashboard"];
  const shouldHideNav = hideNavBarOn.includes(location.pathname);

  return (
    <>
      {!shouldHideNav ? <NavBar /> : <NavInside />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/reading" element={<ReadingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
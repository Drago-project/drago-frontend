// import { useTranslation } from "react-i18next"
import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";
import "./styles/App.css"

import Home from "./pages/Home";
import ReadingPage from "./pages/ReadingPage";  
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import SignUpForm from "./components/SignUpForm";
import LoginForm from "./components/LoginForm";
import Dashboard from "./pages/DashBoard";
import About from "./pages/About";
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
        <Route path="/about" element={<About />} />
        {/* Auth routes */}
        <Route path="/auth" element={<Auth />}>
          <Route index element={<SignUpForm />} />
          <Route path="signup" element={<SignUpForm />} />
          <Route path="login" element={<LoginForm />} />
        </Route>
        
        {/* Redirect old routes to new auth routes */}
        <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />
        <Route path="/login" element={<Navigate to="/auth/login" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/reading" element={<ReadingPage />} />
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
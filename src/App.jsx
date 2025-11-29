import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import "./styles/App.css";

// Pages
import Home from "./pages/Home";
import ReadingPage from "./pages/ReadingPage";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import Dashboard from "./pages/DashBoard";
import About from "./pages/About";

// Components
import SignUpForm from "./components/SignUpForm";
import LoginForm from "./components/LoginForm";
import NavBar from "./components/NavBar";
import NavInside from "./components/NavInside";

// Games
import VolcanoWords from "./games/VolcanoWords";
import ReadingQuest from "./games/ReadingQuest"; // ✅ دي اللعبة الجديدة

// Layout component
function Layout() {
  const location = useLocation();

  const pathsWithInsideNav = ["/home", "/reading", "/dashboard", "/games"];
  const isInsideApp = pathsWithInsideNav.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <>
      {isInsideApp ? <NavInside /> : <NavBar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />

        <Route path="/auth" element={<Auth />}>
          <Route index element={<SignUpForm />} />
          <Route path="signup" element={<SignUpForm />} />
          <Route path="login" element={<LoginForm />} />
        </Route>

        <Route path="/home" element={<Home />} />

        <Route path="/games">
          <Route path="volcano-words" element={<VolcanoWords />} />
          {/* ✅ ده المسار الجديد اللي ضفناه */}
          <Route path="reading-quest" element={<ReadingQuest />} />
        </Route>

        <Route path="/reading" element={<ReadingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route
          path="/signup"
          element={<Navigate to="/auth/signup" replace />}
        />
        <Route path="/login" element={<Navigate to="/auth/login" replace />} />

        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
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

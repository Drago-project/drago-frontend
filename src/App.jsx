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
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import Dashboard from "./pages/DashBoard";
import About from "./pages/About";

// Components
import SignUpForm from "./components/SignUpForm";
import LoginForm from "./components/LoginForm";
import NavBar from "./components/NavBar";
import NavInside from "./components/NavInside";
import SideBar from "./components/SideBar";
import ProtectedRoute from "./components/ProtectedRoute";

// Games
import VolcanoWords from "./games/VolcanoWords";
import ReadingQuest from "./games/ReadingQuest";
import WordHuntGame from "./games/WordHunt";
// اللعبة الجديدة موجودة
import TombPuzzle from "./games/TombPuzzle";

// Layout component
function Layout() {
  const location = useLocation();
  const hideAllNav = location.pathname.startsWith("/games");

  const pathsWithInsideNav = ["/home", "/reading"];
  const isInsideApp = pathsWithInsideNav.some((path) =>
    location.pathname.startsWith(path)
  );
  const pathsWithSideBar = ["/dashboard"];
  const isWithSideBar = pathsWithSideBar.some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <>
      {hideAllNav ? null : isWithSideBar ? (
        <SideBar />
      ) : isInsideApp ? (
        <NavInside />
      ) : (
        <NavBar />
      )}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />

        <Route path="/auth" element={<Auth />}>
          <Route index element={<SignUpForm />} />
          <Route path="signup" element={<SignUpForm />} />
          <Route path="login" element={<LoginForm />} />
        </Route>

        {/* ✅ رجعنا الحماية لصفحة Home */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route path="/games">
          {/* ✅ رجعنا الحماية للألعاب القديمة */}
          <Route
            path="volcano-words"
            element={
              <ProtectedRoute>
                <VolcanoWords />
              </ProtectedRoute>
            }
          />
          <Route
            path="reading-quest"
            element={
              <ProtectedRoute>
                <ReadingQuest />
              </ProtectedRoute>
            }
          />
          <Route
            path="word-hunt"
            element={
              <ProtectedRoute>
                <WordHuntGame />
              </ProtectedRoute>
            }
          />

          {/* ✅ اللعبة الجديدة موجودة ومحمية بـ ProtectedRoute */}
          <Route
            path="tomb-puzzle"
            element={
              <ProtectedRoute>
                <TombPuzzle />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

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

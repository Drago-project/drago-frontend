import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";
import "./styles/App.css";

// Pages
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import Dashboard from "./pages/DashBoard";
import About from "./pages/About";
import ContactUs from "./pages/ContactUs";
import Profile from "./pages/Profile";

// Components
import SignUpForm from "./components/SignUpForm";
import LoginForm from "./components/LoginForm";
import NavBar from "./components/NavBar";
import NavInside from "./components/NavInside";
import ProtectedRoute from "./components/ProtectedRoute";
import ResetPassword from "./components/ResetPassword";
import Fix from "./fix/Fix";
// Games
import VolcanoWords from "./games/VolcanoWords";
import ReadingQuest from "./games/ReadingQuest";
import WordHuntGame from "./games/WordHunt";
import TombPuzzle from "./games/TombPuzzle";

// Layout component
function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect on initial load at root
    if (location.pathname !== "/") return;

    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const parts = token.split(".");
      const payload = JSON.parse(atob(parts[1]));

      // Check if expired
      if (payload.exp && payload.exp < Date.now() / 1000) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        return;
      }

      // Token valid — redirect based on role
      const role = payload.role || payload.roles || "";
      const roleStr = Array.isArray(role) ? role[0] : role;

      if (roleStr?.toLowerCase().includes("doctor")) {
        navigate("/dashboard", { replace: true });
      } else {
        // ── Pretest Gate (covers pre-existing accounts on refresh) ──────────
        const pretestDone = localStorage.getItem("pretest_completed_scores");
        const alreadyFlagged = localStorage.getItem("needsPretest") === "true";
        if (!pretestDone || alreadyFlagged) {
          localStorage.setItem("needsPretest", "true");
          navigate("/pretest", { replace: true });
        } else {
          navigate("/home", { replace: true });
        }
      }
    } catch {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
    }
  }, []);

  const hideAllNav =
    location.pathname.startsWith("/games") ||
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/reset-password") ||
    location.pathname.startsWith("/pretest");

  const pathsWithInsideNav = ["/home", "/profile"];
  const isInsideApp = pathsWithInsideNav.some((path) =>
    location.pathname.startsWith(path),
  );

  return (
    <>
      {hideAllNav ? null : isInsideApp ? <NavInside /> : <NavBar />}
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/auth" element={<Auth />}>
            <Route index element={<SignUpForm />} />
            <Route path="signup" element={<SignUpForm />} />
            <Route path="login" element={<LoginForm />} />
          </Route>
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/pretest"
            element={
              <ProtectedRoute requiredRole="student">
                <PreTestApp />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute requiredRole="student">
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute requiredRole="student">
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route path="/games">
            <Route
              path="volcano-words"
              element={
                <ProtectedRoute requiredRole="student">
                  <VolcanoWords />
                </ProtectedRoute>
              }
            />
            <Route
              path="reading-quest"
              element={
                <ProtectedRoute requiredRole="student">
                  <ReadingQuest />
                </ProtectedRoute>
              }
            />
            <Route
              path="word-hunt"
              element={
                <ProtectedRoute requiredRole="student">
                  <WordHuntGame />
                </ProtectedRoute>
              }
            />

            <Route
              path="tomb-puzzle"
              element={
                <ProtectedRoute requiredRole="student">
                  <TombPuzzle />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="doctor">
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/signup"
            element={<Navigate to="/auth/signup" replace />}
          />
          <Route
            path="/login"
            element={<Navigate to="/auth/login" replace />}
          />

          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
      </main>
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

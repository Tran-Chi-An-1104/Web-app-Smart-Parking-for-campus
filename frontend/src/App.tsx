import { Suspense, lazy, useState, useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";

const SIGNED_OUT_STORAGE_KEY = "smart-parking-signed-out";
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const LoginPage = lazy(() => import("./pages/LoginPage"));

type AppView = "admin" | "user";

function App() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSignedOut, setIsSignedOut] = useState(() => {
    return sessionStorage.getItem(SIGNED_OUT_STORAGE_KEY) === "true";
  });

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("user");
    if (user) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSignOut = () => {
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem(SIGNED_OUT_STORAGE_KEY, "true");
    setIsAuthenticated(false);
    setIsSignedOut(true);
    navigate("/login");
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    sessionStorage.removeItem(SIGNED_OUT_STORAGE_KEY);
    setIsSignedOut(false);
  };

  const handleResumeSession = () => {
    if (localStorage.getItem("user")) {
      setIsAuthenticated(true);
      setIsSignedOut(false);
      sessionStorage.removeItem(SIGNED_OUT_STORAGE_KEY);
      navigate("/admin");
    } else {
      navigate("/login");
    }
  };

  const handleViewChange = (view: AppView) => {
    navigate(`/${view}`);
  };

  return (
    <Suspense
      fallback={
        <main className="page-loading-shell">
          <div className="page-loading-card">Loading dashboard...</div>
        </main>
      }
    >
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/user" replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/user" : "/login"} replace />} />
        <Route
          path="/admin"
          element={
            !isAuthenticated ? (
              <Navigate to="/login" replace />
            ) : isSignedOut ? (
              <main className="signed-out-shell">
                <section className="signed-out-card">
                  <p className="signed-out-eyebrow">Session closed</p>
                  <h1>Signed out of Smart Parking Dashboard</h1>
                  <p>
                    Your local session data has been cleared. You can reopen the
                    admin dashboard or switch to the public parking map for
                    regular users.
                  </p>

                  <div className="signed-out-actions">
                    <button
                      className="signed-out-button"
                      type="button"
                      onClick={handleResumeSession}
                    >
                      Return to admin dashboard
                    </button>
                    <button
                      className="signed-out-button secondary"
                      type="button"
                      onClick={() => navigate("/user")}
                    >
                      Open user map
                    </button>
                  </div>
                </section>
              </main>
            ) : (
              <AdminDashboard
                onSignOut={handleSignOut}
                onViewChange={handleViewChange}
              />
            )
          }
        />
        <Route
          path="/user"
          element={
            !isAuthenticated ? (
              <Navigate to="/login" replace />
            ) : (
              <UserDashboard onViewChange={handleViewChange} />
            )
          }
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/user" : "/login"} replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;

import { Suspense, lazy, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";

const SIGNED_OUT_STORAGE_KEY = "smart-parking-signed-out";
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const LoginPage = lazy(() => import("./pages/LoginPage"));

type AppView = "admin" | "user";
type UserRole = "admin" | "user";

function App() {
  const navigate = useNavigate();
  const initialUserRole = (() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { role?: UserRole };
      return parsed?.role === "admin" ? "admin" : "user";
    } catch {
      return null;
    }
  })();

  const [isAuthenticated, setIsAuthenticated] = useState(!!initialUserRole);
  const [userRole, setUserRole] = useState<UserRole | null>(initialUserRole);
  const [isSignedOut, setIsSignedOut] = useState(() => {
    return sessionStorage.getItem(SIGNED_OUT_STORAGE_KEY) === "true";
  });

  const handleSignOut = () => {
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem(SIGNED_OUT_STORAGE_KEY, "true");
    setUserRole(null);
    setIsAuthenticated(false);
    setIsSignedOut(true);
    navigate("/login");
  };

  const handleLogin = (role: UserRole) => {
    setIsAuthenticated(true);
    setUserRole(role);
    sessionStorage.removeItem(SIGNED_OUT_STORAGE_KEY);
    setIsSignedOut(false);
  };

  const handleResumeSession = () => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user) as { role?: UserRole };
      const role = parsed?.role === "admin" ? "admin" : "user";
      setIsAuthenticated(true);
      setUserRole(role);
      setIsSignedOut(false);
      sessionStorage.removeItem(SIGNED_OUT_STORAGE_KEY);
      navigate(role === "admin" ? "/admin" : "/user");
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
              <Navigate to={userRole === "admin" ? "/admin" : "/user"} replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? (userRole === "admin" ? "/admin" : "/user") : "/login"} replace />} />
        <Route
          path="/admin"
          element={
            !isAuthenticated ? (
              <Navigate to="/login" replace />
            ) : userRole !== "admin" ? (
              <Navigate to="/user" replace />
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
                      Return to dashboard
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
              <UserDashboard onViewChange={handleViewChange} onSignOut={handleSignOut} />
            )
          }
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? (userRole === "admin" ? "/admin" : "/user") : "/login"} replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;

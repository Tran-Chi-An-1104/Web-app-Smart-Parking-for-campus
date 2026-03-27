import { useState } from "react";
import { useNavigate } from "react-router-dom";

type UserRole = "admin" | "user";

interface LoginPageProps {
  onLogin: (role: UserRole) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock SSO authentication
    setTimeout(() => {
      // Mock successful login - in real app, this would validate with backend
      localStorage.setItem("user", JSON.stringify({ username, role }));
      onLogin(role);
      navigate(role === "admin" ? "/admin" : "/user");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f3f9e8] to-[#ececec] flex items-center justify-center p-6">
      <div className="max-w-[480px] w-full bg-white/95 rounded-[20px] shadow-[0_20px_44px_rgba(15,23,42,0.12)] p-10 border border-white">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-[#6b8c2d] text-xs font-bold tracking-[0.12em] uppercase mb-3">
            Authentication
          </p>
          <div className="w-16 h-16 bg-[#81b92d] rounded-2xl mx-auto mb-5 flex items-center justify-center shadow-md">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <h1 className="text-[28px] font-bold text-[#253525] mb-2 leading-tight">
            HCMUT Parking
          </h1>
          <p className="text-[#556070] text-[15px]">
            Smart Parking Management System
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <label
              className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-colors ${role === "user"
                  ? "border-[#81b92d] bg-[#f3f9e8]/50"
                  : "border-gray-100 hover:border-gray-200 hover:bg-gray-50 bg-white"
                }`}
            >
              <input
                type="radio"
                name="role"
                value="user"
                checked={role === "user"}
                onChange={() => setRole("user")}
                className="h-4 w-4 text-[#81b92d] focus:ring-[#81b92d] border-gray-300"
              />
              <span className={`text-[15px] font-semibold ${role === "user" ? "text-[#3d5d0a]" : "text-gray-600"}`}>
                User Access
              </span>
            </label>
            <label
              className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-colors ${role === "admin"
                  ? "border-[#81b92d] bg-[#f3f9e8]/50"
                  : "border-gray-100 hover:border-gray-200 hover:bg-gray-50 bg-white"
                }`}
            >
              <input
                type="radio"
                name="role"
                value="admin"
                checked={role === "admin"}
                onChange={() => setRole("admin")}
                className="h-4 w-4 text-[#81b92d] focus:ring-[#81b92d] border-gray-300"
              />
              <span className={`text-[15px] font-semibold ${role === "admin" ? "text-[#3d5d0a]" : "text-gray-600"}`}>
                Admin Access
              </span>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-[14px] font-semibold text-[#425164] mb-2">
                HCMUT ID / Email
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#81b92d]/20 focus:border-[#81b92d] transition-all bg-gray-50/50 hover:bg-white text-gray-800 placeholder:text-gray-400 outline-none"
                placeholder="Enter your credential"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[14px] font-semibold text-[#425164] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#81b92d]/20 focus:border-[#81b92d] transition-all bg-gray-50/50 hover:bg-white text-gray-800 placeholder:text-gray-400 outline-none"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full bg-[#81b92d] text-white py-3.5 px-4 rounded-xl font-bold text-[15px] hover:bg-[#6ea125] focus:ring-4 focus:ring-[#81b92d]/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_14px_rgba(129,185,45,0.3)] hover:shadow-[0_6px_20px_rgba(129,185,45,0.4)]"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              "Sign In to Account"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-[13px] font-medium text-gray-400">
            For demo purposes, any credentials will work
          </p>
        </div>
      </div>
    </div>
  );
}
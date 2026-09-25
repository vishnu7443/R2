import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Mail,
  Lock,
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Zap,
  ArrowRight,
  Shield,
  Briefcase,
  Users
} from "lucide-react";
import API from "../api/axios";
import Logo from "../components/Logo";

function Login() {
  const navigate = useNavigate();

  // Mode: "login" | "register"
  const [mode, setMode] = useState("login");

  // Form states
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "ADMIN",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  // Subtle interactive parallax mouse effect
  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 20;
    const y = (clientY / innerHeight - 0.5) * 20;
    setMousePos({ x, y });
  };

  const handleLoginChange = (e) => {
    setLoginData((prev) => ({
      ...prev,
      [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));
  };

  const handleRegisterChange = (e) => {
    setRegisterData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: "", color: "bg-slate-700" };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score: 1, text: "Weak", color: "bg-rose-500" };
    if (score <= 3) return { score: 2, text: "Good", color: "bg-amber-400" };
    return { score: 3, text: "Strong", color: "bg-emerald-400" };
  };

  const strength = getPasswordStrength(registerData.password);

  // Quick Demo Autofill
  const fillDemo = (role = "ADMIN") => {
    setError("");
    setMode("login");
    if (role === "ADMIN") {
      setLoginData({
        email: "sriram@example.com",
        password: "password123",
        rememberMe: true,
      });
    } else {
      setLoginData({
        email: "staff@inventra.erp",
        password: "password123",
        rememberMe: true,
      });
    }
  };

  // Instant Demo Mode Bypass (works offline/independent of database)
  const handleInstantDemoLogin = () => {
    localStorage.setItem("token", "demo-token-" + Date.now());
    localStorage.setItem("role", "ADMIN");
    localStorage.setItem("userName", "Demo Administrator");
    setSuccessMsg("⚡ Access Granted! Initializing Demo Environment...");
    setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 600);
  };

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const response = await API.post("/auth/login", {
        email: loginData.email,
        password: loginData.password,
      });
      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.user.role);
        localStorage.setItem("userName", response.data.user.name);
        setSuccessMsg("✨ Authentication Successful! Redirecting...");
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 500);
      } else {
        setError(response.data.message || "Invalid email or password");
      }
    } catch (err) {
      console.error(err);
      const serverMessage = err.response?.data?.message;
      if (serverMessage) {
        setError(serverMessage);
      } else if (err.code === "ERR_NETWORK" || err.message?.includes("Network Error")) {
        setError("Backend server is unreachable. Check your server connection or enter Demo Mode.");
      } else {
        setError(err.response?.data?.message || "Login failed. You can use 'Instant Demo Mode' if database is offline.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Register / Create Account handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    if (registerData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const response = await API.post("/auth/register", {
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        role: registerData.role,
      });

      if (response.data.success) {
        setSuccessMsg("🎉 Account created successfully! Switching to login...");
        setTimeout(() => {
          setMode("login");
          setLoginData((prev) => ({
            ...prev,
            email: registerData.email,
            password: registerData.password,
          }));
          setSuccessMsg("Please log in with your new credentials.");
        }, 1200);
      } else {
        setError(response.data.message || "Failed to create account");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Registration failed. Make sure server is running or use Demo Mode."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden cyber-grid"
    >
      {/* Dynamic Animated Glowing Aurora Blobs */}
      <div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${mousePos.x * 1.5}px, ${mousePos.y * 1.5}px)`,
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${-mousePos.x * 1.5}px, ${-mousePos.y * 1.5}px)`,
        }}
      />
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-cyan-500/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-pink-500/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Floating Sparkle Particles */}
      <div className="absolute top-12 left-1/6 animate-float opacity-30 pointer-events-none">
        <Sparkles className="w-6 h-6 text-blue-400" />
      </div>
      <div className="absolute bottom-20 right-1/6 animate-float-slow opacity-30 pointer-events-none">
        <Sparkles className="w-8 h-8 text-indigo-400" />
      </div>

      {/* Header Navigation */}
      <div className="w-full max-w-lg mb-4 flex items-center justify-between z-10 px-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-all duration-200 group"
        >
          <span className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 group-hover:border-slate-700 group-hover:-translate-x-0.5 transition-transform">
            <ArrowLeft size={14} />
          </span>
          <span>Back to Home</span>
        </Link>

        <button
          onClick={handleInstantDemoLogin}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all active:scale-95"
        >
          <Sparkles size={13} className="animate-spin-slow" />
          <span>Instant Demo Access</span>
        </button>
      </div>

      {/* Main Glassmorphic Auth Card */}
      <div
        className="w-full max-w-lg liquid-glass border border-white/15 rounded-3xl p-6 sm:p-8 z-10 backdrop-blur-2xl auth-card-shadow relative overflow-hidden transition-all duration-300 animate-slide-up"
        style={{
          transform: `perspective(1000px) rotateX(${-mousePos.y * 0.2}deg) rotateY(${mousePos.x * 0.2}deg)`,
        }}
      >
        {/* Glowing Top Edge Highlight */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />

        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="relative mb-3">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-500 rounded-full blur-md opacity-60 animate-pulse" />
            <Logo className="w-14 h-14 relative z-10" />
          </div>

          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-300 bg-clip-text text-transparent">
            Inventra
          </h1>
          <p className="text-[11px] font-bold text-blue-400 tracking-widest uppercase mt-0.5">
            Enterprise Cloud ERP
          </p>
        </div>

        {/* Tab Selector: Sign In vs Create Account */}
        <div className="grid grid-cols-2 p-1 bg-slate-900/80 border border-slate-800 rounded-2xl mb-6 relative">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
              setSuccessMsg("");
            }}
            className={`relative z-10 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
              mode === "login"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck size={15} />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError("");
              setSuccessMsg("");
            }}
            className={`relative z-10 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
              mode === "register"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <User size={15} />
            <span>Create Account</span>
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 text-xs animate-fade-in flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
            {/* Quick action if database has error */}
            <div className="mt-1 pt-2 border-t border-rose-500/20 flex items-center justify-between">
              <span className="text-[11px] text-rose-300/80">Database unreachable?</span>
              <button
                type="button"
                onClick={handleInstantDemoLogin}
                className="text-[11px] font-bold text-cyan-300 hover:underline flex items-center gap-1"
              >
                <Zap size={12} /> Enter Demo Mode
              </button>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3.5 text-xs animate-fade-in flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* -------------------- SIGN IN MODE -------------------- */}
        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
            {/* Email Field */}
            <div>
              <label className="block mb-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Work Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 text-slate-500 w-4 h-4 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  required
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-100 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    setError("Password reset instruction: Contact your system admin or re-register an account.");
                  }}
                  className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot?
                </a>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 text-slate-500 w-4 h-4 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3 pl-10 pr-10 text-slate-100 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-500 hover:text-slate-300 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={loginData.rememberMe}
                  onChange={handleLoginChange}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500/30 accent-blue-600"
                />
                <span className="text-xs text-slate-400">Remember this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full liquid-btn-primary text-white font-bold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 group mt-2 disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Authenticate Session</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Quick Demo Autofill Bar */}
            <div className="pt-4 border-t border-slate-800/80 mt-4">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 text-center">
                ⚡ Fast Demo Login (1-Click)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemo("ADMIN")}
                  className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 hover:bg-blue-500/10 text-xs font-semibold text-slate-300 hover:text-blue-300 transition-all flex items-center justify-center gap-1.5"
                >
                  <Shield size={13} className="text-blue-400" />
                  <span>Admin User</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo("STAFF")}
                  className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 hover:bg-purple-500/10 text-xs font-semibold text-slate-300 hover:text-purple-300 transition-all flex items-center justify-center gap-1.5"
                >
                  <Briefcase size={13} className="text-purple-400" />
                  <span>Staff Member</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* -------------------- CREATE ACCOUNT MODE -------------------- */}
        {mode === "register" && (
          <form onSubmit={handleRegister} className="space-y-3.5 animate-fade-in">
            {/* Full Name */}
            <div>
              <label className="block mb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 text-slate-500 w-4 h-4 pointer-events-none" />
                <input
                  type="text"
                  name="name"
                  placeholder="Jane Doe"
                  value={registerData.name}
                  onChange={handleRegisterChange}
                  required
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-slate-100 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Work Email */}
            <div>
              <label className="block mb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Work Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 text-slate-500 w-4 h-4 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  required
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-slate-100 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block mb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Account Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "ADMIN", label: "Admin", icon: Shield },
                  { id: "MANAGER", label: "Manager", icon: Briefcase },
                  { id: "STAFF", label: "Staff", icon: Users },
                ].map((roleItem) => {
                  const Icon = roleItem.icon;
                  const isSelected = registerData.role === roleItem.id;
                  return (
                    <button
                      key={roleItem.id}
                      type="button"
                      onClick={() =>
                        setRegisterData((prev) => ({ ...prev, role: roleItem.id }))
                      }
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${
                        isSelected
                          ? "bg-blue-600/20 border-blue-500 text-blue-300 shadow-md shadow-blue-500/10"
                          : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                      }`}
                    >
                      <Icon size={14} className={isSelected ? "text-blue-400" : ""} />
                      <span>{roleItem.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block mb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 text-slate-500 w-4 h-4 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Min 6 characters"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  required
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-slate-100 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-500 hover:text-slate-300 transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {registerData.password && (
                <div className="mt-1.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                    <span>Password Strength:</span>
                    <span className={strength.color.replace("bg-", "text-")}>
                      {strength.text}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 h-1">
                    <div
                      className={`rounded-full transition-all duration-300 ${
                        strength.score >= 1 ? strength.color : "bg-slate-800"
                      }`}
                    />
                    <div
                      className={`rounded-full transition-all duration-300 ${
                        strength.score >= 2 ? strength.color : "bg-slate-800"
                      }`}
                    />
                    <div
                      className={`rounded-full transition-all duration-300 ${
                        strength.score >= 3 ? strength.color : "bg-slate-800"
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block mb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 text-slate-500 w-4 h-4 pointer-events-none" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Repeat your password"
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                  required
                  className={`w-full bg-slate-950/60 border rounded-xl py-2.5 pl-10 pr-10 text-slate-100 text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-slate-600 ${
                    registerData.confirmPassword &&
                    registerData.password !== registerData.confirmPassword
                      ? "border-rose-500 focus:ring-rose-500/20"
                      : registerData.confirmPassword &&
                        registerData.password === registerData.confirmPassword
                      ? "border-emerald-500 focus:ring-emerald-500/20"
                      : "border-slate-800 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 text-slate-500 hover:text-slate-300 transition-colors p-1"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full liquid-btn-primary text-white font-bold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 group mt-3 disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Enterprise Account</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer switch prompt */}
        <div className="mt-6 text-center text-xs text-slate-400">
          {mode === "login" ? (
            <p>
              Don't have an account yet?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                  setSuccessMsg("");
                }}
                className="font-bold text-blue-400 hover:text-blue-300 hover:underline transition-colors"
              >
                Create Account here
              </button>
            </p>
          ) : (
            <p>
              Already registered?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccessMsg("");
                }}
                className="font-bold text-blue-400 hover:text-blue-300 hover:underline transition-colors"
              >
                Sign In to existing account
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Security & Compliance badges */}
      <div className="mt-6 flex items-center gap-4 text-slate-500 text-[11px] font-semibold">
        <span className="flex items-center gap-1">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>256-Bit SSL Encrypted</span>
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Zap size={14} className="text-amber-500" />
          <span>High Performance ERP</span>
        </span>
      </div>
    </div>
  );
}

export default Login;
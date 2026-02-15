import { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode"; 
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, X } from 'lucide-react'; // Added X for closing modal

export default function CodezyLogin() {
  const navigate = useNavigate();
  
  // Existing states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  // --- NEW 2FA & RESET STATES ---
  const [showMfaInput, setShowMfaInput] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [tempUserId, setTempUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;
        if (decoded.exp > now) {
          const role = localStorage.getItem('role');
          handleRedirectAfterLogin(role);
        } else {
          localStorage.clear();
        }
      } catch {
        localStorage.clear();
      }
    }
  }, []);

  const handleRedirectAfterLogin = (role) => {
    const redirectPath = localStorage.getItem("redirectAfterLogin");
    if (redirectPath && redirectPath !== "/") {
      localStorage.removeItem("redirectAfterLogin");
      navigate(redirectPath);
      return;
    }
    switch (role) {
      case 'teacher': navigate('/teacher'); break;
      case 'individual_learner': navigate('/learner-dashboard'); break;
      case 'institution_admin': navigate('/admin'); break;
      case 'student': navigate('/student'); break;
      default: navigate('/');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!resetEmail) {
      alert("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: resetEmail }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to send reset email");
        return;
      }

      alert("Password reset link has been sent to your email");
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (err) {
      alert("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 1: INITIAL LOGIN ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      alert('Please fill both email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        // ... (Same as your original code)
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Login failed');
        return;
      }

      if (data.mfaRequired) {
        setTempUserId(data.userId);
        setShowMfaInput(true);
      } else {
        console.log("Login response:", data); 
        completeLogin(data);
      }
    } catch (err) {
      console.error(err);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: VERIFY 2FA ---
  const handleVerifyMFA = async (e) => {
    e.preventDefault();
    if (mfaCode.length !== 6) return alert("Enter 6-digit code");

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: tempUserId, token: mfaCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Invalid 2FA code');
        return;
      }

      completeLogin(data);
    } catch (err) {
      alert("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const completeLogin = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('role', data.role);
    localStorage.setItem('email', data.email || '');
    localStorage.setItem('fullName', data.fullName || '');
    
    if (data.subscriptionRequired) {
      const pendingTenantId = localStorage.getItem("pendingTenantId");
      if (pendingTenantId) {
        navigate("/cart");
        return;
      }
    }
    handleRedirectAfterLogin(data.role);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* --- FORGOT PASSWORD MODAL --- */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
              <button onClick={() => setShowForgotPassword(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-600 mb-6">Enter your email and we'll send you a link to reset your password.</p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                  placeholder="name@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-5xl">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <div className="flex flex-col md:flex-row">
            
            {/* Left Gif Section */}
            <div className="md:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700 p-12 flex items-center justify-center relative overflow-hidden">
              <img
                src="/src/assets/login.gif"
                alt="Welcome"
                className="w-full max-w-md mx-auto rounded-2xl shadow-2xl"
              />
            </div>

            {/* Right Form Section */}
            <div className="md:w-1/2 p-12 relative">
              <div className="max-w-md mx-auto">
                
                {!showMfaInput ? (
                  <>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
                    <p className="text-gray-600 mb-8">Please enter your credentials</p>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                          placeholder="Enter your email"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                          placeholder="Enter your password"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="flex items-center cursor-pointer">
                          <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                          <span className="ml-2 text-sm text-gray-600">Remember me</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700">
                        {loading ? "Logging in..." : "Login"}
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="animate-in fade-in slide-in-from-right duration-500">
                    <button 
                      onClick={() => setShowMfaInput(false)} 
                      className="flex items-center text-sm text-indigo-600 hover:text-indigo-700 mb-6 font-medium"
                    >
                      <ArrowLeft size={16} className="mr-1" /> Back to Password
                    </button>
                    
                    <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                      <Shield className="text-indigo-600" size={32} />
                    </div>
                    
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Verify Account</h1>
                    <p className="text-gray-600 mb-8">Enter the 6-digit code from your authenticator app</p>

                    <form className="space-y-6" onSubmit={handleVerifyMFA}>
                      <input
                        type="text"
                        maxLength="6"
                        placeholder="000000"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full text-center text-3xl tracking-[0.5em] font-mono py-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 outline-none"
                      />
                      <button 
                        type="submit" 
                        disabled={loading || mfaCode.length < 6} 
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold disabled:opacity-50"
                      >
                        {loading ? "Verifying..." : "Verify & Login"}
                      </button>
                    </form>
                  </div>
                )}

                <p className="mt-8 text-center text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      const planType = localStorage.getItem("selectedPlanType");
                      if (planType === "institution") {
                        navigate("/institution/register");
                      } else {
                        navigate("/register");
                      }
                    }}
                    className="text-indigo-600 hover:text-indigo-700 font-semibold"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
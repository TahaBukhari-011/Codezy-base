import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CodezyRegister() {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { fullName, username, email, password, confirmPassword } = formData;

    // Basic Validation
    if (!fullName || !username || !email || !password) {
      alert("Please fill all required fields");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      // 1. REGISTER (Role is now hardcoded or handled by backend default)
      const registerRes = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, username, email, password }), 
      });

      const registerData = await registerRes.json();
      if (!registerRes.ok) {
        alert(registerData.message || "Registration failed");
        return;
      }

      // 2. AUTO-LOGIN
      const loginRes = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json();
      if (!loginRes.ok) {
        alert(loginData.message || "Login failed after registration");
        return;
      }

      // 3. SAVE AUTH DATA
      localStorage.setItem("token", loginData.token);
      localStorage.setItem("userId", loginData.userId);
      localStorage.setItem("role", loginData.role);
      localStorage.setItem("email", loginData.email || "");

      // 4. REDIRECT
      const redirectAfterLogin = sessionStorage.getItem("redirectAfterLogin");
      if (redirectAfterLogin) {
        sessionStorage.removeItem("redirectAfterLogin");
        navigate(redirectAfterLogin, { replace: true });
      } else {
        // Fallback to the main learner dashboard
        navigate("/learner", { replace: true });
      }

    } catch (err) {
      console.error("REGISTRATION/LOGIN ERROR:", err);
      alert("Error during registration or login.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden">
      
      <div className="relative z-10 w-full max-w-5xl animate-slide-up">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <div className="flex flex-col md:flex-row">
            {/* Left Image Section */}
            <div className="md:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700 p-12 flex items-center justify-center">
              <img src="/src/assets/login.gif" alt="Register" className="w-full max-w-md mx-auto rounded-2xl shadow-2xl" />
            </div>

            {/* Right Form Section */}
            <div className="md:w-1/2 p-12 relative">
              <div className="max-w-md mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
                <p className="text-gray-600 mb-8">Join Codezy and start your learning journey!</p>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  />
                  <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Username"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  />
                  <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  />
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm Password"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  />

                  <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg mt-4">
                    Register
                  </button>

                  <p className="text-center text-sm text-gray-600 mt-4">
                    Already have an account?{" "}
                    <button type="button" onClick={() => navigate("/login")} className="text-indigo-600 hover:text-indigo-800 font-semibold">
                      Login
                    </button>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
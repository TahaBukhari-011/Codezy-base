import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Building2, Mail, Lock, User, Globe, Phone, Users, ArrowRight } from "lucide-react";

// Simplified list for the example - you can import a full list from a library like 'world-countries'
const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon",
  "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guyana", "Haiti", "Honduras",
  "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon",
  "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives",
  "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia",
  "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua",
  "Niger", "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay",
  "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
  "Samoa", "San Marino", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
  "Solomon Islands", "Somalia", "South Africa", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey",
  "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu",
  "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const InstitutionRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    institutionName: "",
    country: "",
    studentRange: "",
    adminName: "",
    adminEmail: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/institution/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.institutionName,
          adminEmail: form.adminEmail,
          password: form.password,
          contactPhone: form.contactNumber,
          metadata: { country: form.country, studentRange: form.studentRange },
          plan: null // user chooses on subscription page
        })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      // Save tenantId for subscription step
      localStorage.setItem("pendingTenantId", data.tenantId);

      // Redirect to subscription/payment page
      navigate("/subscription", { state: { planType: "institution" } });

    } catch (err) {
      console.error("Error registering institution:", err);
      alert("Failed to register institution. Try again.");
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-6xl"
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <div className="flex flex-col md:flex-row">
            
            {/* Left Section */}
            <div className="md:w-5/12 bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-900 p-12 flex flex-col items-center justify-center text-white">
              <img src="/src/assets/login.gif" alt="Register" className="w-full max-w-sm mx-auto rounded-2xl shadow-2xl mb-8" />
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Codezy for Institutions</h2>
                <p className="text-indigo-100 opacity-80">Centralize your labs, courses, and student tracking.</p>
              </div>
            </div>

            {/* Right Section */}
            <div className="md:w-7/12 p-8 md:p-12">
              <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Register Institution</h1>
                <p className="text-gray-600 mb-8">Fill in the details to get started</p>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* --- SECTION: Institution Details --- */}
                  <div className="md:col-span-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Institution Details</div>
                  
                  <Input icon={Building2} name="institutionName" placeholder="Institution Name" value={form.institutionName} onChange={handleChange} />
                  
                  <Select icon={Globe} name="country" value={form.country} onChange={handleChange} placeholder="Select Country">
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>

                  <Select icon={Users} name="studentRange" value={form.studentRange} onChange={handleChange} placeholder="Est. Students">
                    <option value="0-500">0 - 500 Students</option>
                    <option value="501-2000">501 - 2,000 Students</option>
                    <option value="2001-5000">2,001 - 5,000 Students</option>
                    <option value="5000+">5,000+ Students</option>
                  </Select>

                  <Input icon={Phone} name="contactNumber" type="tel" placeholder="Contact Number" value={form.contactNumber} onChange={handleChange} />

                  {/* --- SECTION: Admin Details --- */}
                  <div className="md:col-span-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mt-2 mb-1">Admin Information</div>
                  
                  <Input icon={User} name="adminName" placeholder="Admin Full Name" value={form.adminName} onChange={handleChange} />
                  <Input icon={Mail} name="adminEmail" type="email" placeholder="Admin Email" value={form.adminEmail} onChange={handleChange} />

                  {/* --- SECTION: Security --- */}
                  <div className="md:col-span-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mt-2 mb-1">Security</div>
                  
                  <Input icon={Lock} name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />
                  <Input icon={Lock} name="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} />

                  <div className="md:col-span-2 mt-4">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-indigo-500/30 transition-all duration-300"
                    >
                      Complete Registration
                      <ArrowRight size={18} />
                    </motion.button>

                    <p className="text-center text-sm text-gray-500 mt-6">
                      Already have an institution?{" "}
                      <button type="button" onClick={() => navigate("/login")} className="text-indigo-600 font-semibold hover:underline">
                        Login
                      </button>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Reusable Input Component
const Input = ({ icon: Icon, ...props }) => (
  <div className="relative group">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors z-10">
      <Icon size={18} />
    </div>
    <input
      {...props}
      required
      className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-200 text-gray-700"
    />
  </div>
);

// Reusable Select Component
const Select = ({ icon: Icon, placeholder, children, ...props }) => (
  <div className="relative group">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors z-10">
      <Icon size={18} />
    </div>
    <select
      {...props}
      required
      className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-200 text-gray-700 appearance-none"
    >
      <option value="" disabled>{placeholder}</option>
      {children}
    </select>
    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
    </div>
  </div>
);
export default InstitutionRegister;
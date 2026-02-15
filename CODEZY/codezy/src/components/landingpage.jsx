import React, { useEffect, useState } from 'react';
import { 
  ArrowRight, 
  Check, 
  GraduationCap, 
  Users,
  Trophy,
  Award,
  Cpu,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ---------------------- HERO ILLUSTRATION ----------------------
const HeroIllustration = () => (
  <div className="relative w-full h-80 lg:h-full bg-gradient-to-br from-indigo-100/50 to-purple-100/50 rounded-3xl overflow-hidden shadow-2xl">
    <img 
      src="../assets/landingpage.png" 
      alt="Students collaborating on coding projects" 
      className="w-full h-full object-cover p-4 rounded-3xl" 
    />
    <div className="absolute top-5 right-5 bg-white p-2 rounded-xl shadow-lg flex items-center space-x-2" />
  </div>
);

// ---------------------- MOTION VARIANTS ----------------------
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

// ---------------------- FEATURE LIST ----------------------
const FeatureList = ({ items }) => (
  <ul className="space-y-4">
    {items.map((item, index) => (
      <motion.li
        key={index}
        className="flex items-start space-x-3 text-gray-600"
        variants={itemVariants}
      >
        <Check size={20} className="text-green-500 mt-1 flex-shrink-0" />
        <span className="font-medium">{item}</span>
      </motion.li>
    ))}
  </ul>
);

// ---------------------- PLAN CARD COMPONENT ----------------------
const PlanCard = ({ currentPlan, plan, icon, features, price, onClick }) => (
  <motion.div
    className={`bg-white p-8 rounded-3xl shadow-xl border-t-8 hover:shadow-2xl transition-all duration-300 relative ${
      currentPlan === plan
        ? "border-green-500"
        : plan === "Individual"
        ? "border-indigo-600/50"
        : "border-purple-600"
    }`}
    whileHover={{ y: -5 }}
    variants={itemVariants}
  >
    {currentPlan === plan && (
      <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-pulse">
        Current Plan
      </span>
    )}
    {plan === "Institutional" && (
      <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
        Most Popular
      </span>
    )}
    <div className="flex items-center justify-center mb-6">{icon}</div>
    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan} Subscription</h3>
    <p className="text-gray-500 mb-8">
      {plan === "Individual" ? "Perfect for self-learners" : "For schools and organizations"}
    </p>
    <div className="mb-10">
      <FeatureList items={features} />
    </div>
    <p className="text-4xl font-extrabold text-gray-900 mb-6">
      Starting From <span className={plan === "Individual" ? "text-indigo-600 ml-2" : "text-purple-600 ml-2"}>{price}</span>
      <span className="text-base font-medium text-gray-500">/month</span>
    </p>
    <motion.button
      onClick={onClick}
      disabled={currentPlan === plan}
      className={`w-full py-4 rounded-xl font-semibold text-lg shadow-lg ${
        currentPlan === plan
          ? "bg-gray-300 cursor-not-allowed"
          : plan === "Individual"
          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-xl"
          : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl"
      }`}
    >
      {currentPlan === plan ? "Your Current Plan" : "Continue"}
    </motion.button>
  </motion.div>
);

// ---------------------- FEATURE ICON COMPONENT ----------------------
const FeatureIcon = ({ icon, title, desc }) => (
  <motion.div className="space-y-4 p-6 rounded-2xl border border-gray-100 hover:shadow-lg" variants={itemVariants}>
    <div className="w-16 h-16 mx-auto bg-indigo-100 rounded-full flex items-center justify-center">{icon}</div>
    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
    <p className="text-gray-600">{desc}</p>
  </motion.div>
);

// ---------------------- MAIN LANDING PAGE ----------------------
export default function LandingPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);

  const individualFeatures = [
    "Self-paced interactive courses",
    "AI-powered code feedback & hints",
    "Achievement badges & certificates",
    "Progress tracking & analytics",
    "24/7 community support"
  ];

  const institutionalFeatures = [
    "Advanced teacher dashboard",
    "Real-time lab management",
    "Student progress analytics",
    "Collaborative coding environments",
    "Custom curriculum builder"
  ];

  // ---------------------- AUTO REDIRECT IF LOGGED IN ----------------------
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');

    if (token && role) {
      switch (role) {
        case 'teacher':
          navigate('/teacher');
          return;
        case 'student':
          navigate('/student');
          return;
        case 'organization':
          navigate('/admin');
          return;
        case 'individual_learner':
          navigate('/learner');
          return;
        default:
          break;
      }
    }

    if (token && userId) {
      setUser({ token, role, userId });
      axios
        .get(`http://localhost:5000/api/subscription/${userId}`)
        .then((res) => setCurrentPlan(res.data.planName))
        .catch(() => setCurrentPlan(null)); // safe fallback if no subscription
    }
  }, [navigate]);

  // ---------------------- NAVIGATION HANDLERS ----------------------
  const goToSubscription = (plan) => {
    const normalizedPlanType = plan === "Institutional" ? "organization" : "individual_learner";
    localStorage.setItem("selectedPlanType", normalizedPlanType);
    localStorage.setItem("redirectAfterLogin", "/subscription");
    navigate('/subscription', { state: { planType: normalizedPlanType } });
  };

  const goToLogin = () => {
    localStorage.setItem("redirectAfterLogin", "/");
    navigate('/login');
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setCurrentPlan(null);
    navigate('/');
  };

  // ---------------------- RENDER ----------------------
  return (
    <motion.div 
      className="min-h-screen bg-white font-sans overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >

      {/* NAVBAR */}
      <motion.nav className="sticky top-0 bg-white/90 backdrop-blur-sm shadow-md z-50" variants={itemVariants}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-indigo-600">&lt;/&gt;</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Codezy</span>
          </div>
          <div className="flex items-center space-x-4">
            {!user ? (
              <>
                <motion.button
                  onClick={goToLogin}
                  className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign In
                </motion.button>

                <motion.button
                  onClick={goToLogin}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2 rounded-full font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </motion.button>
              </>
            ) : (
              <>
                <motion.button className="text-gray-700 font-semibold hover:text-gray-900 transition-colors">
                  Profile
                </motion.button>
                <motion.button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2 rounded-full font-semibold shadow-lg"
                >
                  Log Out
                </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.nav>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <motion.h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight" variants={itemVariants}>
              Empowering the Next <br />
              Generation of 
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 ml-3">
                Coders
              </span>
            </motion.h1>
            <motion.p className="text-lg text-gray-600 max-w-lg" variants={itemVariants}>
              An intelligent platform for learning, teaching, and managing coding labs with AI assistance.
            </motion.p>
            <motion.div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 pt-4" variants={itemVariants}>
              <motion.button
                onClick={goToLogin}
                className="flex items-center space-x-3 bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-xl"
              >
                <span>Start Learning</span>
                <ArrowRight size={20} />
              </motion.button>
              <motion.button className="flex items-center justify-center space-x-3 text-indigo-600 border-2 border-indigo-200 px-8 py-3 rounded-full font-semibold text-lg">
                <span>Watch Demo</span>
              </motion.button>
            </motion.div>
            <motion.div className="flex space-x-8 pt-4" variants={itemVariants}>
              <div className="flex items-center space-x-2">
                <Users size={24} className="text-purple-600" />
                <span className="text-xl font-bold text-gray-900">50K+</span>
                <span className="text-gray-500 text-sm">Active Students</span>
              </div>
              <div className="flex items-center space-x-2">
                <GraduationCap size={24} className="text-pink-600" />
                <span className="text-xl font-bold text-gray-900">1K+</span>
                <span className="text-gray-500 text-sm">Educators</span>
              </div>
            </motion.div>
          </div>
          <motion.div variants={itemVariants} className="relative hidden lg:block">
            <HeroIllustration />
          </motion.div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 className="text-4xl font-extrabold text-gray-900 mb-4" variants={itemVariants}>
            Choose Your Learning Path
          </motion.h2>
          <motion.p className="text-lg text-gray-600 mb-16 max-w-3xl mx-auto" variants={itemVariants}>
            Whether you're an individual learner or an institution, we have the perfect plan.
          </motion.p>
          <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-8" variants={containerVariants}>
            <PlanCard
              currentPlan={currentPlan}
              plan="Individual"
              icon={<Trophy size={48} className="text-indigo-600" />}
              features={individualFeatures}
              price="$19"
              onClick={() => goToSubscription("Individual")}
            />
            <PlanCard
              currentPlan={currentPlan}
              plan="Institutional"
              icon={<Award size={48} className="text-purple-600" />}
              features={institutionalFeatures}
              price="$199"
              onClick={() => goToSubscription("Institutional")}
            />
          </motion.div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <motion.h2 className="text-4xl font-extrabold text-gray-900 mb-4" variants={itemVariants}>
          Powered by Cutting-Edge Technology
        </motion.h2>
        <motion.p className="text-lg text-gray-600 mb-16 max-w-4xl mx-auto" variants={itemVariants}>
          Experience the future of coding education.
        </motion.p>
        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-10" variants={containerVariants}>
          <FeatureIcon icon={<Cpu size={32} className="text-indigo-600" />} title="AI Assistant" desc="Get code suggestions and personalized learning guidance." />
          <FeatureIcon icon={<Users size={32} className="text-pink-600" />} title="Real-time Collaboration" desc="Learn together with instant instructor feedback." />
          <FeatureIcon icon={<BarChart3 size={32} className="text-green-600" />} title="Advanced Analytics" desc="Track and measure learning progress." />
        </motion.div>
      </section>

    </motion.div>
  );
}

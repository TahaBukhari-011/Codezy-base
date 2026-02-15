import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CheckIcon,
  CodeBracketIcon,
  UsersIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CpuChipIcon
} from "@heroicons/react/24/outline";
import { plansData } from "../utils/plans";
import SubscriptionImage from "../assets/subscription.png";

// ---------------------- COMPONENTS ----------------------
const CodezyLogo = () => (
  <div className="flex items-center text-white text-lg font-semibold">
    <CodeBracketIcon className="w-6 h-6 mr-2" />
    <span>Codezy</span>
  </div>
);

const CheckListItem = ({ children }) => (
  <li className="flex items-start">
    <CheckIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
    <span className="text-gray-700">{children}</span>
  </li>
);

const FeatureBox = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center text-center p-4">
    <div className="p-4 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-white mb-4">
      <Icon className="w-8 h-8" />
    </div>
    <h3 className="font-semibold mb-2">{title}</h3>
    <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
  </div>
);

// ---------------------- MAIN PAGE ----------------------
export default function SubscriptionPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // ----------------------
  // STATE
  // ----------------------
  const [expectedCourses, setExpectedCourses] = useState(1);
  const [labsPerCourse, setLabsPerCourse] = useState(1);
  const [studentsPerCourse, setStudentsPerCourse] = useState(30);
  const [customQuote, setCustomQuote] = useState(199);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  // ----------------------
  // MAP PLAN TYPE
  // ----------------------
  const mapPlanType = (type) => {
    if (!type) return "individual";
    type = type.toLowerCase();
    if (type === "institutional" || type === "organization") return "institution";
    if (type === "individual" || type === "individual_learner") return "individual";
    return "individual"; // fallback
  };

  const planType = mapPlanType(
    location.state?.planType || localStorage.getItem("selectedPlanType")
  );

  const filteredPlans = plansData.filter(plan => plan.type === planType);

  // ----------------------
  // FETCH CURRENT USER PLAN
  // ----------------------
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/subscription/user/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setCurrentPlan(data.planName);

          const localPlan = localStorage.getItem("currentPlan");
          if (localPlan) setCurrentPlan(localPlan);
        } else if (res.status === 404) {
          console.log("No active subscription found.");
        } else {
          console.error("Error fetching subscription");
        }
      } catch (err) {
        console.error("Error fetching subscription:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  // ----------------------
  // CUSTOM QUOTE
  // ----------------------
  const calculateQuote = (courses, labs, students) => {
    const baseRate = 99;
    const courseFactor = 10;
    const labFactor = 5;
    const studentFactor = 0.5;
    return Math.round(
      baseRate + courses * courseFactor + courses * labs * labFactor + courses * students * studentFactor
    );
  };

  const updateQuote = useCallback(() => {
    setCustomQuote(calculateQuote(expectedCourses, labsPerCourse, studentsPerCourse));
  }, [expectedCourses, labsPerCourse, studentsPerCourse]);

  useEffect(() => updateQuote(), [updateQuote]);

  // ----------------------
  // HANDLE PLAN SELECTION
  // ----------------------
  const handleSelectPlan = async (planName, customPrice = null) => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    localStorage.setItem("selectedPlanType", planType);
    sessionStorage.setItem("selectedPlan", JSON.stringify({
      name: planName,
      customPrice: customPrice || plansData.find(p => p.name === planName)?.price,
      planType,
    }));

    if (!userId) {
      localStorage.setItem("redirectAfterLogin", "/subscription");
      navigate("/login");
      return;
    }

    try {
      const tenantRes = await fetch(`http://localhost:5000/api/auth/get-tenant/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (tenantRes.status === 404) {
        localStorage.setItem("redirectAfterLogin", "/subscription");
        navigate("/institution/register");
        return;
      }

      const tenantData = await tenantRes.json();
      localStorage.setItem("pendingTenantId", tenantData.tenantId);

      navigate("/cart");
    } catch (err) {
      console.error("Error selecting plan:", err);
      alert("Error processing subscription. Try again.");
    }
  };

  // ----------------------
  // FEATURES
  // ----------------------
  const featureIcons = [
    { icon: UsersIcon, title: "Multi-Role Dashboards", description: "Dedicated interfaces for admins, teachers, and students." },
    { icon: CpuChipIcon, title: "Lab & Class Management", description: "Organize coding labs, track progress, manage classroom activities." },
    { icon: ShieldCheckIcon, title: "XP-Based Competitions", description: "Gamify learning with XP, leaderboards, and challenges." },
    { icon: ChartBarIcon, title: "Analytics & Scaling", description: "Advanced analytics tools with flexible scaling options." },
  ];

  if (loading) return <div className="text-center py-20">Loading...</div>;

  // ----------------------
  // RENDER
  // ----------------------
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* HEADER */}
      <header className="h-[500px] bg-gradient-to-r from-indigo-600 to-pink-500 text-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 h-full flex flex-col pt-8 pb-12">
          <div className="mb-8"><CodezyLogo /></div>
          <div className="flex flex-col items-center justify-center flex-grow text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Empower Your Institution with Codezy</h1>
            <p className="max-w-3xl mx-auto mt-2 text-md opacity-90 leading-relaxed">
              A collaborative coding platform built for schools, colleges, and universities.
            </p>
            <div className="flex justify-center mt-8 mb-8">
              <img
                src={SubscriptionImage}
                alt="Students collaborating on Codezy platform"
                className="w-full max-w-lg h-40 object-contain rounded-xl shadow-2xl"
              />
            </div>
            <button
              onClick={() => handleSelectPlan("Professional Plan")}
              className="bg-white text-indigo-600 font-bold px-8 py-3 rounded-lg shadow-xl hover:bg-gray-100 transition text-lg"
            >
              Get Started Today
            </button>
          </div>
        </div>
      </header>

      {/* FEATURES */}
      <section className="py-20">
        <h2 className="text-center text-3xl font-bold mb-12 text-gray-800">
          Powerful Features for Educational Excellence
        </h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center px-8">
          {featureIcons.map((feature, index) => (
            <FeatureBox key={index} {...feature} />
          ))}
        </div>
      </section>

      {/* PLANS */}
      <section className="py-20 bg-gray-50">
        <h2 className="text-center text-3xl font-bold mb-2 text-gray-800">Choose Your Plan</h2>
        <p className="text-center text-gray-600 mb-16 text-md">
          Flexible pricing options designed to scale with your institution
        </p>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-8">
          {filteredPlans.map(plan => (
            <div
              key={plan.name}
              className={`bg-white rounded-xl p-8 shadow-xl relative transition transform hover:scale-[1.02] 
                ${plan.isRecommended ? "border-4 border-indigo-600" : "border border-gray-200"}`}
            >
              {plan.isRecommended && (
                <span className="absolute -top-3 left-3 bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-xs py-1 px-4 rounded-full font-semibold uppercase tracking-wider">
                  Recommended
                </span>
              )}
              {currentPlan === plan.name && (
                <span className="absolute -top-3 right-3 bg-green-600 text-white text-xs py-1 px-3 rounded-full font-semibold">
                  CURRENT PLAN
                </span>
              )}

              <h3 className="font-bold text-xl mb-1">{plan.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{plan.subtitle}</p>
              <p className="text-5xl font-extrabold text-indigo-600 mb-6">
                ${plan.price}<span className="text-base font-normal text-gray-500">/month</span>
              </p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f, i) => (
                  <CheckListItem key={i}>{f}</CheckListItem>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan.name)}
                className={`w-full font-semibold py-3 rounded-lg transition 
                  ${plan.isRecommended
                    ? "bg-gradient-to-br from-indigo-500 to-pink-500 text-white hover:from-indigo-600 hover:to-pink-600"
                    : "bg-pink-50 text-indigo-600 border border-pink-200 hover:bg-pink-100"}`}
              >
                Continue
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CUSTOM ESTIMATOR */}
      <section className="py-20">
        <h2 className="text-center text-xl font-bold mb-4">Custom Pricing Estimator</h2>
        <p className="text-center text-gray-500 mb-10 text-sm">
          You can adjust these values later as your institution grows.
        </p>
        <div className="max-w-xl mx-auto bg-white border border-gray-200 p-8 rounded-2xl shadow-lg">
          <div className="grid grid-cols-3 gap-6 text-center text-sm mb-8">
            <div>
              <label className="font-semibold block mb-2 text-gray-700">Expected Courses</label>
              <select
                value={expectedCourses}
                onChange={(e) => setExpectedCourses(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg p-3 text-center"
              >
                {[1, 5, 10, 20, 50].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="font-semibold block mb-2 text-gray-700">Labs per Course</label>
              <select
                value={labsPerCourse}
                onChange={(e) => setLabsPerCourse(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg p-3 text-center"
              >
                {[1, 2, 5, 10].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="font-semibold block mb-2 text-gray-700">Students per Course</label>
              <select
                value={studentsPerCourse}
                onChange={(e) => setStudentsPerCourse(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg p-3 text-center"
              >
                {[10, 30, 50, 100].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-pink-50 border-t border-b border-pink-200 py-4 mb-8">
            <p className="text-center text-4xl font-extrabold text-indigo-700">
              ${customQuote}<span className="text-base font-normal text-gray-500">/month</span>
            </p>
          </div>

          <button
            onClick={() => handleSelectPlan("Custom Plan", customQuote)}
            className="w-full font-semibold py-3 rounded-lg shadow-md transition bg-gradient-to-br from-indigo-500 to-pink-500 text-white hover:from-indigo-600 hover:to-pink-600"
          >
            Get Custom Quote
          </button>
        </div>
      </section>
    </div>
  );
}

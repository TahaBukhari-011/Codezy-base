import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  const planName = searchParams.get("plan");
  const amount = searchParams.get("amount");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const updateSubscription = async () => {
      try {
        if (!userId || !planName) return;

        // Update subscription on backend
        const { data } = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/subscription/create`,
          { userId, planName, price: Number(amount) }
        );

        // Save current plan locally
        localStorage.setItem("currentPlan", planName);
        localStorage.setItem("subscriptionActive", "true"); // Flag subscription active
        sessionStorage.removeItem("selectedPlan"); // clear session plan

      } catch (err) {
        console.error("Error updating subscription:", err);
      } finally {
        setLoading(false);
      }
    };

    updateSubscription();
  }, [planName, amount, userId]);

  const handleGoToNext = () => {
    const subscriptionActive = localStorage.getItem("subscriptionActive");
    const role = localStorage.getItem("role");

    if (subscriptionActive === "true" && role === "institution_admin") {
      navigate("/admin"); // Go to institution admin portal
    } else {
      navigate("/subscription"); // Default fallback
    }
  };

  if (loading) return <div className="text-center py-20">Processing payment...</div>;

  return (
    <div className="p-10 text-center">
      <h1 className="text-3xl font-bold text-green-600">Payment Successful!</h1>
      <p className="mt-4">
        Your payment for <strong>{planName}</strong> (${amount}) was successful.
      </p>
      <button
        onClick={handleGoToNext}
        className="mt-6 bg-indigo-600 text-white px-5 py-3 rounded-lg"
      >
        Go to Portal
      </button>
    </div>
  );
}

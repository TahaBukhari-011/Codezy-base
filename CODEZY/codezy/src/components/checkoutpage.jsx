import React, { useState, useEffect } from "react";
import { ArrowLeftIcon, CreditCardIcon } from "@heroicons/react/24/outline";
import { getPlanByName } from "../utils/plans";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  // Load selected plan and user info
  useEffect(() => {
    const planFromSession = sessionStorage.getItem("selectedPlan");
    const uid = localStorage.getItem("userId");
    const email = localStorage.getItem("email");

    if (!planFromSession || !uid) {
      sessionStorage.setItem("redirectAfterLogin", "/checkout");
      navigate("/login");
      return;
    }

    setSelectedPlan(JSON.parse(planFromSession));
    setUserId(uid);
    setUserEmail(email);
  }, [navigate]);

  if (!selectedPlan || !userId) return <div className="text-center p-20">Loading...</div>;

  const plan = getPlanByName(selectedPlan.name);
  const price = selectedPlan.customPrice || plan.price;
  const tax = Math.round(price * 0.05);
  const total = price + tax;

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const token = localStorage.getItem("token");
      const payload = {
        planName: selectedPlan.name,
        userId,
        successUrl: `${window.location.origin}/payment-success?plan=${selectedPlan.name}&amount=${total}&email=${userEmail}`,
        cancelUrl: `${window.location.origin}/payment-cancel?plan=${selectedPlan.name}&amount=${total}&email=${userEmail}`,
      };

      if (selectedPlan.priceId) payload.priceId = selectedPlan.priceId;
      else payload.amount = Math.round(Number(total));

      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/payments/create-checkout-session`,
        payload,
        {
          headers: token
            ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
            : { "Content-Type": "application/json" },
        }
      );

      if (!data?.url) throw new Error("Invalid server response");

      // Redirect to Stripe Checkout
      window.location.href = data.url;

    } catch (err) {
      console.error("Stripe Checkout Error:", err);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Payment failed. Please try again.";
      alert(msg);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans py-16">
      <div className="max-w-3xl mx-auto px-4">
        <button
          onClick={() => navigate("/cart")}
          className="flex items-center text-indigo-600 hover:text-pink-600 mb-6 font-medium transition"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" /> Back to Cart
        </button>

        <div className="flex items-center mb-10">
          <CreditCardIcon className="w-8 h-8 text-pink-500 mr-4" />
          <h1 className="text-3xl font-extrabold text-gray-900">Secure Checkout</h1>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold mb-6 border-b pb-3">Payment Details</h2>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700">Plan Selected:</h3>
            <p className="text-xl font-semibold text-gray-900">{plan.name}</p>
            <p className="text-gray-600">Price: ${price}</p>
            <p className="text-gray-700">Tax (5%): ${tax}</p>
            <p className="text-xl font-bold text-pink-600">Total: ${total}</p>
          </div>

          <form className="space-y-6" onSubmit={handlePayment}>
            <div className="mt-8 pt-6 border-t">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-semibold text-gray-800">Total Due</span>
                <span className="text-3xl font-extrabold text-pink-600">${total}</span>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full py-4 font-semibold rounded-lg shadow-xl transition 
                  ${isProcessing
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-br from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600"} 
                  text-white text-lg`}
              >
                {isProcessing ? "Redirecting to Stripe..." : `Pay $${total}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

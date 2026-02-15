import React, { useEffect, useState } from 'react';
import { ArrowLeftIcon, TrashIcon, ShoppingCartIcon, CheckIcon } from '@heroicons/react/24/outline';
import { getPlanByName } from '../utils/plans';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    const savedPlan = sessionStorage.getItem('selectedPlan');
    if (savedPlan) setSelectedPlan(JSON.parse(savedPlan));
  }, []);

  if (!selectedPlan) {
    return (
      <div className="text-center p-20">
        No plan selected.{' '}
        <button
          onClick={() => navigate('/subscription')}
          className="text-indigo-600 underline"
        >
          Go back to plans
        </button>
      </div>
    );
  }

  const plan = getPlanByName(selectedPlan.name);
  const price = selectedPlan.customPrice || plan.price;
  const isCustom = selectedPlan.name === 'Custom Plan';

  const subtotal = price;
  const discount = 0;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax - discount;

  const handleProceedToCheckout = () => {
    const userId = localStorage.getItem('userId');

    // Always save the selected plan before leaving the page
    sessionStorage.setItem('selectedPlan', JSON.stringify(selectedPlan));

    if (!userId) {
      // Save redirect path so login can send them back here
      sessionStorage.setItem('redirectAfterLogin', '/cart');

      // Redirect to login page
      navigate('/login');
      return;
    }

    // User logged in → proceed
    navigate('/checkout');
  };

  const handleRemovePlan = () => {
    sessionStorage.removeItem('selectedPlan');
    setSelectedPlan(null);
    navigate('/subscription');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans py-16">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate('/subscription')}
          className="flex items-center text-indigo-600 hover:text-pink-600 mb-6 font-medium transition"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" /> Back to Plans
        </button>

        <div className="flex items-center mb-10">
          <ShoppingCartIcon className="w-8 h-8 text-pink-500 mr-4" />
          <h1 className="text-3xl font-extrabold text-gray-900">Your Cart Summary</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Item Details */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 border-b pb-3">Selected Plan</h2>

            <div className="flex justify-between items-start border-b py-4">
              <div>
                <h3 className="text-lg font-bold text-indigo-600">
                  {plan.name} {isCustom && <span className="text-xs text-gray-500">(Custom Estimate)</span>}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{plan.subtitle}</p>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold text-gray-800">
                  ${price}
                  <span className="text-sm font-normal text-gray-500">/month</span>
                </p>
                <button
                  onClick={handleRemovePlan}
                  className="text-xs text-pink-500 hover:text-pink-700 flex items-center mt-1"
                >
                  <TrashIcon className="w-4 h-4 mr-1" /> Remove
                </button>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold mb-2">Key Features:</h4>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {plan.features.slice(0, 4).map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <CheckIcon className="w-4 h-4 text-green-500 mr-2" /> {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 border-b pb-3">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal (Monthly)</span>
                <span className="font-medium text-gray-800">${subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (5%)</span>
                <span className="font-medium text-gray-800">${tax}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-green-600">-${discount}</span>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-dashed mt-6 pt-4">
              <span className="text-lg font-bold">Estimated Total</span>
              <span className="text-2xl font-extrabold text-indigo-600">${total}</span>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="w-full mt-6 py-3 font-semibold rounded-lg shadow-md transition
                         bg-gradient-to-br from-indigo-500 to-pink-500 text-white hover:from-indigo-600 hover:to-pink-600"
            >
              Proceed to Checkout
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartPage;

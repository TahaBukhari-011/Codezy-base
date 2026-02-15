import { useNavigate, useSearchParams } from "react-router-dom";

export default function PaymentCancel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const planName = searchParams.get("plan");
  const amount = searchParams.get("amount");

  return (
    <div className="p-10 text-center">
      <h1 className="text-3xl font-bold text-red-600">Payment Cancelled</h1>
      {planName && amount ? (
        <p className="mt-4">
          Your payment for <strong>{planName}</strong> (${amount}) was not completed.
        </p>
      ) : (
        <p className="mt-4">Your payment was not completed.</p>
      )}

      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={() => navigate("/checkout")}
          className="bg-yellow-500 text-white px-5 py-3 rounded-lg"
        >
          Retry Payment
        </button>
        <button
          onClick={() => navigate("/subscription")}
          className="bg-gray-800 text-white px-5 py-3 rounded-lg"
        >
          Browse Plans
        </button>
      </div>
    </div>
  );
}

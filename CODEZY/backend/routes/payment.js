import express from "express";
import Stripe from "stripe";
import Payment from "../models/Payment.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// ---------------------------------------------
// Stripe initialization
// ---------------------------------------------
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("❌ ERROR: STRIPE_SECRET_KEY is missing in .env file");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ---------------------------------------------
// Middleware: Authentication
// ---------------------------------------------
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// ---------------------------------------------
// CREATE CHECKOUT SESSION
// ---------------------------------------------
router.post("/create-checkout-session", authMiddleware, async (req, res) => {
  try {
    const { planName, priceId, amount } = req.body;

    if (!planName || (!priceId && !amount)) {
      return res
        .status(400)
        .json({ message: "Missing planName or priceId or amount" });
    }

    const sessionData = {
      payment_method_types: ["card"],
      mode: priceId ? "subscription" : "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success?plan=${planName}&amount=${amount}&email=${req.user.email}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancel?plan=${planName}&amount=${amount}`,
      metadata: { userId: req.user.userId, planName },
      line_items: [],
    };

    if (priceId) {
      sessionData.line_items.push({ price: priceId, quantity: 1 });
    } else {
      sessionData.line_items.push({
        price_data: {
          currency: "usd",
          product_data: { name: planName },
          unit_amount: amount * 100, // convert dollars to cents
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create(sessionData);

    return res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error("CHECKOUT SESSION ERROR:", err);
    return res.status(500).json({ message: "Stripe checkout error" });
  }
});

// ---------------------------------------------
// STRIPE WEBHOOK
// ---------------------------------------------
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("WEBHOOK SIGNATURE ERROR:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      try {
        await Payment.create({
          userId: session.metadata.userId,
          planName: session.metadata.planName,
          amountPaid: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency || "usd",
          paymentStatus: "paid",
          stripeSessionId: session.id,
        });

        console.log("✔ Payment saved in DB");
      } catch (err) {
        console.error("ERROR SAVING PAYMENT:", err);
      }
    }

    res.json({ received: true });
  }
);

export default router;

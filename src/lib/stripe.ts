import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in .env");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});

// Price IDs — Replace with your actual Stripe Price IDs
export const STRIPE_PRICES = {
  starter: process.env.STRIPE_PRICE_STARTER || "price_starter_xxx",
  pro: process.env.STRIPE_PRICE_PRO || "price_pro_xxx",
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE || "price_enterprise_xxx",
};

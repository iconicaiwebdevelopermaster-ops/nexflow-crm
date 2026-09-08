export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";


export async function POST(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
    });

    if (!token || !token.email) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { planId, planName, price } = await req.json();

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    // If Stripe Secret Key is present, trigger real Stripe Checkout Session
    if (stripeSecretKey) {
      try {
        const stripe = require("stripe")(stripeSecretKey);
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: `NexFlow CRM - ${planName} Plan`,
                  description: "Automated B2B Lead Generation & Outreach Engine Access",
                },
                unit_amount: price * 100, // Amount in cents
                recurring: { interval: "month" },
              },
              quantity: 1,
            },
          ],
          mode: "subscription",
          customer_email: token.email,
          success_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/settings?payment=success`,
          cancel_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/settings?payment=cancelled`,
        });

        return NextResponse.json({ url: session.url });
      } catch (stripeErr: any) {
        console.error("Stripe Error:", stripeErr);
        return NextResponse.json({ error: stripeErr.message || "Stripe session creation failed" }, { status: 500 });
      }
    }

    // Fallback Mock URL if STRIPE_SECRET_KEY is not configured yet
    return NextResponse.json({
      url: `/settings?payment=mock_success&plan=${planId}`,
      message: "Stripe API Key not set in .env — simulated checkout active.",
    });

  } catch (error: any) {
    console.error("Checkout Endpoint Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process checkout" },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle subscription events
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      const userEmail = session.metadata?.userEmail;
      const plan = session.metadata?.plan;

      if (userEmail && plan) {
        await prisma.user.update({
          where: { email: userEmail },
          data: {
            plan: plan.toUpperCase(),
            stripeCustomerId: session.customer as string,
            subscriptionStatus: "ACTIVE",
          } as any,
        });
        console.log(`✅ User ${userEmail} upgraded to ${plan}`);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as any;
      const customerId = subscription.customer as string;

      await prisma.user.updateMany({
        where: { stripeCustomerId: customerId } as any,
        data: {
          subscriptionStatus: "CANCELLED",
          plan: "FREE",
        } as any,
      });
      console.log(`❌ Subscription cancelled for ${customerId}`);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

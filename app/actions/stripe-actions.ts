"use server"
import { stripe } from "@/lib/stripe"
import { PRODUCTS } from "@/lib/products"
import { createClient } from "@/lib/supabase/server"

export async function startCheckoutSession(productId: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("Trebuie să fiți autentificat")
  }

  const product = PRODUCTS.find((p) => p.id === productId)
  if (!product) {
    throw new Error(`Produsul cu id "${productId}" nu a fost găsit`)
  }

  // Get or create Stripe customer
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single()

  let customerId = subscription?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        supabase_user_id: user.id,
      },
    })
    customerId = customer.id

    // Update subscription with customer ID
    await supabase.from("subscriptions").update({ stripe_customer_id: customerId }).eq("user_id", user.id)
  }

  // Create Checkout Session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    ui_mode: "embedded",
    redirect_on_completion: "never",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: product.priceInCents,
          recurring: {
            interval: "month",
          },
        },
        quantity: 1,
      },
    ],
    mode: "subscription",
    metadata: {
      supabase_user_id: user.id,
      tier: product.tier,
    },
  })

  return session.client_secret
}

export async function getSessionStatus(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  if (session.status === "complete" && session.subscription) {
    const supabase = await createClient()

    // Update subscription in database
    await supabase
      .from("subscriptions")
      .update({
        tier: session.metadata?.tier || "standard",
        stripe_subscription_id: session.subscription as string,
        subscription_start_date: new Date().toISOString(),
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", session.metadata?.supabase_user_id)
  }

  return {
    status: session.status,
    customer_email: session.customer_details?.email,
  }
}

export async function cancelSubscription() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "Trebuie să fiți autentificat" }
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_subscription_id")
    .eq("user_id", user.id)
    .single()

  if (!subscription?.stripe_subscription_id) {
    return { error: "Nu aveți un abonament activ" }
  }

  try {
    await stripe.subscriptions.cancel(subscription.stripe_subscription_id)

    // Update database
    await supabase
      .from("subscriptions")
      .update({
        tier: "free",
        is_active: false,
        subscription_end_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)

    return { success: true }
  } catch (error) {
    console.error("Error canceling subscription:", error)
    return { error: "Eroare la anularea abonamentului" }
  }
}

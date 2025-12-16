"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function checkIsAdmin() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false

    const { data: profile, error } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

    if (error || !profile) return false

    return profile.is_admin || false
  } catch (error) {
    console.error("[v0] Error checking admin status:", error)
    return false
  }
}

export async function switchAdminTier(tier: "standard" | "premium") {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "Nu ești autentificat" }
  }

  // Check if user is admin
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) {
    return { success: false, error: "Nu ai permisiuni de admin" }
  }

  // Update subscription tier
  const { error } = await supabase
    .from("subscriptions")
    .update({
      tier,
      is_active: true,
      subscription_start_date: new Date().toISOString(),
      subscription_end_date: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)

  if (error) {
    console.error("[v0] Error updating admin tier:", error)
    return { success: false, error: "Eroare la actualizarea tier-ului" }
  }

  revalidatePath("/dashboard")
  revalidatePath("/settings")

  return { success: true }
}

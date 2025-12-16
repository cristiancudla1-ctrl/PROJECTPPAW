"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { checkIsAdmin } from "./admin-actions"
import { cacheService } from "@/lib/services/cache.service"

// ============ USER MANAGEMENT ============

export async function getAllUsers() {
  try {
    console.log("[AdminCRUD] Fetching all users")

    const cacheKey = "admin:users:all"
    const cachedUsers = cacheService.get<any>(cacheKey)

    if (cachedUsers) {
      console.log("[AdminCRUD] Retrieved users from cache")
      return { users: cachedUsers }
    }

    const supabase = await createClient()
    const isAdmin = await checkIsAdmin()

    if (!isAdmin) {
      console.warn("[AdminCRUD] Unauthorized access attempt to getAllUsers")
      return { error: "Nu ai permisiuni de admin" }
    }

    const { data: profiles, error } = await supabase
      .from("profiles")
      .select(`
        *,
        subscriptions (
          tier,
          is_active,
          free_diagnostics_used,
          free_diagnostics_limit
        )
      `)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[AdminCRUD] Error fetching users from database:", error)
      return { error: "Eroare la încărcarea utilizatorilor" }
    }

    cacheService.set(cacheKey, profiles, 60)

    console.log("[AdminCRUD] Successfully retrieved all users, count:", profiles?.length)
    return { users: profiles }
  } catch (error) {
    console.error("[AdminCRUD] Unexpected error in getAllUsers:", error)
    return { error: "Eroare la încărcarea utilizatorilor" }
  }
}

export async function getUserDetails(userId: string) {
  try {
    console.log("[AdminCRUD] Fetching user details for:", userId)
    const supabase = await createClient()
    const isAdmin = await checkIsAdmin()

    if (!isAdmin) {
      console.warn("[AdminCRUD] Unauthorized access attempt to getUserDetails", { userId })
      return { error: "Nu ai permisiuni de admin" }
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(`
        *,
        subscriptions (*),
        diagnostics (*)
      `)
      .eq("id", userId)
      .single()

    if (profileError || !profile) {
      console.error("[AdminCRUD] Error fetching user details", profileError as Error, { userId })
      return { error: "Eroare la încărcarea detaliilor utilizatorului" }
    }

    console.log("[AdminCRUD] Successfully retrieved user details", { userId })
    return { user: profile }
  } catch (error) {
    console.error("[AdminCRUD] Unexpected error in getUserDetails:", error, userId)
    return { error: "Eroare la încărcarea detaliilor utilizatorului" }
  }
}

export async function updateUser(
  userId: string,
  data: {
    full_name?: string
    is_admin?: boolean
  },
) {
  try {
    console.log("[AdminCRUD] Updating user:", userId, data)
    const supabase = await createClient()
    const isAdmin = await checkIsAdmin()

    if (!isAdmin) {
      console.warn("[AdminCRUD] Unauthorized update attempt", { userId })
      return { error: "Nu ai permisiuni de admin" }
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("[AdminCRUD] Error updating user in database", error as Error, { userId })
      return { error: "Eroare la actualizarea utilizatorului" }
    }

    cacheService.remove("admin:users:all")
    cacheService.remove(`admin:user:${userId}`)
    cacheService.removeByPattern(`user:${userId}:*`)

    revalidatePath("/admin/users")
    revalidatePath(`/admin/users/${userId}`)

    console.log("[AdminCRUD] User updated successfully", { userId, changes: data })
    return { success: true }
  } catch (error) {
    console.error("[AdminCRUD] Unexpected error in updateUser:", error, userId)
    return { error: error instanceof Error ? error.message : "Eroare la actualizarea utilizatorului" }
  }
}

export async function deleteUser(userId: string) {
  try {
    console.log("[AdminCRUD] Soft-deleting user", { userId })
    const supabase = await createClient()
    const isAdmin = await checkIsAdmin()

    if (!isAdmin) {
      console.warn("[AdminCRUD] Unauthorized delete attempt", { userId })
      return { error: "Nu ai permisiuni de admin" }
    }

    const { error } = await supabase.from("profiles").update({ deleted_at: new Date().toISOString() }).eq("id", userId)

    if (error) {
      console.error("[AdminCRUD] Error soft-deleting user", error as Error, { userId })
      return { error: "Eroare la ștergerea utilizatorului" }
    }

    cacheService.remove("admin:users:all")
    cacheService.removeByPattern(`user:${userId}:*`)
    cacheService.remove(`admin:user:${userId}`)

    console.log("[AdminCRUD] User soft-deleted successfully (marked with deleted_at)", { userId })
    revalidatePath("/admin/users")
    return { success: true, type: "soft" }
  } catch (error) {
    console.error("[AdminCRUD] Unexpected error in deleteUser", error as Error, { userId })
    return { error: error instanceof Error ? error.message : "Eroare la ștergerea utilizatorului" }
  }
}

export async function restoreUser(userId: string) {
  try {
    console.log("[AdminCRUD] Restoring soft-deleted user", { userId })
    const supabase = await createClient()
    const isAdmin = await checkIsAdmin()

    if (!isAdmin) {
      console.warn("[AdminCRUD] Unauthorized restore attempt", { userId })
      return { error: "Nu ai permisiuni de admin" }
    }

    const { error } = await supabase.from("profiles").update({ deleted_at: null }).eq("id", userId)

    if (error) {
      console.error("[AdminCRUD] Error restoring user", error as Error, { userId })
      return { error: "Eroare la restaurarea utilizatorului" }
    }

    console.log("[AdminCRUD] User restored successfully (cleared deleted_at)", { userId })
    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    console.error("[AdminCRUD] Unexpected error in restoreUser", error as Error, { userId })
    return { error: error instanceof Error ? error.message : "Eroare la restaurarea utilizatorului" }
  }
}

// ============ SUBSCRIPTION MANAGEMENT ============

export async function getAllSubscriptions() {
  const supabase = await createClient()
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    return { error: "Nu ai permisiuni de admin" }
  }

  try {
    console.log("[AdminCRUD] Fetching all subscriptions")

    const cacheKey = "admin:subscriptions:all"
    const cachedSubscriptions = cacheService.get<any>(cacheKey)

    if (cachedSubscriptions) {
      console.log("[AdminCRUD] Retrieved subscriptions from cache")
      return { subscriptions: cachedSubscriptions }
    }

    const { data: subscriptions, error } = await supabase
      .from("subscriptions")
      .select(`
        *,
        profiles!inner (
          id,
          full_name,
          email
        )
      `)
      .is("deleted_at", null)
      .is("profiles.deleted_at", null)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[AdminCRUD] Error fetching subscriptions", error as Error)
      return { error: "Eroare la încărcarea abonamentelor" }
    }

    cacheService.set(cacheKey, subscriptions, 120)

    console.log("[AdminCRUD] Successfully retrieved subscriptions", { count: subscriptions?.length })
    return { subscriptions }
  } catch (error) {
    console.error("[AdminCRUD] Unexpected error in getAllSubscriptions", error as Error)
    return { error: "Eroare la încărcarea abonamentelor" }
  }
}

export async function updateSubscription(
  userId: string,
  data: {
    tier?: "free" | "standard" | "premium"
    is_active?: boolean
    free_diagnostics_used?: number
    free_diagnostics_limit?: number
  },
) {
  const supabase = await createClient()
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    return { error: "Nu ai permisiuni de admin" }
  }

  try {
    console.log("[AdminCRUD] Updating subscription", { userId, changes: data })
    const { error } = await supabase
      .from("subscriptions")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (error) {
      console.error("[AdminCRUD] Error updating subscription", error as Error, { userId })
      return { error: "Eroare la actualizarea abonamentului" }
    }

    cacheService.remove("admin:subscriptions:all")
    cacheService.removeByPattern(`subscription:${userId}:*`)

    revalidatePath("/admin/subscriptions")
    revalidatePath(`/admin/users/${userId}`)

    console.log("[AdminCRUD] Subscription updated successfully", { userId, tier: data.tier })
    return { success: true }
  } catch (error) {
    console.error("[AdminCRUD] Unexpected error in updateSubscription", error as Error, { userId })
    return { error: "Eroare la actualizarea abonamentului" }
  }
}

// ============ DIAGNOSTICS MANAGEMENT ============

export async function getAllDiagnostics(limit = 50) {
  const supabase = await createClient()
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    return { error: "Nu ai permisiuni de admin" }
  }

  try {
    console.log("[AdminCRUD] Fetching all diagnostics", { limit })

    const cacheKey = `admin:diagnostics:all:${limit}`
    const cachedDiagnostics = cacheService.get<any>(cacheKey)

    if (cachedDiagnostics) {
      console.log("[AdminCRUD] Retrieved diagnostics from cache")
      return { diagnostics: cachedDiagnostics }
    }

    const { data: diagnostics, error } = await supabase
      .from("diagnostics")
      .select(`
        *,
        profiles!inner (
          id,
          full_name,
          email
        )
      `)
      .is("profiles.deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("[AdminCRUD] Error fetching diagnostics", error as Error)
      return { error: "Eroare la încărcarea diagnosticărilor" }
    }

    cacheService.set(cacheKey, diagnostics, 30)

    console.log("[AdminCRUD] Successfully retrieved diagnostics", { count: diagnostics?.length })
    return { diagnostics }
  } catch (error) {
    console.error("[AdminCRUD] Unexpected error in getAllDiagnostics", error as Error)
    return { error: "Eroare la încărcarea diagnosticărilor" }
  }
}

export async function getDiagnosticDetails(diagnosticId: string) {
  const supabase = await createClient()
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    return { error: "Nu ai permisiuni de admin" }
  }

  try {
    console.log("[AdminCRUD] Fetching diagnostic details", { diagnosticId })
    const { data: diagnostic, error } = await supabase
      .from("diagnostics")
      .select(`
        *,
        profiles (
          id,
          full_name,
          email
        )
      `)
      .eq("id", diagnosticId)
      .single()

    if (error) {
      console.error("[AdminCRUD] Error fetching diagnostic details", error as Error, { diagnosticId })
      return { error: "Eroare la încărcarea detaliilor diagnosticului" }
    }

    console.log("[AdminCRUD] Successfully retrieved diagnostic details", { diagnosticId })
    return { diagnostic }
  } catch (error) {
    console.error("[AdminCRUD] Unexpected error in getDiagnosticDetails", error as Error, { diagnosticId })
    return { error: "Eroare la încărcarea detaliilor diagnosticului" }
  }
}

export async function createDiagnostic(data: {
  user_id: string
  vehicle_make?: string
  vehicle_model?: string
  vehicle_year?: number
  symptoms: string
  ai_diagnosis: string
  severity: string
  estimated_cost: string
  ai_recommendations?: string
}) {
  const supabase = await createClient()
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    return { error: "Nu ai permisiuni de admin" }
  }

  try {
    console.log("[AdminCRUD] Creating diagnostic", { userId: data.user_id, vehicleMake: data.vehicle_make })
    const { data: diagnostic, error } = await supabase
      .from("diagnostics")
      .insert({
        user_id: data.user_id,
        vehicle_make: data.vehicle_make,
        vehicle_model: data.vehicle_model,
        vehicle_year: data.vehicle_year,
        symptoms: data.symptoms,
        ai_diagnosis: data.ai_diagnosis,
        severity: data.severity,
        estimated_cost: data.estimated_cost,
        ai_recommendations: data.ai_recommendations,
      })
      .select()
      .single()

    if (error) {
      console.error("[AdminCRUD] Error creating diagnostic", error as Error)
      return { error: "Eroare la crearea diagnosticului" }
    }

    revalidatePath("/admin/diagnostics")
    console.log("[AdminCRUD] Diagnostic created successfully", { diagnosticId: diagnostic.id, userId: data.user_id })
    return { success: true, diagnostic }
  } catch (error) {
    console.error("[AdminCRUD] Unexpected error in createDiagnostic", error as Error)
    return { error: "Eroare la crearea diagnosticului" }
  }
}

export async function deleteDiagnostic(diagnosticId: string) {
  const supabase = await createClient()
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    return { error: "Nu ai permisiuni de admin" }
  }

  try {
    console.log("[AdminCRUD] Hard-deleting diagnostic (physical removal)", { diagnosticId })
    const { error } = await supabase.from("diagnostics").delete().eq("id", diagnosticId)

    if (error) {
      console.error("[AdminCRUD] Error hard-deleting diagnostic", error as Error, { diagnosticId })
      return { error: "Eroare la ștergerea diagnosticului" }
    }

    cacheService.removeByPattern("admin:diagnostics:*")

    revalidatePath("/admin/diagnostics")
    console.log("[AdminCRUD] Diagnostic hard-deleted successfully from database", { diagnosticId })
    return { success: true, type: "hard" }
  } catch (error) {
    console.error("[AdminCRUD] Unexpected error in deleteDiagnostic", error as Error, { diagnosticId })
    return { error: "Eroare la ștergerea diagnosticului" }
  }
}

// ============ DASHBOARD STATISTICS ============

export async function getAdminStats() {
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    return { error: "Nu ai permisiuni de admin" }
  }

  try {
    console.log("[AdminCRUD] Fetching admin statistics")

    const cacheKey = "admin:stats:dashboard"
    const cachedStats = cacheService.get<any>(cacheKey)

    if (cachedStats) {
      console.log("[AdminCRUD] Retrieved admin stats from cache")
      return { stats: cachedStats }
    }

    const supabase = await createClient()

    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)

    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("tier, is_active")
      .is("deleted_at", null)

    const subscriptionStats = {
      free: subscriptions?.filter((s) => s.tier === "free").length || 0,
      standard: subscriptions?.filter((s) => s.tier === "standard" && s.is_active).length || 0,
      premium: subscriptions?.filter((s) => s.tier === "premium" && s.is_active).length || 0,
    }

    const { data: diagnostics } = await supabase
      .from("diagnostics")
      .select("severity, profiles!inner(deleted_at)")
      .is("profiles.deleted_at", null)

    const severityBreakdown = {
      low: diagnostics?.filter((d) => d.severity === "low").length || 0,
      medium: diagnostics?.filter((d) => d.severity === "medium").length || 0,
      high: diagnostics?.filter((d) => d.severity === "high").length || 0,
      critical: diagnostics?.filter((d) => d.severity === "critical").length || 0,
    }

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { count: recentDiagnostics } = await supabase
      .from("diagnostics")
      .select("*, profiles!inner(deleted_at)", { count: "exact", head: true })
      .is("profiles.deleted_at", null)
      .gte("created_at", sevenDaysAgo.toISOString())

    const stats = {
      totalUsers: totalUsers || 0,
      totalDiagnostics: diagnostics?.length || 0,
      recentDiagnostics: recentDiagnostics || 0,
      subscriptionStats,
      severityBreakdown,
    }

    cacheService.set(cacheKey, stats, 60)

    console.log("[AdminCRUD] Successfully retrieved admin statistics", { totalUsers: stats.totalUsers })
    return { stats }
  } catch (error) {
    console.error("[AdminCRUD] Unexpected error in getAdminStats", error as Error)
    return { error: "Eroare la încărcarea statisticilor" }
  }
}

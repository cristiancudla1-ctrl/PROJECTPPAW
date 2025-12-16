"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("fullName") as string
  const repeatPassword = formData.get("repeatPassword") as string

  console.log("[Auth] User sign up attempt:", email)

  if (password !== repeatPassword) {
    console.warn("[Auth] Password mismatch during sign up:", email)
    return { error: "Parolele nu se potrivesc" }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${process.env.SUPABASE_URL}/dashboard`,
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    console.error("[Auth] Sign up failed:", error.message, email)
    return { error: error.message }
  }

  console.log("[Auth] User signed up successfully:", email)
  redirect("/auth/sign-up-success")
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  console.log("[Auth] User sign in attempt:", email)

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("[Auth] Sign in failed:", error.message, email)
    return { error: error.message }
  }

  console.log("[Auth] User signed in successfully:", email)
  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function signOut() {
  const supabase = await createClient()
  console.log("[Auth] User sign out")
  await supabase.auth.signOut()
  console.log("[Auth] User signed out successfully")
  revalidatePath("/", "layout")
  redirect("/")
}

export async function requestPasswordReset(email: string) {
  const supabase = await createClient()

  console.log("[Auth] Password reset requested:", email)

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${process.env.SUPABASE_URL}/auth/reset-password`,
  })

  if (error) {
    console.error("[Auth] Password reset request failed:", error.message, email)
    return { error: error.message }
  }

  console.log("[Auth] Password reset email sent:", email)
  return { success: true }
}

export async function resetPassword(newPassword: string) {
  const supabase = await createClient()

  console.log("[Auth] Password reset attempt")

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    console.error("[Auth] Password reset failed:", error.message)
    return { error: error.message }
  }

  console.log("[Auth] Password reset successfully")
  revalidatePath("/", "layout")
  return { success: true }
}

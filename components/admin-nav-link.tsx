import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export async function AdminNavLink() {
  try {
    console.log("[v0] AdminNavLink: Starting admin check")

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log("[v0] AdminNavLink: User ID:", user?.id)

    if (!user) {
      console.log("[v0] AdminNavLink: No user found, returning null")
      return null
    }

    const { data: profile, error } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

    console.log("[v0] AdminNavLink: Profile data:", profile)

    if (error || !profile?.is_admin) {
      console.log("[v0] AdminNavLink: User is not admin")
      return null
    }

    console.log("[v0] AdminNavLink: User IS admin, showing button")

    return (
      <div className="fixed top-4 right-4 z-50">
        <Button asChild variant="default" size="sm" className="shadow-lg">
          <Link href="/admin" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Panou Admin
          </Link>
        </Button>
      </div>
    )
  } catch (error) {
    console.error("[v0] AdminNavLink: Critical error:", error)
    // Return null instead of crashing
    return null
  }
}

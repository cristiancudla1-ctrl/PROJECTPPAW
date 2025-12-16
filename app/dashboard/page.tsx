import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DiagnosticForm from "@/components/diagnostic-form"
import DiagnosticHistory from "@/components/diagnostic-history"
import SubscriptionStatus from "@/components/subscription-status"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LogOut, Settings, Shield } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  let isAdmin = false
  try {
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

    isAdmin = profile?.is_admin || false
    console.log("[v0] Dashboard: User is admin:", isAdmin)
  } catch (err) {
    console.log("[v0] Dashboard: Error checking admin status:", err)
    isAdmin = false
  }

  const handleSignOut = async () => {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Diagnosticare Auto AI</h1>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button asChild variant="default" size="sm">
                <Link href="/admin">
                  <Shield className="h-4 w-4 mr-2" />
                  Panou Admin
                </Link>
              </Button>
            )}
            {/* Settings button */}
            <Button asChild variant="ghost" size="sm">
              <Link href="/settings">
                <Settings className="h-4 w-4 mr-2" />
                Setări
              </Link>
            </Button>
            <form action={handleSignOut}>
              <Button variant="ghost" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Deconectare
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <DiagnosticForm />
            <DiagnosticHistory />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <SubscriptionStatus />
          </div>
        </div>
      </div>
    </div>
  )
}

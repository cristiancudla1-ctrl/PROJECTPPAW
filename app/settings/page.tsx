import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Crown, Calendar, CreditCard } from "lucide-react"
import CancelSubscriptionButton from "@/components/cancel-subscription-button"
import { formatDistanceToNow } from "date-fns"
import { ro } from "date-fns/locale"
import { AdminTierSwitcher } from "@/components/admin-tier-switcher"
import { checkIsAdmin } from "@/app/actions/admin-actions"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: subscription } = await supabase.from("subscriptions").select("*").eq("user_id", user.id).single()

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const isAdmin = await checkIsAdmin()

  const tierLabels = {
    free: "Free Trial",
    standard: "Standard",
    premium: "Premium",
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Înapoi la Dashboard
          </Link>
        </Button>

        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Setări Cont</h1>
            <p className="text-muted-foreground">Gestionați contul și abonamentul dvs.</p>
          </div>

          {isAdmin && <AdminTierSwitcher currentTier={subscription?.tier || "free"} />}

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informații Profil</CardTitle>
              <CardDescription>Detaliile contului dvs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <div className="text-sm font-medium">Nume</div>
                <div className="text-sm text-muted-foreground">{profile?.full_name || "Nu este setat"}</div>
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-medium">Email</div>
                <div className="text-sm text-muted-foreground">{user.email}</div>
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-medium">Membru din</div>
                <div className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(profile?.created_at || new Date()), {
                    addSuffix: true,
                    locale: ro,
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Abonament
              </CardTitle>
              <CardDescription>Detaliile abonamentului dvs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg">
                    {tierLabels[subscription?.tier as keyof typeof tierLabels]}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {subscription?.tier === "free"
                      ? `${subscription.free_diagnostics_used} / ${subscription.free_diagnostics_limit} diagnosticări folosite`
                      : "Diagnosticări nelimitate"}
                  </div>
                </div>
                {subscription?.tier !== "free" && (
                  <div className="text-right">
                    <div className="font-semibold">${subscription?.tier === "standard" ? "9.99" : "19.99"}/lună</div>
                    <div className="text-sm text-muted-foreground">{subscription?.is_active ? "Activ" : "Inactiv"}</div>
                  </div>
                )}
              </div>

              {subscription?.tier === "free" ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Upgrade pentru diagnosticări nelimitate și funcții avansate
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/pricing">Upgrade Acum</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {subscription?.subscription_start_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Activ din {new Date(subscription.subscription_start_date).toLocaleDateString("ro-RO")}
                      </span>
                    </div>
                  )}
                  {subscription?.stripe_subscription_id && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CreditCard className="h-4 w-4" />
                      <span>Plată recurentă lunară</span>
                    </div>
                  )}
                  <div className="pt-2 space-y-2">
                    {subscription?.tier === "standard" && (
                      <Button asChild variant="outline" className="w-full bg-transparent">
                        <Link href="/pricing">Upgrade la Premium</Link>
                      </Button>
                    )}
                    <CancelSubscriptionButton />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Statistici Utilizare</CardTitle>
              <CardDescription>Activitatea dvs. pe platformă</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-2xl font-bold">
                    {subscription?.tier === "free" ? subscription.free_diagnostics_used : "∞"}
                  </div>
                  <div className="text-sm text-muted-foreground">Diagnosticări efectuate</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold">{tierLabels[subscription?.tier as keyof typeof tierLabels]}</div>
                  <div className="text-sm text-muted-foreground">Plan curent</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

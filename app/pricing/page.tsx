import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import CheckoutButton from "@/components/checkout-button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function PricingPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: subscription } = await supabase.from("subscriptions").select("tier").eq("user_id", user.id).single()

  const currentTier = subscription?.tier || "free"

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Înapoi la Dashboard
          </Link>
        </Button>

        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">Alegeți Planul Potrivit</h1>
            <p className="text-muted-foreground">Upgrade pentru diagnosticări nelimitate și funcții avansate</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Standard */}
            <Card className={currentTier === "standard" ? "border-primary" : ""}>
              <CardHeader>
                <CardTitle className="text-2xl">Standard</CardTitle>
                <CardDescription>Perfect pentru utilizatori regulați</CardDescription>
                <div className="text-4xl font-bold pt-4">
                  $9.99<span className="text-lg font-normal text-muted-foreground">/lună</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Diagnosticări nelimitate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Rapoarte detaliate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Istoric ultimele 10 diagnosticări</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Suport email</span>
                  </li>
                </ul>
                {currentTier === "standard" ? (
                  <Button disabled className="w-full">
                    Plan Curent
                  </Button>
                ) : currentTier === "premium" ? (
                  <Button disabled variant="outline" className="w-full bg-transparent">
                    Aveți Premium
                  </Button>
                ) : (
                  <CheckoutButton productId="standard-monthly" />
                )}
              </CardContent>
            </Card>

            {/* Premium */}
            <Card className={currentTier === "premium" ? "border-primary" : ""}>
              <CardHeader>
                <CardTitle className="text-2xl">Premium</CardTitle>
                <CardDescription>Pentru profesioniști și entuziaști</CardDescription>
                <div className="text-4xl font-bold pt-4">
                  $19.99<span className="text-lg font-normal text-muted-foreground">/lună</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Tot din Standard, plus:</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Analiză tehnică avansată</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Istoric nelimitat</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Procesare prioritară</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Alerte de întreținere predictivă</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>Export PDF</span>
                  </li>
                </ul>
                {currentTier === "premium" ? (
                  <Button disabled className="w-full">
                    Plan Curent
                  </Button>
                ) : (
                  <CheckoutButton productId="premium-monthly" />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

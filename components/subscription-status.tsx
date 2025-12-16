"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getSubscriptionStatus } from "@/app/actions/diagnostic-actions"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { Crown, Zap, Settings } from "lucide-react"

export default function SubscriptionStatus() {
  const [subscription, setSubscription] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    const response = await getSubscriptionStatus()
    if (response.subscription) {
      setSubscription(response.subscription)
    }
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Se încarcă...</p>
        </CardContent>
      </Card>
    )
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Abonament Indisponibil</CardTitle>
          <CardDescription>Nu s-a putut încărca informația despre abonament</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Vă rugăm să vă reconectați sau să contactați suportul.</p>
          <Button asChild className="w-full">
            <Link href="/auth/login">Reconectare</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const tierConfig = {
    free: { label: "Free Trial", icon: Zap, color: "text-blue-500" },
    standard: { label: "Standard", icon: Crown, color: "text-yellow-500" },
    premium: { label: "Premium", icon: Crown, color: "text-purple-500" },
  }

  const config = tierConfig[subscription.tier as keyof typeof tierConfig]

  if (!config) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Abonament Necunoscut</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Tip de abonament invalid: {subscription.tier}</p>
        </CardContent>
      </Card>
    )
  }

  const Icon = config.icon

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${config.color}`} />
          {config.label}
        </CardTitle>
        <CardDescription>Statusul abonamentului dvs.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {subscription.tier === "free" && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Diagnosticări folosite</span>
                <span className="font-semibold">
                  {subscription.free_diagnostics_used} / {subscription.free_diagnostics_limit}
                </span>
              </div>
              <Progress value={(subscription.free_diagnostics_used / subscription.free_diagnostics_limit) * 100} />
            </div>
            <div className="pt-2 space-y-2">
              <p className="text-sm text-muted-foreground">
                Upgrade pentru diagnosticări nelimitate și funcții avansate
              </p>
              <Button asChild className="w-full">
                <Link href="/pricing">Upgrade Acum</Link>
              </Button>
            </div>
          </>
        )}

        {subscription.tier === "standard" && (
          <div className="space-y-2">
            <Badge className="w-full justify-center">Activ</Badge>
            <p className="text-sm text-muted-foreground">Diagnosticări nelimitate și rapoarte detaliate</p>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/pricing">Upgrade la Premium</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/settings">
                <Settings className="h-4 w-4 mr-2" />
                Gestionează Abonamentul
              </Link>
            </Button>
          </div>
        )}

        {subscription.tier === "premium" && (
          <div className="space-y-2">
            <Badge className="w-full justify-center bg-purple-500">Premium Activ</Badge>
            <p className="text-sm text-muted-foreground">Acces complet la toate funcțiile avansate</p>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/settings">
                <Settings className="h-4 w-4 mr-2" />
                Gestionează Abonamentul
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

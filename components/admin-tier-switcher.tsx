"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { switchAdminTier } from "@/app/actions/admin-actions"
import { Shield, Zap } from "lucide-react"

interface AdminTierSwitcherProps {
  currentTier: "free" | "standard" | "premium"
}

export function AdminTierSwitcher({ currentTier }: AdminTierSwitcherProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSwitch = async (tier: "standard" | "premium") => {
    setIsLoading(true)
    try {
      const result = await switchAdminTier(tier)
      if (result.success) {
        window.location.reload()
      } else {
        alert(result.error)
      }
    } catch (error) {
      console.error("[v0] Error switching tier:", error)
      alert("Eroare la schimbarea tier-ului")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-orange-500/20 bg-orange-500/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-orange-500" />
          <CardTitle>Panou Admin</CardTitle>
        </div>
        <CardDescription>Schimbă între pachetele Standard și Premium fără restricții</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Tier curent:</span>
          <Badge variant={currentTier === "premium" ? "default" : "secondary"}>
            {currentTier === "premium" ? "Premium" : currentTier === "standard" ? "Standard" : "Free"}
          </Badge>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => handleSwitch("standard")}
            disabled={isLoading || currentTier === "standard"}
            variant={currentTier === "standard" ? "default" : "outline"}
            className="flex-1"
          >
            <Zap className="mr-2 h-4 w-4" />
            Standard
          </Button>
          <Button
            onClick={() => handleSwitch("premium")}
            disabled={isLoading || currentTier === "premium"}
            variant={currentTier === "premium" ? "default" : "outline"}
            className="flex-1"
          >
            <Shield className="mr-2 h-4 w-4" />
            Premium
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

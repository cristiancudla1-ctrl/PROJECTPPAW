"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateUser, updateSubscription } from "@/app/actions/admin-crud-actions"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface UserEditFormProps {
  user: {
    id: string
    email: string
    full_name: string | null
    is_admin: boolean
    subscriptions: Array<{
      tier: string
      is_active: boolean
      free_diagnostics_used: number
      free_diagnostics_limit: number
    }> | null
  }
}

export function UserEditForm({ user }: UserEditFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const subscription = user.subscriptions?.[0]

  const [fullName, setFullName] = useState(user.full_name || "")
  const [isAdmin, setIsAdmin] = useState(user.is_admin)
  const [tier, setTier] = useState(subscription?.tier || "free")
  const [isActive, setIsActive] = useState(subscription?.is_active || false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    console.log("[v0] Updating user:", { userId: user.id, fullName, isAdmin, tier, isActive })

    const userResult = await updateUser(user.id, {
      full_name: fullName,
      is_admin: isAdmin,
    })

    console.log("[v0] User update result:", userResult)

    const subResult = await updateSubscription(user.id, {
      tier: tier as "free" | "standard" | "premium",
      is_active: isActive,
    })

    console.log("[v0] Subscription update result:", subResult)

    if (userResult.error || subResult.error) {
      toast({
        title: "Eroare",
        description: userResult.error || subResult.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Succes",
        description: "Utilizator actualizat cu succes!",
      })
      setTimeout(() => {
        router.refresh()
      }, 500)
    }

    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editare Utilizator</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nume Complet</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Introduceți numele complet"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="isAdmin" checked={isAdmin} onCheckedChange={(checked) => setIsAdmin(checked as boolean)} />
            <Label htmlFor="isAdmin" className="cursor-pointer">
              Administrator
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tier">Tier Abonament</Label>
            <Select value={tier} onValueChange={setTier}>
              <SelectTrigger id="tier">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free Trial</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="isActive" checked={isActive} onCheckedChange={(checked) => setIsActive(checked as boolean)} />
            <Label htmlFor="isActive" className="cursor-pointer">
              Abonament Activ
            </Label>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Se salvează..." : "Salvează Modificările"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

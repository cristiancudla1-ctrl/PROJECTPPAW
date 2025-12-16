"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createDiagnostic } from "@/app/actions/admin-crud-actions"
import { Loader2 } from "lucide-react"

interface User {
  id: string
  email: string
  full_name: string | null
}

interface DiagnosticCreateFormProps {
  users: User[]
}

export function DiagnosticCreateForm({ users }: DiagnosticCreateFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    user_id: "",
    vehicle_make: "",
    vehicle_model: "",
    vehicle_year: undefined as number | undefined,
    symptoms: "",
    ai_diagnosis: "",
    severity: "medium",
    estimated_cost: "",
    ai_recommendations: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await createDiagnostic({
      user_id: formData.user_id,
      vehicle_make: formData.vehicle_make || undefined,
      vehicle_model: formData.vehicle_model || undefined,
      vehicle_year: formData.vehicle_year,
      symptoms: formData.symptoms,
      ai_diagnosis: formData.ai_diagnosis,
      severity: formData.severity,
      estimated_cost: formData.estimated_cost,
      ai_recommendations: formData.ai_recommendations || undefined,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push("/admin/diagnostics")
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="bg-destructive/10 text-destructive p-4 rounded-lg">{error}</div>}

      {/* Foreign Key Selection - User */}
      <div className="space-y-2">
        <Label htmlFor="user_id">
          Utilizator <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.user_id}
          onValueChange={(value) => setFormData({ ...formData, user_id: value })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Selectează utilizatorul" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.full_name || user.email} ({user.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Selectează utilizatorul pentru care creezi diagnosticarea (Foreign Key)
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vehicle_make">Marcă Vehicul</Label>
          <Input
            id="vehicle_make"
            value={formData.vehicle_make}
            onChange={(e) => setFormData({ ...formData, vehicle_make: e.target.value })}
            placeholder="ex: Toyota"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehicle_model">Model Vehicul</Label>
          <Input
            id="vehicle_model"
            value={formData.vehicle_model}
            onChange={(e) => setFormData({ ...formData, vehicle_model: e.target.value })}
            placeholder="ex: Corolla"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehicle_year">An Vehicul</Label>
          <Input
            id="vehicle_year"
            type="number"
            value={formData.vehicle_year || ""}
            onChange={(e) =>
              setFormData({ ...formData, vehicle_year: e.target.value ? Number.parseInt(e.target.value) : undefined })
            }
            placeholder="ex: 2015"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="symptoms">
          Simptome <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="symptoms"
          value={formData.symptoms}
          onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
          placeholder="Descrie simptomele vehiculului..."
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ai_diagnosis">
          Diagnostic AI <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="ai_diagnosis"
          value={formData.ai_diagnosis}
          onChange={(e) => setFormData({ ...formData, ai_diagnosis: e.target.value })}
          placeholder="Diagnosticul complet generat de AI..."
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="severity">
          Severitate <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.severity}
          onValueChange={(value) => setFormData({ ...formData, severity: value })}
          required
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Scăzută</SelectItem>
            <SelectItem value="medium">Medie</SelectItem>
            <SelectItem value="high">Ridicată</SelectItem>
            <SelectItem value="critical">Critică</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="estimated_cost">
          Cost Estimat <span className="text-destructive">*</span>
        </Label>
        <Input
          id="estimated_cost"
          value={formData.estimated_cost}
          onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
          placeholder="ex: 500-1000 RON"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ai_recommendations">Recomandări AI</Label>
        <Textarea
          id="ai_recommendations"
          value={formData.ai_recommendations}
          onChange={(e) => setFormData({ ...formData, ai_recommendations: e.target.value })}
          placeholder="Recomandări generate de AI..."
          rows={4}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Se creează...
            </>
          ) : (
            "Creare Diagnosticare"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/diagnostics")} disabled={loading}>
          Anulează
        </Button>
      </div>
    </form>
  )
}

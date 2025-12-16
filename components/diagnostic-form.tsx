"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { generateDiagnosis } from "@/app/actions/diagnostic-actions"
import { Loader2, ImageIcon } from "lucide-react"
import DiagnosticResult from "./diagnostic-result"

export default function DiagnosticForm() {
  const [symptoms, setSymptoms] = useState("")
  const [vehicleMake, setVehicleMake] = useState("")
  const [vehicleModel, setVehicleModel] = useState("")
  const [vehicleYear, setVehicleYear] = useState("")
  const [requestImage, setRequestImage] = useState(true) // Added state for image request
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setResult(null)

    const response = await generateDiagnosis({
      symptoms,
      vehicleMake: vehicleMake || undefined,
      vehicleModel: vehicleModel || undefined,
      vehicleYear: vehicleYear ? Number.parseInt(vehicleYear) : undefined,
      requestImage,
    })

    setIsLoading(false)

    if (response.error) {
      setError(response.error)
      if (response.needsUpgrade) {
        // Show upgrade prompt
      }
    } else if (response.success) {
      setResult(response.diagnostic)
      // Clear form
      setSymptoms("")
      setVehicleMake("")
      setVehicleModel("")
      setVehicleYear("")
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Diagnosticare Nouă</CardTitle>
          <CardDescription>Descrieți simptomele mașinii dvs. pentru un diagnostic AI instant</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Marcă (opțional)</Label>
                <Input
                  id="make"
                  placeholder="ex: Toyota"
                  value={vehicleMake}
                  onChange={(e) => setVehicleMake(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model (opțional)</Label>
                <Input
                  id="model"
                  placeholder="ex: Corolla"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">An (opțional)</Label>
                <Input
                  id="year"
                  type="number"
                  placeholder="ex: 2020"
                  value={vehicleYear}
                  onChange={(e) => setVehicleYear(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="symptoms">Simptome *</Label>
              <Textarea
                id="symptoms"
                placeholder="Descrieți problemele pe care le observați: zgomote, vibrații, lumini pe bord, comportament neobișnuit, etc."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                required
                rows={6}
                className="resize-none"
              />
            </div>

            <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
              <Checkbox
                id="requestImage"
                checked={requestImage}
                onCheckedChange={(checked) => setRequestImage(checked as boolean)}
              />
              <Label htmlFor="requestImage" className="cursor-pointer flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                <span>Vreau să văd o imagine cu piesa afectată</span>
              </Label>
            </div>

            {error && <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>}

            <Button type="submit" disabled={isLoading || !symptoms} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Se generează diagnosticul...
                </>
              ) : (
                "Generează Diagnostic"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && <DiagnosticResult result={result} />}
    </>
  )
}

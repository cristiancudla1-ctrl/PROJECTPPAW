"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import Image from "next/image"

interface DiagnosticResultProps {
  result: {
    ai_diagnosis: string
    severity: "low" | "medium" | "high" | "critical"
    estimatedCost?: string
    estimatedCostUSD?: string // Added USD display
    urgency?: string
    recommendations?: string[]
    possibleCauses?: string[]
    preventiveMeasures?: string[]
    remainingDiagnostics?: number | null
    partImageUrl?: string | null // Added image support
    mainPartName?: string
  }
}

const severityConfig = {
  low: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10", label: "Scăzută" },
  medium: { icon: AlertCircle, color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Medie" },
  high: { icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10", label: "Ridicată" },
  critical: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Critică" },
}

export default function DiagnosticResult({ result }: DiagnosticResultProps) {
  const config = severityConfig[result.severity]
  const Icon = config.icon

  return (
    <div className="space-y-6">
      {result.remainingDiagnostics !== null && result.remainingDiagnostics !== undefined && (
        <Card className="border-primary">
          <CardContent className="pt-6">
            <p className="text-center text-sm">
              <span className="font-semibold">{result.remainingDiagnostics}</span> diagnosticări gratuite rămase
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Rezultatul Diagnosticului</CardTitle>
            <Badge className={`${config.bg} ${config.color} border-0`}>
              <Icon className="h-3 w-3 mr-1" />
              Severitate: {config.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Diagnosis */}
          <div>
            <h3 className="font-semibold mb-2">Diagnostic</h3>
            <p className="text-muted-foreground">{result.ai_diagnosis}</p>
          </div>

          {result.partImageUrl && result.mainPartName && (
            <div>
              <h3 className="font-semibold mb-2">Piesa Afectată: {result.mainPartName}</h3>
              <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                <Image
                  src={result.partImageUrl || "/placeholder.svg"}
                  alt={`Diagram pentru ${result.mainPartName}`}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}

          {result.estimatedCost && (
            <div>
              <h3 className="font-semibold mb-2">Cost Estimat</h3>
              <p className="text-2xl font-bold text-primary">{result.estimatedCost}</p>
              {result.estimatedCostUSD && (
                <p className="text-sm text-muted-foreground mt-1">({result.estimatedCostUSD})</p>
              )}
              {result.urgency && <p className="text-sm text-muted-foreground mt-2">{result.urgency}</p>}
            </div>
          )}

          {/* Possible Causes */}
          {result.possibleCauses && result.possibleCauses.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Cauze Posibile</h3>
              <ul className="space-y-1">
                {result.possibleCauses.map((cause, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-1">•</span>
                    <span>{cause}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Recomandări</h3>
              <ol className="space-y-2">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">{index + 1}.</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Preventive Measures */}
          {result.preventiveMeasures && result.preventiveMeasures.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Măsuri Preventive</h3>
              <ul className="space-y-1">
                {result.preventiveMeasures.map((measure, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-1">✓</span>
                    <span>{measure}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

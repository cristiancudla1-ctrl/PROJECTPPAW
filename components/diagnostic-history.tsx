"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserDiagnostics } from "@/app/actions/diagnostic-actions"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { ro } from "date-fns/locale"

export default function DiagnosticHistory() {
  const [diagnostics, setDiagnostics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    const response = await getUserDiagnostics()
    if (response.diagnostics) {
      setDiagnostics(response.diagnostics)
    }
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Istoric Diagnosticări</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Se încarcă...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Istoric Diagnosticări</CardTitle>
        <CardDescription>Diagnosticările dvs. recente</CardDescription>
      </CardHeader>
      <CardContent>
        {diagnostics.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nu aveți încă diagnosticări. Începeți prima diagnosticare mai sus!
          </p>
        ) : (
          <div className="space-y-4">
            {diagnostics.map((diagnostic) => (
              <div key={diagnostic.id} className="border rounded-lg p-4 space-y-2 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    {diagnostic.vehicle_make && (
                      <p className="font-semibold">
                        {diagnostic.vehicle_year} {diagnostic.vehicle_make} {diagnostic.vehicle_model}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2">{diagnostic.symptoms}</p>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {diagnostic.severity}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{diagnostic.estimated_cost}</span>
                  <span>
                    {formatDistanceToNow(new Date(diagnostic.created_at), {
                      addSuffix: true,
                      locale: ro,
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

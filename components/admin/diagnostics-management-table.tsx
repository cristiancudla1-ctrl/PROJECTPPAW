"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Trash2 } from "lucide-react"
import { deleteDiagnostic } from "@/app/actions/admin-crud-actions"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"

interface Diagnostic {
  id: string
  user_id: string
  symptoms: string
  severity: string
  created_at: string
  profiles: {
    id: string
    full_name: string | null
    email: string
  } | null
}

export function DiagnosticsManagementTable({ diagnostics }: { diagnostics: Diagnostic[] }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (diagnosticId: string) => {
    if (
      !confirm(
        "Sigur vrei să ștergi fizic acest diagnostic?\n\nAcesta va fi eliminat permanent din baza de date (HARD DELETE).",
      )
    ) {
      return
    }

    setDeletingId(diagnosticId)
    const result = await deleteDiagnostic(diagnosticId)

    if (result.error) {
      alert(result.error)
    } else if (result.success && result.type === "hard") {
      alert("Diagnostic șters fizic cu succes!")
      router.refresh()
    }

    setDeletingId(null)
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Utilizator</TableHead>
          <TableHead>Simptome</TableHead>
          <TableHead>Severitate</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Acțiuni</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {diagnostics.map((diagnostic) => (
          <TableRow key={diagnostic.id}>
            <TableCell>
              <div>
                <p className="font-medium">{diagnostic.profiles?.full_name || "-"}</p>
                <p className="text-sm text-muted-foreground">{diagnostic.profiles?.email}</p>
              </div>
            </TableCell>
            <TableCell className="max-w-md truncate">{diagnostic.symptoms}</TableCell>
            <TableCell>
              <Badge
                variant={
                  diagnostic.severity === "critical"
                    ? "destructive"
                    : diagnostic.severity === "high"
                      ? "default"
                      : "secondary"
                }
              >
                {diagnostic.severity}
              </Badge>
            </TableCell>
            <TableCell>{new Date(diagnostic.created_at).toLocaleDateString("ro-RO")}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/users/${diagnostic.user_id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(diagnostic.id)}
                  disabled={deletingId === diagnostic.id}
                  title="Ștergere fizică - diagnosticul va fi eliminat permanent"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

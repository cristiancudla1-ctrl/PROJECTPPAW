import { redirect } from "next/navigation"
import { checkIsAdmin } from "@/app/actions/admin-actions"
import { getAllDiagnostics } from "@/app/actions/admin-crud-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DiagnosticsManagementTable } from "@/components/admin/diagnostics-management-table"

export default async function DiagnosticsPage() {
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    redirect("/dashboard")
  }

  const { diagnostics, error } = await getAllDiagnostics(100)

  if (error || !diagnostics) {
    return <div className="p-8">Eroare la încărcarea diagnosticărilor</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Gestionare Diagnosticări</h1>
            <p className="text-muted-foreground">Vizualizare toate diagnosticările utilizatorilor</p>
          </div>
          <div className="flex gap-4">
            <Button asChild variant="default">
              <Link href="/admin/diagnostics/create">+ Creare Diagnosticare</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin">← Înapoi la Admin</Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Toate Diagnosticările ({diagnostics.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <DiagnosticsManagementTable diagnostics={diagnostics} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

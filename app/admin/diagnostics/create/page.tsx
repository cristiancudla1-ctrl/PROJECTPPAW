import { redirect } from "next/navigation"
import { checkIsAdmin } from "@/app/actions/admin-actions"
import { getAllUsers } from "@/app/actions/admin-crud-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DiagnosticCreateForm } from "@/components/admin/diagnostic-create-form"

export default async function CreateDiagnosticPage() {
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    redirect("/dashboard")
  }

  // Fetch all users for the dropdown (foreign key selection)
  const { users, error } = await getAllUsers()

  if (error || !users) {
    return <div className="p-8">Eroare la încărcarea utilizatorilor</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Creare Diagnosticare Nouă</h1>
            <p className="text-muted-foreground">
              Adaugă o diagnosticare manuală pentru un utilizator (Lab 6 - Create cu Foreign Key)
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin/diagnostics">← Înapoi</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Formular Diagnosticare</CardTitle>
          </CardHeader>
          <CardContent>
            <DiagnosticCreateForm users={users} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

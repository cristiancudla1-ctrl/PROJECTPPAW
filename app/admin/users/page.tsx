import { redirect } from "next/navigation"
import { checkIsAdmin } from "@/app/actions/admin-actions"
import { getAllUsers } from "@/app/actions/admin-crud-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UserManagementTable } from "@/components/admin/user-management-table"

export default async function UsersIndexPage() {
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    redirect("/dashboard")
  }

  const { users, error } = await getAllUsers()

  if (error || !users) {
    return <div className="p-8">Eroare la încărcarea utilizatorilor</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Gestionare Utilizatori</h1>
            <p className="text-muted-foreground">Index - Vizualizare toți utilizatorii</p>
          </div>
          <Button asChild>
            <Link href="/admin">← Înapoi la Admin</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Toți Utilizatorii ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <UserManagementTable users={users} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

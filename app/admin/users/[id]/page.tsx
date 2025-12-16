import { redirect } from "next/navigation"
import { checkIsAdmin } from "@/app/actions/admin-actions"
import { getUserDetails } from "@/app/actions/admin-crud-actions"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UserDetailsView } from "@/components/admin/user-details-view"
import { UserEditForm } from "@/components/admin/user-edit-form"

export default async function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    redirect("/dashboard")
  }

  const { user, error } = await getUserDetails(id)

  if (error || !user) {
    return <div className="p-8">Eroare la încărcarea detaliilor utilizatorului</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Detalii Utilizator</h1>
            <p className="text-muted-foreground">Details & Edit - Vizualizare și editare utilizator</p>
          </div>
          <Button asChild>
            <Link href="/admin/users">← Înapoi la Utilizatori</Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <UserDetailsView user={user} />

          <UserEditForm user={user} />
        </div>
      </div>
    </div>
  )
}

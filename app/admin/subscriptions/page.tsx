import { redirect } from "next/navigation"
import { checkIsAdmin } from "@/app/actions/admin-actions"
import { getAllSubscriptions } from "@/app/actions/admin-crud-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SubscriptionManagementTable } from "@/components/admin/subscription-management-table"

export default async function SubscriptionsPage() {
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    redirect("/dashboard")
  }

  const { subscriptions, error } = await getAllSubscriptions()

  if (error || !subscriptions) {
    return <div className="p-8">Eroare la încărcarea abonamentelor</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Gestionare Abonamente</h1>
            <p className="text-muted-foreground">Vizualizare și editare abonamente utilizatori</p>
          </div>
          <Button asChild>
            <Link href="/admin">← Înapoi la Admin</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Toate Abonamentele ({subscriptions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionManagementTable subscriptions={subscriptions} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

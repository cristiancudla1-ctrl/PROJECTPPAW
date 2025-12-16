import { redirect } from "next/navigation"
import { checkIsAdmin } from "@/app/actions/admin-actions"
import { getAdminStats } from "@/app/actions/admin-crud-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, TrendingUp, CreditCard } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminDashboard() {
  const isAdmin = await checkIsAdmin()

  if (!isAdmin) {
    redirect("/dashboard")
  }

  const { stats, error } = await getAdminStats()

  if (error || !stats) {
    return <div className="p-8">Eroare la încărcarea statisticilor</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Panou de Administrare</h1>
          <p className="text-muted-foreground">Gestionează utilizatori, abonamente și diagnosticări</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Utilizatori</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Diagnosticări</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDiagnostics}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Diagnosticări (7 zile)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentDiagnostics}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Abonamente Active</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.subscriptionStats.standard + stats.subscriptionStats.premium}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Distribuție Abonamente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Free Trial</span>
                <span className="text-2xl font-bold">{stats.subscriptionStats.free}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Standard</span>
                <span className="text-2xl font-bold">{stats.subscriptionStats.standard}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Premium</span>
                <span className="text-2xl font-bold">{stats.subscriptionStats.premium}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Button asChild size="lg" className="h-24">
            <Link href="/admin/users">
              <div className="flex flex-col items-center gap-2">
                <Users className="h-6 w-6" />
                <span>Gestionează Utilizatori</span>
              </div>
            </Link>
          </Button>

          <Button asChild size="lg" variant="outline" className="h-24 bg-transparent">
            <Link href="/admin/subscriptions">
              <div className="flex flex-col items-center gap-2">
                <CreditCard className="h-6 w-6" />
                <span>Gestionează Abonamente</span>
              </div>
            </Link>
          </Button>

          <Button asChild size="lg" variant="outline" className="h-24 bg-transparent">
            <Link href="/admin/diagnostics">
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-6 w-6" />
                <span>Vezi Diagnosticări</span>
              </div>
            </Link>
          </Button>
        </div>

        <div className="mt-8">
          <Button asChild variant="ghost">
            <Link href="/dashboard">← Înapoi la Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

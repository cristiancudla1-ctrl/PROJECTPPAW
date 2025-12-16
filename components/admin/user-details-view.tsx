import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface UserDetailsProps {
  user: {
    id: string
    email: string
    full_name: string | null
    is_admin: boolean
    created_at: string
    subscriptions: Array<{
      tier: string
      is_active: boolean
      free_diagnostics_used: number
      free_diagnostics_limit: number
      subscription_start_date: string | null
      subscription_end_date: string | null
    }> | null
    diagnostics: Array<{
      id: string
      created_at: string
      symptoms: string
    }> | null
  }
}

export function UserDetailsView({ user }: UserDetailsProps) {
  const subscription = user.subscriptions?.[0]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informații Utilizator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <p className="text-lg">{user.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Nume Complet</label>
            <p className="text-lg">{user.full_name || "-"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Rol</label>
            <div className="mt-1">
              {user.is_admin ? <Badge>Administrator</Badge> : <Badge variant="secondary">Utilizator</Badge>}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Data Înregistrare</label>
            <p className="text-lg">{new Date(user.created_at).toLocaleDateString("ro-RO")}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Abonament</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Tier</label>
            <div className="mt-1">
              <Badge variant={subscription?.tier === "premium" ? "default" : "secondary"}>
                {subscription?.tier || "free"}
              </Badge>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <div className="mt-1">
              <Badge variant={subscription?.is_active ? "default" : "destructive"}>
                {subscription?.is_active ? "Activ" : "Inactiv"}
              </Badge>
            </div>
          </div>
          {subscription?.tier === "free" && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Diagnosticări Folosite</label>
              <p className="text-lg">
                {subscription.free_diagnostics_used} / {subscription.free_diagnostics_limit}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Diagnosticări</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{user.diagnostics?.length || 0}</p>
          <p className="text-sm text-muted-foreground">Total diagnosticări efectuate</p>
        </CardContent>
      </Card>
    </div>
  )
}

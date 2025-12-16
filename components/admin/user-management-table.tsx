"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Eye, Trash2 } from "lucide-react"
import { deleteUser } from "@/app/actions/admin-crud-actions"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface User {
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
  }> | null
}

export const UserManagementTable = ({ users }: { users: User[] }) => {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (userId: string, email: string) => {
    if (
      !confirm(
        `Sigur vrei să ștergi logic utilizatorul ${email}?\n\nAcesta va fi marcat ca șters dar va rămâne în baza de date pentru istoric.`,
      )
    ) {
      return
    }

    setDeletingId(userId)
    const result = await deleteUser(userId)

    if (result.error) {
      alert(result.error)
    } else if (result.success && result.type === "soft") {
      alert("Utilizator șters logic cu succes!")
      router.refresh()
    }

    setDeletingId(null)
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Nume</TableHead>
          <TableHead>Tier</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Admin</TableHead>
          <TableHead>Acțiuni</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const subscription = user.subscriptions?.[0]
          return (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.email}</TableCell>
              <TableCell>{user.full_name || "-"}</TableCell>
              <TableCell>
                <Badge variant={subscription?.tier === "premium" ? "default" : "secondary"}>
                  {subscription?.tier || "free"}
                </Badge>
              </TableCell>
              <TableCell>
                {subscription?.tier === "free" ? (
                  <span className="text-sm text-muted-foreground">
                    {subscription.free_diagnostics_used}/{subscription.free_diagnostics_limit}
                  </span>
                ) : (
                  <Badge variant={subscription?.is_active ? "default" : "destructive"}>
                    {subscription?.is_active ? "Activ" : "Inactiv"}
                  </Badge>
                )}
              </TableCell>
              <TableCell>{user.is_admin ? <Badge>Admin</Badge> : "-"}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/users/${user.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(user.id, user.email)}
                    disabled={deletingId === user.id}
                    title="Ștergere logică - utilizatorul va fi marcat ca șters"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

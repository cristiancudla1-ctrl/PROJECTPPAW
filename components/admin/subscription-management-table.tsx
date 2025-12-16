"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Eye } from "lucide-react"

interface Subscription {
  user_id: string
  tier: string
  is_active: boolean
  free_diagnostics_used: number
  free_diagnostics_limit: number
  created_at: string
  profiles: {
    id: string
    full_name: string | null
    email: string
  } | null
}

export function SubscriptionManagementTable({ subscriptions }: { subscriptions: Subscription[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Utilizator</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Tier</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Utilizare</TableHead>
          <TableHead>Acțiuni</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subscriptions.map((sub) => (
          <TableRow key={sub.user_id}>
            <TableCell className="font-medium">{sub.profiles?.full_name || "-"}</TableCell>
            <TableCell>{sub.profiles?.email}</TableCell>
            <TableCell>
              <Badge variant={sub.tier === "premium" ? "default" : "secondary"}>{sub.tier}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={sub.is_active ? "default" : "destructive"}>{sub.is_active ? "Activ" : "Inactiv"}</Badge>
            </TableCell>
            <TableCell>
              {sub.tier === "free" ? (
                <span className="text-sm">
                  {sub.free_diagnostics_used}/{sub.free_diagnostics_limit}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">Nelimitat</span>
              )}
            </TableCell>
            <TableCell>
              <Button asChild size="sm" variant="outline">
                <Link href={`/admin/users/${sub.user_id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  Vezi Detalii
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

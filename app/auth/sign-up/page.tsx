"use client"

import type React from "react"

import { signUp } from "@/app/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"

export default function SignUpPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      const result = await signUp(formData)
      if (result?.error) {
        setError(result.error)
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "A apărut o eroare")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Înregistrare</CardTitle>
            <CardDescription>Creați un cont nou</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Nume complet</Label>
                  <Input id="fullName" name="fullName" type="text" placeholder="Ion Popescu" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="exemplu@email.com" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Parolă</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="repeatPassword">Repetă parola</Label>
                  <Input id="repeatPassword" name="repeatPassword" type="password" required />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Se creează contul..." : "Înregistrare"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Aveți deja cont?{" "}
                <Link href="/auth/login" className="underline underline-offset-4">
                  Conectare
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cancelSubscription } from "@/app/actions/stripe-actions"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function CancelSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleCancel = async () => {
    setIsLoading(true)
    setError(null)

    const result = await cancelSubscription()

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    } else if (result.success) {
      router.refresh()
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          Anulează Abonamentul
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sigur doriți să anulați?</AlertDialogTitle>
          <AlertDialogDescription>
            Această acțiune va anula abonamentul dvs. și veți reveni la planul gratuit cu 15 diagnosticări. Puteți
            reface abonamentul oricând.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <div className="text-sm text-destructive">{error}</div>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Renunță</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Se anulează...
              </>
            ) : (
              "Da, anulează"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

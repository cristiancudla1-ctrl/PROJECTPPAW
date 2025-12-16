"use client"

import { useCallback, useState } from "react"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { Button } from "@/components/ui/button"
import { startCheckoutSession } from "@/app/actions/stripe-actions"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutButton({ productId }: { productId: string }) {
  const [isOpen, setIsOpen] = useState(false)

  const fetchClientSecret = useCallback(() => startCheckoutSession(productId), [productId])

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="w-full">
        Selectează Acest Plan
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Finalizare Abonament</DialogTitle>
            <DialogDescription>Completați informațiile de plată pentru a activa abonamentul</DialogDescription>
          </DialogHeader>
          <div id="checkout">
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Vă mulțumim pentru înregistrare!</CardTitle>
            <CardDescription>Verificați email-ul pentru confirmare</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              V-ați înregistrat cu succes. Vă rugăm să verificați email-ul pentru a vă confirma contul înainte de a vă
              conecta.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

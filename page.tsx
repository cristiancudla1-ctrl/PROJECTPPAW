import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Zap, Shield, Clock } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">Diagnosticare Auto AI</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Obțineți diagnostice auto instant cu inteligență artificială. Economisiți timp și bani cu analize precise ale
          problemelor mașinii dvs.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/auth/sign-up">Începeți Acum</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/login">Autentificare</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">De ce să alegeți serviciul nostru?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Rapid și Precis</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Diagnostice instant bazate pe AI cu acuratețe ridicată</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Sigur și Confidențial</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Datele dvs. sunt protejate cu cele mai înalte standarde de securitate</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>24/7 Disponibil</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Accesați diagnostice oricând, oriunde, fără programări</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Check className="h-10 w-10 mb-2 text-primary" />
              <CardTitle>Recomandări Expert</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Primiți sugestii detaliate de reparații și costuri estimate</CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Planuri de Abonament</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription className="text-3xl font-bold">0 RON</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>5 diagnostice / lună</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Rapoarte de bază</span>
                </li>
              </ul>
              <Button asChild className="w-full mt-6 bg-transparent" variant="outline">
                <Link href="/auth/sign-up">Începeți Gratuit</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary shadow-lg">
            <CardHeader>
              <CardTitle>Standard</CardTitle>
              <CardDescription className="text-3xl font-bold">49 RON / lună</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>50 diagnostice / lună</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Rapoarte detaliate</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Istoric complet</span>
                </li>
              </ul>
              <Button asChild className="w-full mt-6">
                <Link href="/auth/sign-up">Alegeți Standard</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Premium</CardTitle>
              <CardDescription className="text-3xl font-bold">99 RON / lună</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Diagnostice nelimitate</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Analiza avansată AI</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>Suport prioritar</span>
                </li>
              </ul>
              <Button asChild className="w-full mt-6">
                <Link href="/auth/sign-up">Alegeți Premium</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Diagnosticare Auto AI. Toate drepturile rezervate.</p>
        </div>
      </footer>
    </div>
  )
}

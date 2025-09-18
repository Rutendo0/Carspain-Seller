import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from "next/dynamic"

// Load client component only on the client to avoid server client-reference manifest
const ClientHome = dynamic(() => import("./client-home"), { ssr: false })

// This page imports a client component; ensure it’s dynamic to generate client references
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default function HomePage() {
  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-accent/40 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8 text-center">
          <div>
            <span className="inline-block rounded-full bg-accent text-accent-foreground px-3 py-1 text-xs font-semibold tracking-wide">Carspian Seller</span>
            <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-foreground">
              Welcome to <span className="text-primary">Carspian Seller</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Sell your auto parts on our marketplace. Get started by creating an account.
            </p>
          </div>
          <Card className="mx-auto max-w-xl border-0 shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Get Started</CardTitle>
              <CardDescription>Join thousands of sellers today.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Button asChild size="lg" className="w-full">
                <Link href="/register">Register</Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="w-full">
                <Link href="/sign-in">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <ClientHome />
    </>
  )
}
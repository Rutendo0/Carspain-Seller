"use client"

import Link from "next/link"
import { useAuth } from "@/providers/auth-context"
import { useStoreModal } from "@/hooks/use-store-modal"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  const { user: isSignedIn, loading, signOut } = useAuth()
  const storeModal = useStoreModal()
  const router = useRouter()
  const [checkingStore, setCheckingStore] = useState(false)

  useEffect(() => {
    const checkStore = async () => {
      if (!loading && isSignedIn && !checkingStore) {
        setCheckingStore(true)
        try {
          const response = await fetch('/api/stores', { credentials: 'include' })
          if (response.status === 401) {
            // Session invalid, sign out
            await signOut()
            return
          } else if (!response.ok) {
            let errorData;
            try {
              errorData = await response.json();
            } catch (e) {
              errorData = { message: response.statusText };
            }
            console.error('Failed to fetch store:', errorData);
            storeModal.onOpen()
            setCheckingStore(false)
            return
          }
          const data = await response.json()
          if (data.store) {
            router.push(`/${data.store.id}`)
          } else {
            storeModal.onOpen()
          }
        } catch (error) {
          console.error('Error checking store:', error)
          storeModal.onOpen()
        } finally {
          setCheckingStore(false)
        }
      }
    }

    checkStore()
  }, [isSignedIn, loading, checkingStore, router, storeModal])

  if (loading || checkingStore) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (isSignedIn) {
    return null // Will redirect or open modal
  }

  return (
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
  )
}
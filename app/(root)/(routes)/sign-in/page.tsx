"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/providers/auth-context"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { Eye, EyeOff } from "lucide-react"
import { signInWithEmailAndPassword, sendEmailVerification, onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { z } from "zod"

const formSchema = z.object({
  email: z.string().email("Invalid email."),
  password: z.string().min(1, "Password is required."),
})

type FormValues = z.infer<typeof formSchema>

export default function SignInPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })


  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password)
      const idToken = await userCredential.user.getIdToken()

      const sessionResponse = await fetch('/api/auth/set-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!sessionResponse.ok) {
        throw new Error('Failed to set session')
      }

      // Ensure cookie is set before fetching protected APIs
      await new Promise((r) => setTimeout(r, 50))

      toast.success("Signed in successfully!")

      router.replace("/")
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        toast.error("No user found with this email.")
      } else if (error.code === "auth/wrong-password") {
        toast.error("Invalid password.")
      } else if (error.code === "auth/email-not-verified") {
        await sendEmailVerification(auth.currentUser!)
        toast.error("Please verify your email before signing in.")
      } else {
        toast.error("Sign in failed. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-accent/40 py-16 px-4 sm:px-6 lg:px-8">
      <Card className="mx-auto max-w-md w-full border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>Enter your email and password to sign in.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <FormControl>
                      <Input id="email" placeholder="john@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="password"
                          placeholder="Password"
                          type={showPassword ? "text" : "password"}
                          className="pr-10"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword((prev) => !prev)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="w-full" size="lg" type="submit" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Register here
            </Link>
          </div>
          <div className="mt-2 text-center text-sm">
            <Link href="/forgot-password" className="font-semibold text-primary hover:underline">
              Forgot your password?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
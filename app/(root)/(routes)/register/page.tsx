"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-context"
import { toast } from "react-hot-toast"
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth"
import { auth } from "@/lib/firebase"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff } from "lucide-react"
import { z } from "zod"

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export type RegistrationFormValues = z.infer<typeof formSchema>

export default function RegisterPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState("")

  useEffect(() => {
    if (!loading && user) {
      router.push("/")
    }
  }, [user, loading, router])

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  })

  const strength = useMemo(() => {
    // Simple password strength estimator
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return score
  }, [password])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const onSubmit = async (values: RegistrationFormValues) => {
    try {
      setIsLoading(true)
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password)
      const user = userCredential.user
      await updateProfile(user, {
        displayName: `${values.firstName} ${values.lastName}`
      })
      
      await sendEmailVerification(user)
      
      const idToken = await user.getIdToken()
      
      const sessionResponse = await fetch('/api/auth/set-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!sessionResponse.ok) {
        throw new Error('Failed to set session')
      }

      toast.success("Account created! Please check your email to verify your account.")
      router.push("/sign-in?registered=true")
    } catch (err: any) {
      console.error('Register error:', err);
      const code = err?.code || err?.error?.message || '';
      if (code === 'auth/email-already-in-use') {
        toast.error("Email already in use. Please use a different email.")
      } else if (code === 'auth/weak-password') {
        toast.error("Password is too weak. Please choose a stronger password.")
      } else if (code === 'auth/operation-not-allowed') {
        toast.error("Email/Password sign-in is disabled in Firebase. Enable it in Firebase Console > Authentication > Sign-in method.")
      } else if (code === 'auth/invalid-api-key') {
        toast.error("Invalid Firebase API key. Check NEXT_PUBLIC_FIREBASE_API_KEY.")
      } else if (code === 'auth/invalid-email') {
        toast.error("Invalid email address.")
      } else {
        toast.error(err?.message || "Something went wrong. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-accent/40 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-semibold text-primary hover:underline">Sign in</Link>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            <Link href="/forgot-password" className="font-semibold text-primary hover:underline">Forgot your password?</Link>
          </p>
        </div>
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Register</CardTitle>
            <CardDescription>Enter your details to get started.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }: { field: import("react-hook-form").ControllerRenderProps<RegistrationFormValues, "password"> }) => (
                      <FormItem>
                        <FormLabel>First name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }: { field: import("react-hook-form").ControllerRenderProps<RegistrationFormValues, "lastName"> }) => (
                      <FormItem>
                        <FormLabel>Last name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }: { field: import("react-hook-form").ControllerRenderProps<RegistrationFormValues, "email"> }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e)
                                setPassword(e.target.value)
                              }}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(prev => !prev)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          {/* Password strength meter */}
                          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                strength <= 1 ? 'w-1/4 bg-red-500' : strength === 2 ? 'w-1/2 bg-yellow-500' : strength === 3 ? 'w-3/4 bg-green-500' : 'w-full bg-emerald-600'
                              }`}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Use at least 8 characters, including uppercase, number, and symbol.
                          </p>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
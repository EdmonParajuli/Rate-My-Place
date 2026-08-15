import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth/AuthContext"
import { signInSchema, type SignInValues } from "./authSchemas"

export function SignInForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({ resolver: zodResolver(signInSchema) })

  const onSubmit = async (values: SignInValues) => {
    setServerError(null)
    try {
      const loggedInUser = await login(values)
      navigate(loggedInUser?.userType === "BUSINESS" ? "/app/dashboard" : "/app")
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Sign in failed")
    }
  }

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">Welcome back</h2>
      <p className="mb-6 text-sm text-slate-500">Sign in to continue.</p>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <Label htmlFor="signin-email" className="mb-1 text-xs font-semibold text-slate-600">
            Email
          </Label>
          <Input id="signin-email" type="email" placeholder="you@example.com" {...register("email")} />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div>
          <Label htmlFor="signin-password" className="mb-1 text-xs font-semibold text-slate-600">
            Password
          </Label>
          <Input id="signin-password" type="password" placeholder="••••••••" {...register("password")} />
          {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
        </div>
        {serverError && <p className="text-xs text-destructive">{serverError}</p>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </div>
  )
}

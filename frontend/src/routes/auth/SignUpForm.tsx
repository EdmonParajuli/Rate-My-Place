import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"
import { Check, User, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/lib/auth/AuthContext"
import { useCategoriesQuery } from "@/lib/graphql/generated/graphql"
import { signUpAccountSchema, businessDetailsSchema, type SignUpAccountValues, type BusinessDetailsValues } from "./authSchemas"

type UserTypeChoice = "REGULAR" | "BUSINESS"

// Choosing BUSINESS expands signup into a second step (place details),
// submitted together via signUpBusiness - not two chained calls - so a
// BUSINESS-type user is never left without a place if they drop off between
// steps. See docs/03-architecture.md's signUpBusiness section.
// onSuccess: same reasoning as SignInForm's - lets the QR scan flow's auth
// modal (ticket 03) reuse this form without navigating away.
export function SignUpForm({ initialUserType, onSuccess }: { initialUserType?: UserTypeChoice; onSuccess?: () => void }) {
  const { signUp, signUpBusiness } = useAuth()
  const navigate = useNavigate()
  const [userType, setUserType] = useState<UserTypeChoice>(initialUserType ?? "REGULAR")
  const [step, setStep] = useState<1 | 2>(1)
  const [accountValues, setAccountValues] = useState<SignUpAccountValues | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const accountForm = useForm<SignUpAccountValues>({ resolver: zodResolver(signUpAccountSchema) })
  const businessForm = useForm<BusinessDetailsValues>({
    resolver: zodResolver(businessDetailsSchema),
    defaultValues: { label: "", address: "", phone: "", website: "", description: "" },
  })
  const { data: categoriesData } = useCategoriesQuery({ skip: userType !== "BUSINESS" })

  const onAccountSubmit = async (values: SignUpAccountValues) => {
    setServerError(null)
    if (userType === "BUSINESS") {
      setAccountValues(values)
      setStep(2)
      return
    }
    try {
      await signUp({ name: values.name, email: values.email, password: values.password, userType: "REGULAR" })
      if (onSuccess) {
        onSuccess()
      } else {
        navigate("/app")
      }
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Sign up failed")
    }
  }

  const onBusinessSubmit = async (values: BusinessDetailsValues) => {
    if (!accountValues) return
    setServerError(null)
    try {
      await signUpBusiness({
        name: accountValues.name,
        email: accountValues.email,
        password: accountValues.password,
        label: values.label,
        description: values.description || undefined,
        address: values.address,
        phone: values.phone,
        website: values.website || undefined,
        categoryId: values.categoryId,
        priceRange: values.priceRange,
      })
      if (onSuccess) {
        onSuccess()
      } else {
        navigate("/app/dashboard")
      }
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Sign up failed")
    }
  }

  if (step === 2) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setStep(1)}
          className="mb-4 flex cursor-pointer items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
        >
          ← Back
        </button>
        <h2 className="mb-1 text-2xl font-bold">List your business</h2>
        <p className="mb-6 text-sm text-slate-500">Claim your place and start managing reviews.</p>
        <form className="space-y-4" onSubmit={businessForm.handleSubmit(onBusinessSubmit)} noValidate>
          <div>
            <Label htmlFor="biz-label" className="mb-1 text-xs font-semibold text-slate-600">
              Place name
            </Label>
            <Input id="biz-label" placeholder="Jane's Diner" {...businessForm.register("label")} />
            {businessForm.formState.errors.label && (
              <p className="mt-1 text-xs text-destructive">{businessForm.formState.errors.label.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="biz-category" className="mb-1 text-xs font-semibold text-slate-600">
              Category
            </Label>
            <Controller
              control={businessForm.control}
              name="categoryId"
              render={({ field }) => (
                <Select value={field.value ? String(field.value) : undefined} onValueChange={(v) => field.onChange(Number(v))}>
                  <SelectTrigger id="biz-category" className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesData?.categories?.data?.filter(Boolean).map((category) => (
                      <SelectItem key={category!.id!} value={String(category!.id)}>
                        {category!.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {businessForm.formState.errors.categoryId && (
              <p className="mt-1 text-xs text-destructive">{businessForm.formState.errors.categoryId.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="biz-address" className="mb-1 text-xs font-semibold text-slate-600">
              Address
            </Label>
            <Input id="biz-address" placeholder="123 Main St" {...businessForm.register("address")} />
            {businessForm.formState.errors.address && (
              <p className="mt-1 text-xs text-destructive">{businessForm.formState.errors.address.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="biz-phone" className="mb-1 text-xs font-semibold text-slate-600">
              Phone
            </Label>
            <Input id="biz-phone" placeholder="+1 555 123 4567" {...businessForm.register("phone")} />
            {businessForm.formState.errors.phone && (
              <p className="mt-1 text-xs text-destructive">{businessForm.formState.errors.phone.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="biz-website" className="mb-1 text-xs font-semibold text-slate-600">
              Website (optional)
            </Label>
            <Input id="biz-website" placeholder="janesdiner.com" {...businessForm.register("website")} />
          </div>
          <div>
            <Label htmlFor="biz-price" className="mb-1 text-xs font-semibold text-slate-600">
              Price range (optional)
            </Label>
            <Controller
              control={businessForm.control}
              name="priceRange"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="biz-price" className="w-full">
                    <SelectValue placeholder="Select a price range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">$</SelectItem>
                    <SelectItem value="MEDIUM">$$</SelectItem>
                    <SelectItem value="HIGH">$$$</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {serverError && <p className="text-xs text-destructive">{serverError}</p>}
          <Button type="submit" className="w-full" disabled={businessForm.formState.isSubmitting}>
            {businessForm.formState.isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">Create your account</h2>
      <p className="mb-6 text-sm text-slate-500">Start reviewing or list your place.</p>
      <div className="mb-5 grid grid-cols-2 gap-3">
        <TypeCard
          active={userType === "REGULAR"}
          color="blue"
          icon={<User className="h-5 w-5" />}
          title="Reviewer"
          description="Discover & review places"
          onClick={() => setUserType("REGULAR")}
        />
        <TypeCard
          active={userType === "BUSINESS"}
          color="emerald"
          icon={<Building2 className="h-5 w-5" />}
          title="Business owner"
          description="List & manage your place"
          onClick={() => setUserType("BUSINESS")}
        />
      </div>
      <form className="space-y-4" onSubmit={accountForm.handleSubmit(onAccountSubmit)} noValidate>
        <div>
          <Label htmlFor="signup-name" className="mb-1 text-xs font-semibold text-slate-600">
            Full name
          </Label>
          <Input id="signup-name" placeholder="Jamie Rivera" {...accountForm.register("name")} />
          {accountForm.formState.errors.name && (
            <p className="mt-1 text-xs text-destructive">{accountForm.formState.errors.name.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="signup-email" className="mb-1 text-xs font-semibold text-slate-600">
            Email
          </Label>
          <Input id="signup-email" type="email" placeholder="you@example.com" {...accountForm.register("email")} />
          {accountForm.formState.errors.email && (
            <p className="mt-1 text-xs text-destructive">{accountForm.formState.errors.email.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="signup-password" className="mb-1 text-xs font-semibold text-slate-600">
            Password
          </Label>
          <Input id="signup-password" type="password" placeholder="••••••••" {...accountForm.register("password")} />
          {accountForm.formState.errors.password && (
            <p className="mt-1 text-xs text-destructive">{accountForm.formState.errors.password.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="signup-confirm" className="mb-1 text-xs font-semibold text-slate-600">
            Confirm password
          </Label>
          <Input id="signup-confirm" type="password" placeholder="••••••••" {...accountForm.register("confirmPassword")} />
          {accountForm.formState.errors.confirmPassword && (
            <p className="mt-1 text-xs text-destructive">{accountForm.formState.errors.confirmPassword.message}</p>
          )}
        </div>
        {serverError && <p className="text-xs text-destructive">{serverError}</p>}
        <Button type="submit" className="w-full" disabled={accountForm.formState.isSubmitting}>
          {userType === "BUSINESS"
            ? "Continue"
            : accountForm.formState.isSubmitting
              ? "Creating account..."
              : "Create account"}
        </Button>
      </form>
    </div>
  )
}

function TypeCard({
  active,
  color,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean
  color: "blue" | "emerald"
  icon: React.ReactNode
  title: string
  description: string
  onClick: () => void
}) {
  const activeClasses =
    color === "blue"
      ? "border-primary bg-blue-50 shadow-[0_6px_16px_rgba(37,99,235,0.18)]"
      : "border-emerald-500 bg-emerald-50 shadow-[0_6px_16px_rgba(16,185,129,0.18)]"
  const iconClasses = color === "blue" ? "bg-blue-100 text-primary" : "bg-emerald-100 text-emerald-600"
  const checkClasses = color === "blue" ? "bg-primary" : "bg-emerald-500"

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative cursor-pointer rounded-[14px] border-2 p-3.5 text-left transition-all hover:-translate-y-0.5 ${
        active ? activeClasses : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <span
        className={`absolute top-2.5 right-2.5 flex h-[18px] w-[18px] items-center justify-center rounded-full text-white transition-all ${
          active ? `${checkClasses} scale-100 opacity-100` : "scale-50 bg-slate-400 opacity-0"
        }`}
      >
        <Check className="h-3 w-3" />
      </span>
      <div className={`flex h-9 w-9 items-center justify-center rounded-[10px] ${iconClasses}`}>{icon}</div>
      <h4 className="mt-2.5 text-sm font-bold">{title}</h4>
      <p className="mt-0.5 text-xs text-slate-500">{description}</p>
    </button>
  )
}

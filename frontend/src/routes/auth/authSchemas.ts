import { z } from "zod"

// Mirrors backend/src/validators/authValidators.ts and placeValidators.ts
// exactly (field-by-field) so client-side rejections match what the server
// would also reject - not a replacement for server validation, just a fast
// first pass. "Confirm password" is a client-only UX convention, never sent
// to any mutation.

const nameSchema = z
  .string()
  .trim()
  .min(2, "Name should be at least 2 characters")
  .max(25, "Name should be at most 25 characters")
  .regex(/^[a-zA-Z][\w\s]*[a-zA-Z]$/, "Name should contain only letters")

const emailSchema = z.string().trim().min(1, "Email is required").email("Enter a valid email")

const passwordSchema = z
  .string()
  .min(8, "Password should be at least 8 characters")
  .max(64, "Password should be at most 64 characters")

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
})
export type SignInValues = z.infer<typeof signInSchema>

export const signUpAccountSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
export type SignUpAccountValues = z.infer<typeof signUpAccountSchema>

// backend/src/validators/authValidators.ts's signUpBusinessSchema place
// fields - address's 25-char max is the real backend constraint, short as
// it is.
export const businessDetailsSchema = z
  .object({
    label: z
      .string()
      .trim()
      .min(2, "Place name should be at least 2 characters")
      .max(100, "Place name should be at most 100 characters")
      .regex(/^[a-zA-Z0-9\s,'.-]+$/, "Place name should contain only alphanumeric characters"),
    description: z
      .string()
      .trim()
      .min(10, "Description should be at least 10 characters")
      .max(255, "Description should be at most 255 characters")
      .optional()
      .or(z.literal("")),
    address: z
      .string()
      .trim()
      .min(10, "Address should be at least 10 characters")
      .max(25, "Address should be at most 25 characters")
      .regex(/^[a-zA-Z0-9\s,'.-]+$/, "Address should contain only alphanumeric characters"),
    phone: z
      .string()
      .trim()
      .min(7, "Phone number should be at least 7 numbers")
      .max(16, "Phone number should be at most 16 characters")
      .regex(/^[+]{1}(?:[0-9\-()/.]\s?){6,15}[0-9]{1}$/, "Invalid phone number - include country code, e.g. +1..."),
    website: z.string().trim().optional().or(z.literal("")),
    // Plain z.number(), not z.coerce.number() - the Controller-bound Select
    // (see SignUpForm.tsx) already passes a real number via
    // field.onChange(Number(v)), and z.coerce's input type is `unknown` by
    // design, which fights zodResolver's Resolver<T> typing against
    // useForm<BusinessDetailsValues>.
    categoryId: z.number({ error: "Category is required" }),
    priceRange: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    // Set via LocationPicker (map click/drag or "Turn on location"), not
    // typed in - optional at the field level so a not-yet-picked location
    // reports through the refine below with one clear message anchored to
    // the map, rather than two separate "required" errors on load.
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  })
  .refine((data) => typeof data.latitude === "number" && typeof data.longitude === "number", {
    message: "Mark your place's location on the map before continuing.",
    path: ["latitude"],
  })
export type BusinessDetailsValues = z.infer<typeof businessDetailsSchema>

import { z } from 'zod'

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(100, 'Password must not exceed 100 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')

export const signUpObject = z.object({
  username: z
    .string()
    .min(3)
    .toLowerCase()
    .trim()
    .regex(/^[a-zA-Z0-9]+$/),
  email: z.string().email().toLowerCase().trim(),
  password: passwordSchema,
})

export const signInObject = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: passwordSchema,
})

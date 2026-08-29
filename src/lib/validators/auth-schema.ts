import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(1024),
})

export const userCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12).max(1024),
  is_superuser: z.boolean().default(false),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type UserCreateFormValues = z.infer<typeof userCreateSchema>

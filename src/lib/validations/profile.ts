import { z } from 'zod'

export const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(64, 'Name is too long'),
  email: z.string().email('Invalid email address'),
})

export type ProfileFormData = z.infer<typeof profileSchema>

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export type PasswordFormData = z.infer<typeof passwordSchema>

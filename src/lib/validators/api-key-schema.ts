import { z } from 'zod'

const API_KEY_SCOPES = ['read-only', 'read-write'] as const

export const apiKeyCreateSchema = z.object({
  name: z.string().min(1).max(255),
  scope: z.enum(API_KEY_SCOPES).default('read-write'),
})

export const apiKeyUpdateSchema = z.object({
  name: z.string().min(1).max(255).nullable().optional(),
  scope: z.enum(API_KEY_SCOPES).nullable().optional(),
  is_active: z.boolean().nullable().optional(),
  expires_at: z.string().datetime().nullable().optional(),
})

export type ApiKeyCreateFormValues = z.infer<typeof apiKeyCreateSchema>
export type ApiKeyUpdateFormValues = z.infer<typeof apiKeyUpdateSchema>

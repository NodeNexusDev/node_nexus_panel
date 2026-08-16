import { z } from 'zod'

export const addNodeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(64, 'Name is too long'),
  ip: z.string().regex(/^(\d{1,3}\.){3}\d{1,3}$/, 'Invalid IP address'),
  port: z.number().int().min(1).max(65535).optional(),
})

export type AddNodeFormData = z.infer<typeof addNodeSchema>

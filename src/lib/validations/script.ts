import { z } from 'zod'

export const scriptSchema = z.object({
  name: z.string().min(1, 'Name is required').max(64, 'Name is too long'),
  description: z.string().max(256, 'Description is too long').optional(),
  content: z.string().min(1, 'Script content is required'),
  schedule: z.string().optional(),
})

export type ScriptFormData = z.infer<typeof scriptSchema>

import { z } from 'zod'

export const commandSchema = z.object({
  command: z.string().min(1, 'Command is required').max(1024, 'Command is too long'),
  nodeId: z.string().min(1, 'Select a target'),
})

export type CommandFormData = z.infer<typeof commandSchema>

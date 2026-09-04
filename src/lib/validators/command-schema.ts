import { z } from 'zod'

const PARAMETER_TYPES = ['string', 'integer', 'boolean'] as const

export const commandParameterSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
  type: z.enum(PARAMETER_TYPES).default('string'),
  required: z.boolean().default(true),
  default: z.union([z.string(), z.number(), z.boolean(), z.record(z.string(), z.any()), z.array(z.any())]).or(z.null()).optional(),
})

export const commandCreateSchema = z.object({
  name: z.string().min(1).max(255),
  command: z.string().min(1).max(4096),
  description: z.string().max(1000).nullable().optional(),
  parameters: z.array(commandParameterSchema).optional(),
  tags: z.array(z.string()).optional(),
})

export const commandUpdateSchema = z.object({
  name: z.string().min(1).max(255).nullable().optional(),
  command: z.string().min(1).max(4096).nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  parameters: z.array(commandParameterSchema).nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
})

export type CommandParameterFormValues = z.infer<typeof commandParameterSchema>
export type CommandCreateFormValues = z.infer<typeof commandCreateSchema>
export type CommandUpdateFormValues = z.infer<typeof commandUpdateSchema>

import { z } from 'zod'

const PARAMETER_TYPES = ['string', 'integer', 'boolean'] as const

export const commandParameterSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
  type: z.enum(PARAMETER_TYPES).default('string'),
  required: z.boolean().default(true),
  default: z.string().or(z.number()).or(z.boolean()).or(z.null()).default(''),
})

export const commandCreateSchema = z.object({
  name: z.string().min(1).max(255),
  command: z.string().min(1).max(4096),
  description: z.string().max(1000).nullable().optional(),
  parameters: z.array(commandParameterSchema).optional(),
  tags: z.array(z.string().min(1).max(100)).optional(),
})

export const commandUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  command: z.string().min(1).max(4096).optional(),
  description: z.string().max(1000).nullable().optional(),
  parameters: z.array(commandParameterSchema).optional(),
  tags: z.array(z.string().min(1).max(100)).optional(),
})

export type CommandParameterFormValues = z.infer<typeof commandParameterSchema>
export type CommandCreateFormValues = z.infer<typeof commandCreateSchema>
export type CommandUpdateFormValues = z.infer<typeof commandUpdateSchema>

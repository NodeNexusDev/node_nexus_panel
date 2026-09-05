import { z } from 'zod'

const PARAMETER_TYPES = ['string', 'integer', 'boolean'] as const

export const commandParameterSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
  type: z.enum(PARAMETER_TYPES).default('string'),
  required: z.boolean().default(true),
  default: z.union([z.string(), z.number(), z.boolean(), z.record(z.string(), z.unknown()), z.array(z.unknown())]).or(z.null()).optional(),
})

const tagRegex = /^[a-z0-9_-]{1,30}$/
const tagsCreate = z.array(z.string().min(1).max(30).regex(tagRegex, 'Tag must match ^[a-z0-9_-]+$')).max(20).optional()
const tagsUpdate = z.array(z.string().min(1).max(30).regex(tagRegex, 'Tag must match ^[a-z0-9_-]+$')).max(20).nullable().optional()

export const commandCreateSchema = z.object({
  name: z.string().min(1).max(255),
  command: z.string().min(1).max(4096),
  description: z.string().max(1000).nullable().optional(),
  parameters: z.array(commandParameterSchema).optional(),
  tags: tagsCreate,
})

export const commandUpdateSchema = z.object({
  name: z.string().min(1).max(255).nullable().optional(),
  command: z.string().min(1).max(4096).nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  parameters: z.array(commandParameterSchema).nullable().optional(),
  tags: tagsUpdate,
})

export type CommandParameterFormValues = z.infer<typeof commandParameterSchema>
export type CommandCreateFormValues = z.infer<typeof commandCreateSchema>
export type CommandUpdateFormValues = z.infer<typeof commandUpdateSchema>

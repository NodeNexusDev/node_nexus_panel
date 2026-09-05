import { z } from 'zod'

const CONNECTION_TYPES = ['ssh'] as const
const NODE_STATUSES = ['active', 'unreachable', 'error'] as const

const tagRegex = /^[a-z0-9_-]{1,30}$/
const tagsCreate = z.array(z.string().min(1).max(30).regex(tagRegex, 'Tag must match ^[a-z0-9_-]+$ (lowercase, 1-30)')).max(20).optional()
const tagsUpdate = z.array(z.string().min(1).max(30).regex(tagRegex, 'Tag must match ^[a-z0-9_-]+$')).max(20).nullable().optional()

export const nodeCreateSchema = z.object({
  name: z.string().min(1).max(255),
  host: z.string().min(1).max(255),
  port: z.coerce.number().int().min(1).max(65535).default(22),
  connection_type: z.enum(CONNECTION_TYPES),
  description: z.string().max(1000).nullable().optional(),
  username: z.string().transform(v => v === '' ? null : v).nullable().optional(),
  password: z.string().transform(v => v === '' ? null : v).nullable().optional(),
  ssh_key: z.string().transform(v => v === '' ? null : v).nullable().optional(),
  passphrase: z.string().transform(v => v === '' ? null : v).nullable().optional(),
  docker_host: z.string().transform(v => v === '' ? null : v).nullable().optional(),
  has_docker: z.boolean().default(false),
  tags: tagsCreate,
})

export const nodeUpdateSchema = z.object({
  name: z.string().min(1).max(255).nullable().optional(),
  host: z.string().min(1).max(255).nullable().optional(),
  port: z.number().int().min(1).max(65535).nullable().optional(),
  connection_type: z.enum(CONNECTION_TYPES).nullable().optional(),
  status: z.enum(NODE_STATUSES).nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  username: z.string().transform(v => v === '' ? null : v).nullable().optional(),
  password: z.string().transform(v => v === '' ? null : v).nullable().optional(),
  ssh_key: z.string().transform(v => v === '' ? null : v).nullable().optional(),
  passphrase: z.string().transform(v => v === '' ? null : v).nullable().optional(),
  docker_host: z.string().transform(v => v === '' ? null : v).nullable().optional(),
  has_docker: z.boolean().nullable().optional(),
  tags: tagsUpdate,
})

export const nodeValidateSchema = z.object({
  host: z.string().min(1).max(255),
  port: z.number().int().min(1).max(65535).default(22),
  connection_type: z.enum(CONNECTION_TYPES).default('ssh'),
  username: z.string().min(1).max(255).nullable().optional(),
  password: z.string().min(1).nullable().optional(),
  ssh_key: z.string().min(1).nullable().optional(),
  passphrase: z.string().min(1).nullable().optional(),
})

export type NodeCreateFormValues = z.infer<typeof nodeCreateSchema>
export type NodeUpdateFormValues = z.infer<typeof nodeUpdateSchema>
export type NodeValidateFormValues = z.infer<typeof nodeValidateSchema>

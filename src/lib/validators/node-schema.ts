import { z } from 'zod'

const CONNECTION_TYPES = ['ssh', 'docker', 'proxmox'] as const
const NODE_STATUSES = ['active', 'unreachable', 'error'] as const

export const nodeCreateSchema = z.object({
  name: z.string().min(1).max(255),
  host: z.string().min(1).max(255),
  port: z.number().int().min(1).max(65535).default(22),
  connection_type: z.enum(CONNECTION_TYPES),
  username: z.string().min(1).max(255).nullable().optional(),
  password: z.string().min(1).nullable().optional(),
  ssh_key: z.string().min(1).nullable().optional(),
  docker_host: z.string().min(1).max(255).nullable().optional(),
  tags: z.array(z.string().min(1).max(100)).optional(),
})

export const nodeUpdateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  host: z.string().min(1).max(255).optional(),
  port: z.number().int().min(1).max(65535).optional(),
  connection_type: z.enum(CONNECTION_TYPES).optional(),
  status: z.enum(NODE_STATUSES).optional(),
  username: z.string().min(1).max(255).nullable().optional(),
  password: z.string().min(1).nullable().optional(),
  ssh_key: z.string().min(1).nullable().optional(),
  docker_host: z.string().min(1).max(255).nullable().optional(),
  tags: z.array(z.string().min(1).max(100)).optional(),
})

export const nodeValidateSchema = z.object({
  host: z.string().min(1).max(255),
  port: z.number().int().min(1).max(65535).default(22),
  connection_type: z.enum(CONNECTION_TYPES).default('ssh'),
  username: z.string().min(1).max(255).nullable().optional(),
  password: z.string().min(1).nullable().optional(),
  ssh_key: z.string().min(1).nullable().optional(),
})

export type NodeCreateFormValues = z.infer<typeof nodeCreateSchema>
export type NodeUpdateFormValues = z.infer<typeof nodeUpdateSchema>
export type NodeValidateFormValues = z.infer<typeof nodeValidateSchema>

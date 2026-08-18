import { z } from 'zod'

const VOLUME_MODES = ['rw', 'ro'] as const

const containerVolumeMountSchema = z.object({
  bind: z.string().min(1).max(4096),
  mode: z.enum(VOLUME_MODES).default('rw'),
})

export const containerCreateSchema = z.object({
  image: z.string().min(1).max(255),
  name: z.string().min(1).max(255).nullable().optional(),
  command: z.string().max(4096).nullable().optional(),
  detach: z.boolean().default(true),
  env: z.array(z.string()).optional(),
  labels: z.record(z.string(), z.string()).optional(),
  network: z.string().max(255).nullable().optional(),
  ports: z.record(z.string(), z.string()).optional(),
  restart_policy: z.string().nullable().optional(),
  volumes: z.record(z.string(), containerVolumeMountSchema).optional(),
})

export const imagePullSchema = z.object({
  image: z.string().min(1).max(255),
  timeout: z.number().int().min(1).max(3600).default(300),
})

export const imageBuildSchema = z.object({
  dockerfile: z.string().min(1).max(1048576),
  tag: z.string().min(1).max(255),
  build_args: z.record(z.string(), z.string()).optional(),
  no_cache: z.boolean().default(false),
})

export const imageTagSchema = z.object({
  repo: z.string().min(1).max(255),
  tag: z.string().min(1).max(128),
})

export const containerCreateFormSchema = z.object({
  image: z.string().min(1).max(255),
  name: z.string().max(255).default(''),
  command: z.string().max(4096).default(''),
  ports: z.string().default(''),
  env: z.string().default(''),
  volumes: z.string().default(''),
  network: z.string().max(255).default(''),
  labels: z.string().default(''),
  restart_policy: z.string().default(''),
})

export type ContainerCreateFormValues = z.infer<typeof containerCreateSchema>
export type ContainerCreateFormInput = z.infer<typeof containerCreateFormSchema>
export type ImagePullFormValues = z.infer<typeof imagePullSchema>
export type ImageBuildFormValues = z.infer<typeof imageBuildSchema>
export type ImageTagFormValues = z.infer<typeof imageTagSchema>

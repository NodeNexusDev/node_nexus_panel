import { z } from 'zod'

const SCRIPT_STEP_TYPES = ['inline', 'command'] as const
const ON_FAILURE_VALUES = ['stop', 'continue'] as const

export const scriptStepSchema = z.object({
  label: z.string().min(1).max(255),
  type: z.enum(SCRIPT_STEP_TYPES),
  command: z.string().max(4096).nullable().optional(),
  command_id: z.string().uuid().nullable().optional(),
  params: z.record(z.string(), z.any()).optional(),
  on_failure: z.enum(ON_FAILURE_VALUES).default('stop'),
})

export const scriptCreateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).nullable().optional(),
  steps: z.array(scriptStepSchema).min(1),
  tags: z.array(z.string()).optional(),
})

export const scriptUpdateSchema = z.object({
  name: z.string().min(1).max(255).nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  steps: z.array(scriptStepSchema).min(1).nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
})

export const scheduleSchema = z.object({
  cron: z.string().min(5).max(60),
  node_ids: z.array(z.string().uuid()).min(1),
  params: z.record(z.string(), z.any()).optional(),
  timezone: z.string().min(1).max(100).default('UTC'),
  misfire_grace_seconds: z.number().int().min(1).max(86400).default(60),
})

export type ScriptStepFormValues = z.infer<typeof scriptStepSchema>
export type ScriptCreateFormValues = z.infer<typeof scriptCreateSchema>
export type ScriptUpdateFormValues = z.infer<typeof scriptUpdateSchema>
export type ScheduleFormValues = z.infer<typeof scheduleSchema>

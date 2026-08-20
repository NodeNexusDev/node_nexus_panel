---
title: Формы
status: stable
translation_key: guides.forms
source_revision: 2026-08-20
---

# Формы

## Стек

- **react-hook-form** — управление состоянием формы
- **zod** — валидация по схемам
- **@hookform/resolvers** — интеграция с zod

## Схемы валидации

Расположены в `src/lib/validators/`:

| Файл | Схемы | Поля |
|------|-------|------|
| `node-schema.ts` | `nodeCreateSchema`, `nodeUpdateSchema`, `nodeValidateSchema` | name, host, port, connection_type, username, password, ssh_key, passphrase, docker_host, tags |
| `command-schema.ts` | `commandCreateSchema`, `commandUpdateSchema`, `commandParameterSchema` | name, command, description, parameters, tags |
| `script-schema.ts` | `scriptCreateSchema`, `scriptUpdateSchema`, `scriptStepSchema`, `scheduleSchema` | name, description, steps, tags, schedule |
| `api-key-schema.ts` | `apiKeyCreateSchema` | name, expires_in |
| `docker-schema.ts` | `containerCreateSchema`, `imagePullSchema`, `imageBuildSchema` | image, name, ports, env, volumes, command |

## Паттерн использования

### 1. Определите схему

```typescript
import { z } from 'zod'

export const nodeCreateSchema = z.object({
  name: z.string().min(1).max(255),
  host: z.string().min(1).max(255),
  port: z.number().int().min(1).max(65535).default(22),
  connection_type: z.enum(['ssh', 'docker', 'proxmox']),
  username: z.string().min(1).max(255).nullable().optional(),
  password: z.string().min(1).nullable().optional(),
  ssh_key: z.string().min(1).nullable().optional(),
  passphrase: z.string().min(1).nullable().optional(),
  docker_host: z.string().min(1).max(255).nullable().optional(),
  tags: z.array(z.string().min(1).max(100)).optional(),
})

export type NodeCreateFormData = z.infer<typeof nodeCreateSchema>
```

### 2. Используйте в компоненте

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { nodeCreateSchema, type NodeCreateFormData } from '@/lib/validators/node-schema'

function AddNodeForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<NodeCreateFormData>({
    resolver: zodResolver(nodeCreateSchema),
    defaultValues: { port: 22, connection_type: 'ssh' },
  })

  const onSubmit = (data: NodeCreateFormData) => {
    createNode.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input label="Имя" {...register('name')} error={errors.name?.message} />
      <Input label="Хост" {...register('host')} error={errors.host?.message} />
      <Input label="Порт" type="number" {...register('port', { valueAsNumber: true })} error={errors.port?.message} />
      <Input label="Пассфраза" type="password" {...register('passphrase')} error={errors.passphrase?.message} />
      <Button type="submit">Добавить ноду</Button>
    </form>
  )
}
```

### 3. Выбор типа подключения

```tsx
import { ConnectionTypeSelect } from '@/components/nodes/ConnectionTypeSelect'

<ConnectionTypeSelect value={value} onChange={onChange} />
```

### 4. Выбор ноды

```tsx
import { NodeSelect } from '@/components/ui/NodeSelect'

<NodeSelect value={nodeId} onChange={setNodeId} placeholder="Выберите ноду" />
```

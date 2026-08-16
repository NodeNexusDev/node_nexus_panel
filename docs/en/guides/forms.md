---
title: Forms
status: stable
translation_key: guides.forms
source_revision: 2026-08-16
---

# Forms

## Stack

- **react-hook-form** — form state management
- **zod** — schema validation
- **@hookform/resolvers** — zod integration

## Validation Schemas

Located in `src/lib/validations/`:

| File | Schema | Fields |
|------|--------|--------|
| `auth.ts` | `loginSchema` | email, password |
| `node.ts` | `addNodeSchema` | name, ip, port |
| `command.ts` | `commandSchema` | command, nodeId |
| `script.ts` | `scriptSchema` | name, description, content, schedule |
| `profile.ts` | `profileSchema`, `passwordSchema` | name, email, currentPassword, newPassword, confirmPassword |

## Usage Pattern

### 1. Define Schema

```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginFormData = z.infer<typeof loginSchema>
```

### 2. Create Form Hook

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '../lib/validations/auth'
import { useLogin } from './useAuth'

export function useLoginForm() {
  const loginMutation = useLogin()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data)
  }

  return {
    ...form,
    onSubmit: form.handleSubmit(onSubmit),
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
  }
}
```

### 3. Use in Component

```tsx
function Login() {
  const { register, onSubmit, isLoading, error } = useLoginForm()

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit() }}>
      {error && <div className="text-red-400">{error.message}</div>}
      <Input label="Email" {...register('email')} />
      <Input label="Password" type="password" {...register('password')} />
      <Button type="submit" disabled={isLoading}>Sign In</Button>
    </form>
  )
}
```

## Form Hooks

| Hook | Purpose |
|------|---------|
| `useLoginForm` | Login form with auth mutation |

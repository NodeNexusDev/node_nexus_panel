---
title: Формы
status: stable
translation_key: guides.forms
source_revision: 2026-08-16
---

# Формы

## Стек

- **react-hook-form** — управление состоянием формы
- **zod** — валидация по схемам
- **@hookform/resolvers** — интеграция с zod

## Схемы валидации

Расположены в `src/lib/validations/`:

| Файл | Схема | Поля |
|------|-------|------|
| `auth.ts` | `loginSchema` | email, password |
| `node.ts` | `addNodeSchema` | name, ip, port |
| `command.ts` | `commandSchema` | command, nodeId |
| `script.ts` | `scriptSchema` | name, description, content, schedule |
| `profile.ts` | `profileSchema`, `passwordSchema` | name, email, currentPassword, newPassword, confirmPassword |

## Паттерн использования

### 1. Определите схему

```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
})

export type LoginFormData = z.infer<typeof loginSchema>
```

### 2. Создайте хук формы

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

### 3. Используйте в компоненте

```tsx
function Login() {
  const { register, onSubmit, isLoading, error } = useLoginForm()

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit() }}>
      {error && <div className="text-red-400">{error.message}</div>}
      <Input label="Email" {...register('email')} />
      <Input label="Пароль" type="password" {...register('password')} />
      <Button type="submit" disabled={isLoading}>Войти</Button>
    </form>
  )
}
```

## Хуки форм

| Хук | Назначение |
|-----|-----------|
| `useLoginForm` | Форма входа с мутацией аутентификации |

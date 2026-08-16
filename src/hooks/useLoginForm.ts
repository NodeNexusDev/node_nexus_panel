import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginFormData } from '../lib/validations/auth'
import { useLogin } from './useAuth'

export function useLoginForm() {
  const loginMutation = useLogin()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
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

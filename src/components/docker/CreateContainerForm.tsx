import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { containerCreateFormSchema, type ContainerCreateFormInput } from '../../lib/validators/docker-schema'
import { useCreateContainer } from '../../hooks/useDocker'
import { useToast } from '../ui/useToast'
import type { ContainerCreatedResponse } from '../../api/types'

interface CreateContainerFormProps {
  nodeId: string
  onClose: () => void
}

const parsePorts = (value: string): Record<string, string> | undefined => {
  const entries = value.split(',').map((p) => p.trim()).filter(Boolean)
  if (entries.length === 0) return undefined
  const result: Record<string, string> = {}
  for (const entry of entries) {
    const [host, container] = entry.split(':').map((s) => s.trim())
    if (host && container) result[`${container}/tcp`] = `${host}/tcp`
  }
  return Object.keys(result).length > 0 ? result : undefined
}

const parseVolumes = (value: string): Record<string, { bind: string; mode?: 'rw' | 'ro' }> | undefined => {
  const entries = value.split(',').map((p) => p.trim()).filter(Boolean)
  if (entries.length === 0) return undefined
  const result: Record<string, { bind: string; mode?: 'rw' | 'ro' }> = {}
  for (const entry of entries) {
    const parts = entry.split(':').map((s) => s.trim())
    const [host, container] = parts
    if (!host || !container) continue
    const mode = parts[2] === 'ro' ? 'ro' as const : 'rw' as const
    result[container] = { bind: host, mode }
  }
  return Object.keys(result).length > 0 ? result : undefined
}

const parseLabels = (value: string): Record<string, string> | undefined => {
  const entries = value.split(',').map((p) => p.trim()).filter(Boolean)
  if (entries.length === 0) return undefined
  const result: Record<string, string> = {}
  for (const entry of entries) {
    const eq = entry.indexOf('=')
    if (eq === -1) continue
    result[entry.slice(0, eq).trim()] = entry.slice(eq + 1).trim()
  }
  return Object.keys(result).length > 0 ? result : undefined
}

export function CreateContainerForm({ nodeId, onClose }: CreateContainerFormProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const createContainer = useCreateContainer()
  const [result, setResult] = useState<ContainerCreatedResponse | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContainerCreateFormInput>({
    resolver: zodResolver(containerCreateFormSchema) as Resolver<ContainerCreateFormInput>,
    defaultValues: {
      image: '',
      name: '',
      command: '',
      ports: '',
      env: '',
      volumes: '',
      network: '',
      labels: '',
      restart_policy: 'unless-stopped',
    },
  })

  const onSubmit = (values: ContainerCreateFormInput) => {
    setResult(null)
    createContainer.mutate(
      {
        nodeId,
        data: {
          image: values.image,
          name: values.name.trim() || undefined,
          command: values.command.trim() || undefined,
          ports: parsePorts(values.ports),
          env: values.env ? values.env.split(',').map((e) => e.trim()).filter(Boolean) : undefined,
          volumes: parseVolumes(values.volumes),
          network: values.network.trim() || undefined,
          labels: parseLabels(values.labels),
          detach: true,
          restart_policy: values.restart_policy.trim() || undefined,
        },
      },
      {
        onSuccess: (data) => {
          setResult(data)
          reset()
        },
        onError: () => toast('error', t('docker.toastCreateFailed')),
      },
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {result && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 text-sm">
          <p className="font-medium text-green-800 dark:text-green-300">{t('docker.containerCreated', 'Container created')}</p>
          <p className="text-green-700 dark:text-green-400 font-mono text-xs mt-1">
            id: {result.id.slice(0, 12)} · name: {result.name} · image: {result.image} · status: {result.status}
          </p>
        </div>
      )}
      <Input label={t('docker.image')} placeholder="nginx:latest" {...register('image')} error={errors.image?.message} />
      <Input label={t('docker.name')} placeholder="my-container" {...register('name')} error={errors.name?.message} />
      <Input label={t('docker.command')} placeholder="/bin/sh -c 'echo hello'" {...register('command')} error={errors.command?.message} />
      <Input label={`${t('docker.ports')} (${t('docker.hostPort')})`} placeholder="8080:80, 443:443" {...register('ports')} />
      <Input label={t('docker.environment')} placeholder="NODE_ENV=production, PORT=3000" {...register('env')} />
      <Input label={t('docker.volumes', 'Volumes')} placeholder="/host/path:/container/path:rw" {...register('volumes')} />
      <Input label={t('docker.network', 'Network')} placeholder="bridge" {...register('network')} error={errors.network?.message} />
      <Input label={t('docker.labels', 'Labels')} placeholder="env=prod, app=web" {...register('labels')} />
      <Input label={t('docker.restartPolicy', 'Restart policy')} placeholder="unless-stopped" {...register('restart_policy')} />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
        <Button type="submit" disabled={createContainer.isPending}>{createContainer.isPending ? t('common.loading') : t('docker.createContainer')}</Button>
      </div>
    </form>
  )
}

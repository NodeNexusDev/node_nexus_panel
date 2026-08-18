import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import type { ScriptStep } from '../../api/types'

type StepInput = { label: string; type: 'inline' | 'command'; command: string; command_id: string; params: Record<string, unknown>; on_failure: 'stop' | 'continue' }

export interface ScriptFormInitial {
  name: string
  description: string
  tags: string[]
  steps: ScriptStep[]
}

export interface ScriptFormValues {
  name: string
  description?: string
  tags?: string[]
  steps: ScriptStep[]
}

interface ScriptFormModalProps {
  isOpen: boolean
  title: string
  submitLabel?: string
  pending?: boolean
  initial?: ScriptFormInitial
  onClose: () => void
  onSubmit: (values: ScriptFormValues) => void
}

const EMPTY_STEP: StepInput = { label: 'Step 1', type: 'inline', command: '', command_id: '', params: {}, on_failure: 'stop' }

export function ScriptFormModal({ isOpen, title, submitLabel, pending, initial, onClose, onSubmit }: ScriptFormModalProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [steps, setSteps] = useState<StepInput[]>([EMPTY_STEP])

  const initialRef = useRef(initial)
  initialRef.current = initial

  useEffect(() => {
    if (!isOpen) return
    const init = initialRef.current
    if (init) {
      setName(init.name)
      setDescription(init.description)
      setTags(init.tags.join(', '))
      setSteps(init.steps.map((s) => ({ label: s.label, type: s.type, command: s.command || '', command_id: s.command_id || '', params: s.params || {}, on_failure: s.on_failure || 'stop' })))
    } else {
      setName('')
      setDescription('')
      setTags('')
      setSteps([EMPTY_STEP])
    }
  }, [isOpen])

  const handleSubmit = () => {
    onSubmit({
      name,
      description: description || undefined,
      tags: tags ? tags.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      steps: steps.map((s) => ({
        label: s.label,
        type: s.type,
        command: s.type === 'inline' ? s.command || null : null,
        command_id: s.type === 'command' ? s.command_id || null : null,
        params: Object.keys(s.params).length > 0 ? s.params : undefined,
        on_failure: s.on_failure,
      })),
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="space-y-4">
        <Input label={t('common.name')} placeholder="backup-db.sh" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label={t('scripts.description')} placeholder="Backup PostgreSQL database" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Input label={t('scripts.tagsLabel')} placeholder="backup, database" value={tags} onChange={(e) => setTags(e.target.value)} />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">{t('scripts.steps')}</label>
            <Button variant="ghost" size="sm" onClick={() => setSteps((prev) => [...prev, { label: `Step ${prev.length + 1}`, type: 'inline', command: '', command_id: '', params: {}, on_failure: 'stop' }])}>{t('scripts.addStep', '+ Add Step')}</Button>
          </div>
          {steps.map((step, idx) => (
            <div key={idx} className="p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Input label="" placeholder={t('scripts.stepLabel', 'Step label')} value={step.label} onChange={(e) => { const updated = [...steps]; updated[idx] = { ...updated[idx], label: e.target.value }; setSteps(updated) }} className="flex-1" />
                <select value={step.type} onChange={(e) => { const updated = [...steps]; updated[idx] = { ...updated[idx], type: e.target.value as 'inline' | 'command' }; setSteps(updated) }} className="px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white">
                  <option value="inline">{t('scripts.typeInline', 'Inline')}</option>
                  <option value="command">{t('scripts.typeCommand', 'Command')}</option>
                </select>
                <select value={step.on_failure} onChange={(e) => { const updated = [...steps]; updated[idx] = { ...updated[idx], on_failure: e.target.value as 'stop' | 'continue' }; setSteps(updated) }} className="px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm dark:bg-surface-800 dark:border-surface-700 dark:text-white">
                  <option value="stop">{t('scripts.onFailureStop', 'Stop')}</option>
                  <option value="continue">{t('scripts.onFailureContinue', 'Continue')}</option>
                </select>
                {steps.length > 1 && <Button variant="ghost" size="sm" onClick={() => setSteps((prev) => prev.filter((_, i) => i !== idx))} className="text-red-500">{t('common.delete')}</Button>}
              </div>
              {step.type === 'inline' ? (
                <textarea placeholder={t('scripts.commandPlaceholder', '#!/bin/bash\necho "Hello"')} value={step.command} onChange={(e) => { const updated = [...steps]; updated[idx] = { ...updated[idx], command: e.target.value }; setSteps(updated) }} className="w-full px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm font-mono dark:bg-surface-800 dark:border-surface-700 dark:text-white" rows={3} />
              ) : (
                <Input label="" placeholder={t('scripts.commandIdPlaceholder', 'Command ID')} value={step.command_id} onChange={(e) => { const updated = [...steps]; updated[idx] = { ...updated[idx], command_id: e.target.value }; setSteps(updated) }} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
          <Button onClick={handleSubmit} disabled={pending || !name}>{pending ? t('common.loading') : (submitLabel ?? t('common.save'))}</Button>
        </div>
      </div>
    </Modal>
  )
}

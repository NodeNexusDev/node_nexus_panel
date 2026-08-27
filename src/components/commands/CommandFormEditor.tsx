import { useTranslation } from 'react-i18next'
import { useFieldArray, useWatch, Controller, useFormContext } from 'react-hook-form'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import type { CommandParameterFormValues } from '../../lib/validators/command-schema'

export type ParameterFormShape = { parameters?: CommandParameterFormValues[] }

export function ParameterEditor() {
  const { t } = useTranslation()
  const { control } = useFormContext<ParameterFormShape>()
  const { fields, append, remove } = useFieldArray({ control, name: 'parameters' })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-surface-600 dark:text-surface-400">{t('commands.parameters', 'Parameters')}</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => append({ name: '', type: 'string', required: true, default: '', description: '' })}
        >
          {t('commands.addParameter', 'Add parameter')}
        </Button>
      </div>
      {fields.length === 0 && <p className="text-xs text-surface-400">{t('commands.noParameters', 'No parameters')}</p>}
      {fields.map((field, index) => (
        <ParameterRow key={field.id} index={index} onRemove={() => remove(index)} />
      ))}
    </div>
  )
}

function ParameterRow({ index, onRemove }: { index: number; onRemove: () => void }) {
  const { t } = useTranslation()
  const { control } = useFormContext<ParameterFormShape>()
  const type = useWatch({ control, name: `parameters.${index}.type` })

  return (
    <div className="p-3 border border-surface-200 dark:border-surface-700 rounded-lg space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Controller
          name={`parameters.${index}.name`}
          control={control}
          render={({ field }) => <Input label={t('commands.paramName', 'Name')} placeholder="path" {...field} value={String(field.value ?? '')} />}
        />
        <Controller
          name={`parameters.${index}.type`}
          control={control}
          render={({ field }) => (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-400">{t('commands.paramType', 'Type')}</label>
              <select
                {...field}
                className="w-full px-4 py-2.5 bg-white border border-surface-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 dark:bg-surface-800 dark:border-surface-700 dark:text-white"
              >
                <option value="string">string</option>
                <option value="integer">integer</option>
                <option value="boolean">boolean</option>
              </select>
            </div>
          )}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Controller
          name={`parameters.${index}.default`}
          control={control}
          render={({ field }) => {
            if (type === 'boolean') {
              return (
                <label className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
                  <input
                    type="checkbox"
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="rounded border-surface-300 dark:border-surface-600"
                  />
                  {t('commands.paramDefault', 'Default value')}
                </label>
              )
            }
            return (
              <Input
                label={t('commands.paramDefault', 'Default value')}
                type={type === 'integer' ? 'number' : 'text'}
                {...field}
                value={field.value != null ? String(field.value) : ''}
                onChange={(e) => field.onChange(type === 'integer' ? Number(e.target.value) : e.target.value)}
              />
            )
          }}
        />
        <Controller
          name={`parameters.${index}.required`}
          control={control}
          render={({ field }) => (
            <label className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400 self-end">
              <input
                type="checkbox"
                checked={!!field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="rounded border-surface-300 dark:border-surface-600"
              />
              {t('commands.paramRequired', 'Required')}
            </label>
          )}
        />
      </div>
      <Controller
        name={`parameters.${index}.description`}
        control={control}
        render={({ field }) => (
          <Input label={t('commands.paramDescription', 'Description')} placeholder={t('commands.paramDescription', 'Description')} {...field} value={String(field.value ?? '')} />
        )}
      />
      <div className="flex justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          {t('common.remove', 'Remove')}
        </Button>
      </div>
    </div>
  )
}

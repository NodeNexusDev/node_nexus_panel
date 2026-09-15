import { useTranslation } from 'react-i18next'
import { FilterBar } from '../ui/FilterBar'
import { TagFilter } from '../ui/TagFilter'
import { Select } from '../ui/Select'

type Props = {
  search: string
  setSearch: (v: string) => void
  tagFilter: string[]
  setTagFilter: (v: string[]) => void
  allTags: string[] | undefined
  statusFilter: string
  setStatusFilter: (v: string) => void
}

const STATUSES = ['active', 'unreachable', 'error'] as const

export function NodesFilters({ search, setSearch, tagFilter, setTagFilter, allTags, statusFilter, setStatusFilter }: Props) {
  const { t } = useTranslation()
  return (
    <FilterBar search={search} onSearch={setSearch} searchPlaceholder={t('nodes.searchPlaceholder', 'Search nodes...')}>
      <TagFilter available={allTags ?? []} selected={tagFilter} onChange={setTagFilter} />
      <Select
        value={statusFilter}
        onChange={setStatusFilter}
        placeholder={t('nodes.allStatuses', 'All statuses')}
        options={STATUSES.map((s) => ({ value: s, label: t(`nodes.status${s.charAt(0).toUpperCase() + s.slice(1)}` as never, s) }))}
      />
    </FilterBar>
  )
}

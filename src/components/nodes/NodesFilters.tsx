import { useTranslation } from 'react-i18next'
import { FilterBar } from '../ui/FilterBar'
import { TagFilter } from '../ui/TagFilter'

type Props = {
  search: string
  setSearch: (v: string) => void
  tagFilter: string[]
  setTagFilter: (v: string[]) => void
  allTags: string[] | undefined
}

export function NodesFilters({ search, setSearch, tagFilter, setTagFilter, allTags }: Props) {
  const { t } = useTranslation()
  return (
    <FilterBar search={search} onSearch={setSearch} searchPlaceholder={t('nodes.searchPlaceholder', 'Search nodes...')}>
      <TagFilter available={allTags ?? []} selected={tagFilter} onChange={setTagFilter} />
    </FilterBar>
  )
}

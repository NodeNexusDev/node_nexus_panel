import type { ReactNode } from 'react'
import { Card, CardContent } from './Card'
import { SearchInput } from './SearchInput'

interface FilterBarProps {
  search: string
  onSearch: (value: string) => void
  searchPlaceholder?: string
  children?: ReactNode
}

export function FilterBar({ search, onSearch, searchPlaceholder, children }: FilterBarProps) {
  return (
    <Card className="stagger-item">
      <CardContent>
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput value={search} onChange={onSearch} placeholder={searchPlaceholder} className="flex-1 min-w-[200px] max-w-sm" />
          {children}
        </div>
      </CardContent>
    </Card>
  )
}

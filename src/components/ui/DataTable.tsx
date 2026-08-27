import type { ReactNode } from 'react'
import { ResponsiveTable } from './ResponsiveTable'
import { TableSkeleton } from './Skeleton'
import { EmptyState } from './EmptyState'
import { Pagination } from './Pagination'
import type { Column } from './table-types'

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  renderMobileItem: (item: T) => ReactNode
  keyExtractor: (item: T) => string
  isLoading?: boolean
  skeletonRows?: number
  skeletonCols?: number
  emptyIcon?: ReactNode
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: ReactNode
  pagination?: { page: number; totalPages: number; onPageChange: (p: number) => void }
  onRowClick?: (item: T) => void
  className?: string
}

export function DataTable<T>({
  data,
  columns,
  renderMobileItem,
  keyExtractor,
  isLoading,
  skeletonRows = 5,
  skeletonCols,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  pagination,
  onRowClick,
  className,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div aria-busy="true" aria-live="polite">
        <TableSkeleton rows={skeletonRows} cols={skeletonCols ?? columns.length} />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle ?? 'No data'}
        description={emptyDescription}
        action={emptyAction}
      />
    )
  }

  return (
    <>
      <ResponsiveTable
        data={data}
        columns={columns}
        renderMobileItem={renderMobileItem}
        keyExtractor={keyExtractor}
        onRowClick={onRowClick}
        className={className}
      />
      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-3 border-t border-surface-200 dark:border-surface-800">
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
    </>
  )
}

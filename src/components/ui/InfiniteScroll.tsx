import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './Button'

interface InfiniteScrollProps {
  hasMore?: boolean
  isFetchingNextPage?: boolean
  onLoadMore: () => void
  className?: string
}

export function InfiniteScroll({ hasMore, isFetchingNextPage, onLoadMore, className = '' }: InfiniteScrollProps) {
  const { t } = useTranslation()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasMore || isFetchingNextPage) return
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore()
      },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, isFetchingNextPage, onLoadMore])

  if (!hasMore) return null
  return (
    <div ref={ref} className={`flex justify-center py-4 ${className}`}>
      <Button variant="ghost" size="sm" onClick={onLoadMore} disabled={!!isFetchingNextPage}>
        {isFetchingNextPage ? t('common.loading', 'Loading...') : t('common.loadMore', 'Load more')}
      </Button>
    </div>
  )
}

import type { CursorPage } from '../api/types'

export function getNextCursor<T>(lastPage: unknown): string | undefined {
  const page = lastPage as CursorPage<T>
  return page?.has_more ? page.next_cursor ?? undefined : undefined
}

export function flatInfiniteData<T>(pages: unknown): T[] {
  if (!pages || !Array.isArray(pages)) return []
  return (pages as CursorPage<T>[]).flatMap((p) => p.items)
}

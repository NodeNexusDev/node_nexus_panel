// Chunked bulk requests.
//
// Backend caps id-lists at 100 items (deletions, retries/cancels, checks, metrics,
// docker/compose bulk selections) and create/update/execution batches at 20 items.
// Large selections are split into sequential chunks and merged back into one
// BulkResult-shaped response so callers never see HTTP 422 on oversized batches.

export interface BulkLike<R> {
  total: number
  succeeded: number
  failed: number
  results: R[]
}

export function chunkItems<T>(items: readonly T[], size: number): T[][] {
  if (size < 1) return [[...items]]
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

export async function runBulkChunks<T, R>(
  items: readonly T[],
  size: number,
  run: (chunk: T[]) => Promise<BulkLike<R>>,
): Promise<BulkLike<R>> {
  const chunks = chunkItems(items, size)
  if (chunks.length <= 1) return run([...items])
  const merged: BulkLike<R> = { total: 0, succeeded: 0, failed: 0, results: [] }
  for (const c of chunks) {
    const r = await run(c)
    merged.total += r.total
    merged.succeeded += r.succeeded
    merged.failed += r.failed
    merged.results.push(...r.results)
  }
  return merged
}

import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'

export function NodeDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton variant="text" className="w-64 h-8" />
          <Skeleton variant="text" className="w-48 h-4" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton variant="rectangular" className="w-20 h-9" />
          <Skeleton variant="rectangular" className="w-20 h-9" />
          <Skeleton variant="rectangular" className="w-20 h-9" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <Skeleton variant="text" className="w-32 h-5" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton variant="text" className="w-24 h-4" />
                <Skeleton variant="text" className="w-full h-5" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

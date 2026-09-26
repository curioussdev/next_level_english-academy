import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="min-h-screen bg-background px-5 pt-32">
      <div className="mx-auto max-w-7xl">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-6 h-14 w-full max-w-xl" />
        <Skeleton className="mt-4 h-14 w-full max-w-lg" />
        <Skeleton className="mt-8 h-12 w-48 rounded-full" />
      </div>
    </div>
  )
}

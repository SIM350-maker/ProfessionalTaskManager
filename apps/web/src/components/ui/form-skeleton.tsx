import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface FormSkeletonProps {
  fields?: number;
}

/** Placeholder shown while an edit form's initial data is loading — replaces plain "Loading..." text. */
export function FormSkeleton({ fields = 3 }: FormSkeletonProps) {
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton variant="text" className="h-4 w-24" />
            <Skeleton variant="text" className="h-10 w-full" />
          </div>
        ))}
        <div className="flex justify-end gap-3 pt-2">
          <Skeleton variant="text" className="h-10 w-20" />
          <Skeleton variant="text" className="h-10 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

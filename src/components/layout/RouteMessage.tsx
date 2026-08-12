import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ChevronLeft, RotateCw } from 'lucide-react';

interface RouteMessageProps {
  title: string;
  detail?: string;
  onRetry?: () => void;
}

/**
 * Fallback shown by the router's error and not-found boundaries.
 *
 * Without these, a failed loader or an unmatched URL rendered nothing useful — a
 * network error inside a route surfaced as an unhandled error rather than something
 * the user could act on.
 */
export function RouteMessage({ title, detail, onRetry }: RouteMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 px-4 text-center">
      <div>
        <p className="font-medium">{title}</p>
        {detail && (
          <p className="mt-1 text-sm text-muted-foreground max-w-md">{detail}</p>
        )}
      </div>
      <div className="flex gap-2">
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <RotateCw className="h-4 w-4 mr-1" />
            Try again
          </Button>
        )}
        <Link to="/">
          <Button variant={onRetry ? 'ghost' : 'outline'}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

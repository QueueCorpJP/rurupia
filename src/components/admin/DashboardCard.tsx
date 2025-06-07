import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  change?: {
    value: string;
    positive?: boolean;
  };
  className?: string;
  isLoading?: boolean;
}

export function DashboardCard({ icon, title, value, change, className, isLoading }: DashboardCardProps) {
  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center">
            <div className="mr-3 sm:mr-4 rounded-full bg-primary/10 p-2 text-primary">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
              <Skeleton className="h-6 sm:h-8 w-24 sm:w-32 mt-1" />
            </div>
            <Skeleton className="h-5 sm:h-6 w-16 sm:w-20 ml-auto flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center">
          <div className="mr-3 sm:mr-4 rounded-full bg-primary/10 p-2 text-primary flex-shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
            <h3 className="text-lg sm:text-2xl font-bold tracking-tight mt-1 truncate">{value}</h3>
          </div>
          {change && (
            <Badge 
              variant={change.positive ? 'default' : 'destructive'} 
              className="ml-2 sm:ml-auto py-1 px-2 bg-opacity-20 flex-shrink-0 text-xs"
            >
              {change.value}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

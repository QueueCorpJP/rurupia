
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DashboardCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  change?: {
    value: string;
    positive?: boolean;
  };
  className?: string;
}

export function DashboardCard({ icon, title, value, change, className }: DashboardCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="mr-4 rounded-full bg-primary/10 p-2 text-primary">
            {icon}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold tracking-tight mt-1">{value}</h3>
          </div>
          {change && (
            <Badge variant={change.positive ? 'default' : 'destructive'} className="ml-auto py-1 px-2 bg-opacity-20">
              {change.value}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

import React from 'react';
import { cn } from '@/lib/utils';
import { Star as StarIcon } from 'lucide-react';

interface StarProps extends React.ComponentPropsWithoutRef<typeof StarIcon> {
  filled?: boolean;
}

const Star = React.forwardRef<React.ElementRef<typeof StarIcon>, StarProps>(
  ({ filled = false, className, ...props }, ref) => {
    return (
      <StarIcon
        ref={ref}
        className={cn(
          'h-4 w-4',
          filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300',
          className
        )}
        {...props}
      />
    );
  }
);

Star.displayName = 'Star';

export { Star }; 
import { AlertTriangleIcon, CheckCircleIcon, InfoIcon, XCircleIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/utils/cn';

interface CalloutProps {
  type?: 'info' | 'warning' | 'success' | 'error';
  title?: string;
  children: React.ReactNode;
}

const calloutConfig = {
  info: {
    icon: InfoIcon,
    className: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950',
    iconClassName: 'text-blue-600 dark:text-blue-400',
  },
  warning: {
    icon: AlertTriangleIcon,
    className: 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950',
    iconClassName: 'text-yellow-600 dark:text-yellow-400',
  },
  success: {
    icon: CheckCircleIcon,
    className: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950',
    iconClassName: 'text-green-600 dark:text-green-400',
  },
  error: {
    icon: XCircleIcon,
    className: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950',
    iconClassName: 'text-red-600 dark:text-red-400',
  },
};

export function Callout({ type = 'info', title, children }: CalloutProps) {
  const config = calloutConfig[type];
  const Icon = config.icon;

  return (
    <Card className={cn('my-4 border-l-4', config.className)}>
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', config.iconClassName)} />
          <div className="flex-1">
            {title && (
              <h4 className="font-semibold mb-2 text-sm">{title}</h4>
            )}
            <div className="text-sm">{children}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

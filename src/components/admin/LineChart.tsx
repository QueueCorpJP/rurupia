import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ChartData {
  name: string;
  value: number;
}

interface LineChartProps {
  title: string;
  data: ChartData[];
  color?: string;
  height?: number;
  isLoading?: boolean;
}

export function LineChart({ 
  title, 
  data, 
  color = "#0ea5e9", 
  height = 300,
  isLoading
}: LineChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height }}>
            <Skeleton className="w-full h-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis 
                dataKey="name" 
                tickLine={false}
                axisLine={false}
                padding={{ left: 10, right: 10 }}
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                width={30}
                tickLine={false}
                axisLine={false}
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{ 
                  borderRadius: '8px', 
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', 
                  border: 'none' 
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={3}
                dot={{ stroke: color, strokeWidth: 2, r: 4, fill: 'white' }}
                activeDot={{ r: 6, stroke: color, strokeWidth: 2, fill: 'white' }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

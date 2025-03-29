import { LineChart } from './LineChart';

interface OverviewProps {
  data: {
    name: string;
    total: number;
  }[];
}

export function Overview({ data }: OverviewProps) {
  // Map the data from { name, total } to { name, value } format for LineChart
  const formattedData = data.map(item => ({
    name: item.name,
    value: item.total
  }));

  return (
    <LineChart
      title=""
      data={formattedData}
      height={350}
    />
  );
} 
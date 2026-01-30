import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import {
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

//category variables to store the relavent information
interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

//shows spending
interface InsightsChartsProps {
  categorySpending: CategorySpending[];
  detailed?: boolean;
}

//colors for category bars
const COLORS: Record<string, string> = {
  emerald: "#10b981",
  blue: "#3b82f6",
  purple: "#a855f7",
  orange: "#f97316",
  pink: "#ec4899",
  cyan: "#06b6d4",
  amber: "#f59e0b",
};
//insight chart function
export function InsightsCharts({
  categorySpending,
  detailed = false,
}: InsightsChartsProps) {
  const chartData = categorySpending.map((item) => ({
    name: item.category,
    value: item.amount,
    color: COLORS[item.color] || "#6b7280",
  }));

  // For detailed insights - only show Category Comparison
  return (
    //category comparison chart tab layout
    <Card>
      <CardHeader>
        <CardTitle>Category Comparison</CardTitle>
        <CardDescription>Spending amount by category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              {/*individual bars showing expenses*/}
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

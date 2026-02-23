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
  PieChart,
  Pie,
} from "recharts";
import { Progress } from "./ui/progress";

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
    color: item.color || "#6b7280",
  }));

  // For overview - show combined spending visualization
  if (!detailed) {
    return (
      /* PieChart general layout */
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Spending Distribution</CardTitle>
            <CardDescription>Breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number | undefined) =>
                      value ? `$${value.toFixed(2)}` : "$0.00"
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Spending Area showing category with horizonal bar with amount of money*/}
        {/* Displaying largest spending*/}
        <Card>
          <CardHeader>
            <CardTitle>Spending Areas</CardTitle>
            <CardDescription>Your biggest spending areas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categorySpending.slice(0, 5).map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{category.category}</span>
                  <span className="text-gray-900">
                    ${category.amount.toFixed(2)}
                  </span>
                </div>
                {/*this change aims to display the part with movement with category color */}
                {/*THE FIX: Replaced <Progress /> with custom dynamic divs */}
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${category.percentage}%`,
                      backgroundColor: category.color, //JSON color applied here!
                    }}
                  />
                </div>
                <div className="text-xs text-gray-500">
                  {category.percentage}% of total spending
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <Tooltip
                formatter={(value: number | undefined) =>
                  value ? `$${value.toFixed(2)}` : "$0.00"
                }
              />
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

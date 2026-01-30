import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  Download,
  ArrowUpDown,
  Filter,
  Search,
  TrendingUp,
  CreditCard,
  PiggyBank,
  Sparkles,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { TransactionsTable } from "./TransactionsTable";
import { InsightsCharts } from "./InsightsCharts";

// Mock data
const mockTransactions = [
  {
    id: 1,
    date: "2025-11-10",
    merchant: "Whole Foods",
    category: "Groceries",
    amount: -87.43,
    status: "completed",
  },
  {
    id: 2,
    date: "2025-11-09",
    merchant: "Shell Gas Station",
    category: "Transportation",
    amount: -52.0,
    status: "completed",
  },
  {
    id: 3,
    date: "2025-11-08",
    merchant: "Netflix",
    category: "Entertainment",
    amount: -15.99,
    status: "completed",
  },
  {
    id: 4,
    date: "2025-11-08",
    merchant: "Starbucks",
    category: "Dining",
    amount: -6.45,
    status: "completed",
  },
  {
    id: 5,
    date: "2025-11-07",
    merchant: "Salary Deposit",
    category: "Income",
    amount: 4500.0,
    status: "completed",
  },
  {
    id: 6,
    date: "2025-11-06",
    merchant: "Amazon",
    category: "Shopping",
    amount: -124.99,
    status: "completed",
  },
  {
    id: 7,
    date: "2025-11-05",
    merchant: "Target",
    category: "Shopping",
    amount: -67.32,
    status: "completed",
  },
  {
    id: 8,
    date: "2025-11-05",
    merchant: "Chipotle",
    category: "Dining",
    amount: -12.5,
    status: "completed",
  },
  {
    id: 9,
    date: "2025-11-04",
    merchant: "LA Fitness",
    category: "Health",
    amount: -49.99,
    status: "completed",
  },
  {
    id: 10,
    date: "2025-11-03",
    merchant: "Uber",
    category: "Transportation",
    amount: -23.45,
    status: "completed",
  },
];

//mock data for dashboard cards
const monthlyStats = {
  totalIncome: 4500.0,
  totalExpenses: 1739.42,
  netSavings: 2760.58,
  savingsRate: 61.3,
  topCategory: "Shopping",
  transactionCount: 47,
};

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  // useState handling overview navigation in the dashboard
  const [activeTab, setActiveTab] = useState("overview");
  // handling the search
  const [searchQuery, setSearchQuery] = useState("");
  // handling filtering the dashboard sections: (overview, transaction, insights)
  const [categoryFilter, setCategoryFilter] = useState("all");

  //if user click on export report
  const handleExport = () => {
    toast.success("Report exported successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Clicking on AlgoFinance navigate back to homepage */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => onNavigate("home")}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg"></div>
              <span className="text-xl">AlgoFinance</span>
            </div>
            {/* Button handling export report for the user */}
            <Button onClick={handleExport} className="gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export Report</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Income */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Income</span>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-2xl mb-1">
                ${monthlyStats.totalIncome.toLocaleString()}
              </div>
              <p className="text-xs text-green-600">+12% from last month</p>
            </CardContent>
          </Card>
          {/**Total Expenses */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Expenses</span>
                <CreditCard className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-2xl mb-1">
                ${monthlyStats.totalExpenses.toLocaleString()}
              </div>
              <p className="text-xs text-red-600">+8% from last month</p>
            </CardContent>
          </Card>
          {/* Net Saving */}
          <Card className="border-2 border-emerald-200 bg-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-emerald-900">Net Savings</span>
                <PiggyBank className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl text-emerald-900 mb-1">
                ${monthlyStats.netSavings.toLocaleString()}
              </div>
              <p className="text-xs text-emerald-700">
                {monthlyStats.savingsRate}% savings rate
              </p>
            </CardContent>
          </Card>
          {/*Transactions*/}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Transactions</span>
                <ArrowUpDown className="w-4 h-4 text-gray-600" />
              </div>
              <div className="text-2xl mb-1">
                {monthlyStats.transactionCount}
              </div>
              <p className="text-xs text-gray-600">
                Top: {monthlyStats.topCategory}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        {/* Dashboard tabs main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              {/* three main tabs appearing in the main slider bar*/}
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>

              {/* this section will be conected with InsightsCharts, a seperate file including the relavant
              code for overview tab*/}
              <TabsContent
                value="overview"
                className="space-y-6 mt-6 transition-opacity duration-300 ease-in-out"
              >
                {/*this will be connected with InsightsCharts */}
                {/*Insight section charts will appear here*/}
                <InsightsCharts categorySpending={categorySpending} />
              </TabsContent>
              <TabsContent
                value="transactions"
                className="mt-6 transition-opacity duration-300 ease-in-out"
              >
                <Card>
                  <CardHeader>
                    {/*Transaction tab layout*/}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div>
                        <CardTitle>All Transactions</CardTitle>
                        <CardDescription>
                          {mockTransactions.length} transactions this month
                        </CardDescription>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-initial">
                          {/*searching specific transactions*/}
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            placeholder="Search..."
                            className="pl-10 w-full sm:w-[200px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>

                        {/* Filter feature allowing for filtering the transactions*/}
                        <Select
                          value={categoryFilter}
                          onValueChange={setCategoryFilter}
                        >
                          <SelectTrigger className="w-[130px]">
                            <Filter className="w-4 h-4 mr-2" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="groceries">Groceries</SelectItem>
                            <SelectItem value="dining">Dining</SelectItem>
                            <SelectItem value="shopping">Shopping</SelectItem>
                            <SelectItem value="transportation">
                              Transportation
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/*Transaction table is imported here*/}
                    <TransactionsTable transactions={mockTransactions} />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Insight tab layout */}
              <TabsContent
                value="insights"
                className="space-y-6 mt-6 transition-opacity duration-300 ease-in-out"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>AI-Powered Insights</CardTitle>
                    <CardDescription>
                      Personalized recommendations for your finances
                    </CardDescription>
                  </CardHeader>
                  {/* Insight appears in cards each card having a specific insight information */}
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-emerald-50 border-l-4 border-emerald-600 rounded">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-emerald-900 mb-1">
                            Great Savings Rate!
                          </h4>
                          <p className="text-sm text-emerald-800">
                            You're saving 61.3% of your income this month.
                            That's excellent! Keep it up to reach your goals
                            faster.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-blue-900 mb-1">
                            Shopping Trend Alert
                          </h4>
                          <p className="text-sm text-blue-800">
                            Your shopping spending is up 18% compared to last
                            month. Consider setting a budget to keep it in
                            check.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 border-l-4 border-purple-600 rounded">
                      <div className="flex items-start gap-3">
                        <PiggyBank className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-purple-900 mb-1">
                            Goal Progress
                          </h4>
                          <p className="text-sm text-purple-800">
                            At this rate, you'll reach your emergency fund goal
                            of $10,000 in just 4 more months!
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-amber-50 border-l-4 border-amber-600 rounded">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-amber-900 mb-1">
                            Subscription Reminder
                          </h4>
                          <p className="text-sm text-amber-800">
                            You have 5 active subscriptions totaling
                            $67.94/month. Review them to find potential savings.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/*this will be connected with InsightsCharts */}
                {/*Insight section charts will appear here*/}
                <InsightsCharts categorySpending={categorySpending} detailed />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

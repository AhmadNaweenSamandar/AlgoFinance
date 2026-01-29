import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  Download,
  ArrowUpDown,
  TrendingUp,
  CreditCard,
  PiggyBank,
} from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

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
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

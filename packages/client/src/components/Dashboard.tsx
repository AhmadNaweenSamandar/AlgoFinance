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
import { ChatPanel } from "./ChatPanel";

//imports for generating pdf report
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

//CHANING LOGO: Import the actual file from assets folder!
import algoFinanceLogo from "../assets/algo.jpg";

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

// Notice the '?' making the data optional, so older links don't break
interface DashboardProps {
  onNavigate: (page: string, data?: any) => void;
  financialData?: any; // We also add this to Dashboard so it can receive the data from Hero!
}

export function Dashboard({ onNavigate, financialData }: DashboardProps) {
  // useState handling overview navigation in the dashboard
  const [activeTab, setActiveTab] = useState("overview");
  // handling the search
  const [searchQuery, setSearchQuery] = useState("");
  // handling filtering the dashboard sections: (overview, transaction, insights)
  const [categoryFilter, setCategoryFilter] = useState("all");

  // THE FILTER ENGINE
  // We take the raw transactions and run them through two checkpoints.
  // If a transaction passes both checkpoints, it goes into the filtered array.
  const filteredTransactions =
    financialData?.transactions.filter((txn: any) => {
      // Checkpoint 1: The Search Bar
      // Does the description contain the typed letters? (Make both lowercase to be safe)
      const matchesSearch = txn.category
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      // Checkpoint 2: The Category Dropdown
      // If it's "all", it automatically passes.
      // Otherwise, check if the transaction's category includes the selected filter word.
      const matchesCategory =
        categoryFilter === "all" ||
        txn.category?.toLowerCase().includes(categoryFilter.toLowerCase());
      // Only keep the transaction if it passes BOTH checkpoints
      return matchesSearch && matchesCategory;
    }) || []; // Fallback to empty array if data isn't loaded yet

  // Calculate category spending from mock transactions
  const colors = {
    Food: "#500fe9",
    Dining: "#f59e0b",
    Shopping: "#8b5cf6",
    Transport: "#3b82f6",
    Entertainment: "#ec4899",
    Health: "#06b6d4",
    Income: "#10b981",
    Benefits: "#0d9488",
    Bills: "#f1f50b",
    Loans: "#dc2626",
    Transfers: "#b8129c",
    Cash: "#a16200",
  };

  const categorySpending = Object.entries(
    financialData.transactions
      .filter((t) => t.amount < 0)
      .reduce(
        (acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
          return acc;
        },
        {} as Record<string, number>,
      ),
  ).map(([category, amount]) => {
    const percentage = (amount / monthlyStats.totalExpenses) * 100;
    return {
      category,
      amount,
      percentage,
      color: colors[category as keyof typeof colors] || "#6b7280",
    };
  });

  //if user click on export report
  const handleExport = () => {
    toast.success("Report exported successfully!");
  };

  // THE PDF EXPORT ENGINE
  const handleExportPDF = () => {
    // 1. Create a new PDF document
    const doc = new jsPDF();
    const today = new Date().toLocaleDateString();

    // 2. Add the Header/Branding
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129); // Tailwind Emerald-500
    doc.text("AlgoFinance", 14, 20);

    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text("Personal Finance Report", 14, 30);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${today}`, 14, 36);

    // 3. Add the Category Spending Summary Table
    // We map your JSON array into a simple 2D array [["Food", "$400.00"], ...]
    const categoryRows = financialData.overview.map((item) => [
      item.category,
      `$${item.amount.toFixed(2)}`,
      `${item.percentage}%`,
    ]);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Spending by Category", 14, 50);

    autoTable(doc, {
      startY: 55,
      head: [["Category", "Amount", "Percentage"]],
      body: categoryRows,
      theme: "grid",
      headStyles: { fillColor: [16, 185, 129] }, // Emerald Green header
    });

    // 4. Add the Detailed Transactions Table
    // We use doc.lastAutoTable.finalY to know exactly where the last table ended!
    const finalY = (doc as any).lastAutoTable.finalY || 55;

    const transactionRows = financialData.transactions.map((t) => [
      t.date,
      t.description,
      t.category,
      `$${t.amount.toFixed(2)}`,
    ]);

    doc.text("Transaction History", 14, finalY + 15);

    autoTable(doc, {
      startY: finalY + 20,
      head: [["Date", "Description", "Category", "Amount"]],
      body: transactionRows,
      theme: "striped",
      headStyles: { fillColor: [55, 65, 81] }, // Dark Gray header for contrast
    });

    // 5. Trigger the download!
    doc.save(`AlgoFinance_Report_${today.replace(/\//g, "-")}.pdf`);
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
              {/* Logo Icon Container */}
              {/* ADDING LOGO: Added overflow-hidden to maintain rounded corner mask */}
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white p-0.5 shadow-inner">
                <img
                  src={algoFinanceLogo} // The imported variable from Step 1
                  alt="AlgoFinance Logo"
                  // THE FIX (Step 3): 'object-contain' forces logo to fit perfectly within the 32px box without cropping or stretching
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <span className="text-xl">AlgoFinance</span>
            </div>
            <div className="flex gap-1">
              {/* Button handling export report for the user */}
              <Button
                onClick={() => onNavigate("home")}
                className="gap-2 flex-1"
              >
                {" "}
                {/* redirect to home */}
                <span className="hidden sm:inline">End Session</span>
              </Button>
              {/* Button handling export report for the user */}
              <Button onClick={handleExportPDF} className="gap-2 flex-1">
                {" "}
                {/* handleExportPDF function added in onClick */}
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export Report</span>
              </Button>
            </div>
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
                ${financialData.summary.total_income.toLocaleString()}
              </div>
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
                ${financialData.summary.total_expenses.toLocaleString()}
              </div>
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
                ${financialData.summary.net_saving.toLocaleString()}
              </div>
              <p className="text-xs text-emerald-700">
                {financialData.insights[0].value} savings rate
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
                {financialData.summary.total_transactions}
              </div>
              <p className="text-xs text-gray-600">
                Top: {financialData.insights[1].value}
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
                <InsightsCharts categorySpending={financialData.overview} />
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
                          {financialData.summary.total_transactions}{" "}
                          transactions this month
                        </CardDescription>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-initial">
                          {/*searching specific transactions*/}
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            placeholder="Search category..."
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
                            <SelectItem value="food">Food</SelectItem>
                            <SelectItem value="dining">Dining</SelectItem>
                            <SelectItem value="shopping">Shopping</SelectItem>
                            <SelectItem value="transport">Transport</SelectItem>
                            <SelectItem value="entertainment">
                              Entertainment
                            </SelectItem>
                            <SelectItem value="utilities">Utilities</SelectItem>
                            <SelectItem value="benefits">Benefits</SelectItem>
                            <SelectItem value="bills">Bills</SelectItem>
                            <SelectItem value="loans">Loans</SelectItem>
                            <SelectItem value="transfer">Transfer</SelectItem>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/*Transaction table is imported here*/}
                    <TransactionsTable
                      //mockTransactions is replaced by financialData.transactions to connect the table with the data generated by backend
                      //changed to new filtered transactions to connect the search and filter features with the table
                      transactions={filteredTransactions}
                    />
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
                            {financialData.insights[0].title}
                          </h4>
                          <p className="text-sm text-emerald-800">
                            {financialData.insights[0].value} -{" "}
                            {financialData.insights[0].desc}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-blue-900 mb-1">
                            {financialData.insights[1].title}
                          </h4>
                          <p className="text-sm text-blue-800">
                            {financialData.insights[1].value} -{" "}
                            {financialData.insights[1].desc}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-purple-50 border-l-4 border-purple-600 rounded">
                      <div className="flex items-start gap-3">
                        <PiggyBank className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-purple-900 mb-1">
                            {financialData.insights[2].title}
                          </h4>
                          <p className="text-sm text-purple-800">
                            {financialData.insights[2].value} -{" "}
                            {financialData.insights[2].desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/*this will be connected with InsightsCharts */}
                {/*Insight section charts will appear here*/}
                <InsightsCharts
                  categorySpending={financialData.overview}
                  detailed
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Chat Sidebar */}
          <div className="lg:col-span-1">
            <ChatPanel onNavigate={onNavigate} />
          </div>
        </div>
      </div>
    </div>
  );
}

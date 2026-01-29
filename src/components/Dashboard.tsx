import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Download } from "lucide-react";

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
    </div>
  );
}

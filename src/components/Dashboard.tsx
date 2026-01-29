import { useState } from "react";
import { toast } from "sonner";

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
}

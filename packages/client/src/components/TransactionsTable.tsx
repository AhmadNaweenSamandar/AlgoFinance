import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

// Transaction table details
interface Transaction {
  id: number;
  date: string;
  description: string;
  category: string;
  amount: number;
  status: string;
}

interface TransactionsTableProps {
  transactions: Transaction[];
  compact?: boolean;
}

const categoryColors: Record<string, string> = {
  Food: "#10b981", 
  Transport: "#f97316",
  Utilities: "#eab308",
  Loans: "#ef4444",
  Entertainment: "#a855f7",
  Transfers: "#8c12b8", 
  Dining: "#BD0019", 
  Shopping: "#8B008B", 
  Health: "#3b82f6", 
  Income: "#00802f", 
  Benefits: "#ec4899", 
  Bills: "#b17000", 
  Cash: "#1A3977", 
  Other: "#9ca3af", 
};

export function TransactionsTable({
  transactions,
  compact = false,
}: TransactionsTableProps) {
  return (
    <div className="rounded-md border bg-white">
      <Table>
        {/* Transaction table titles */}
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Merchant</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* connecting transactions with id and assigning dates */}
          {transactions.map((transaction) => {
            // THE FIX: We calculate the color INSIDE the loop for each row!
            // Clean the category text so it matches the dictionary perfectly
            const rawCategory = transaction.category || "Other";
            const cleanCategory = rawCategory.trim().charAt(0).toUpperCase() + rawCategory.trim().slice(1).toLowerCase();
            
            // Look up the hex color
            const hexColor = categoryColors[cleanCategory] || "#9ca3af";

            return (
              <TableRow key={transaction.id}>
                <TableCell className="text-sm text-gray-600">
                  {new Date(transaction.date).toLocaleDateString("en-US", {
                    timeZone: "UTC",
                    month: "short",
                    day: "numeric",
                  })}
                </TableCell>
                
                {/* Transaction amount logic: if amount is negative assign red arrow up symbol, else arrow down green */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    {transaction.amount > 0 ? (
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <ArrowDownRight className="w-4 h-4 text-green-600" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <ArrowUpRight className="w-4 h-4 text-red-600" />
                      </div>
                    )}
                    <span className={compact ? "text-sm" : ""}>
                      {transaction.description}
                    </span>
                  </div>
                </TableCell>
                
                {/* assigning category in the badge */}
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="hover:bg-transparent border-transparent"
                    style={{
                      backgroundColor: `${hexColor}26`, // The exact backend color with 15% opacity!
                      color: hexColor,
                    }}
                  >
                    {cleanCategory}
                  </Badge>
                </TableCell>
                
                <TableCell className="text-right">
                  <span
                    className={
                      transaction.amount > 0 ? "text-green-600 font-medium" : "text-gray-900 font-medium"
                    }
                  >
                    {transaction.amount > 0 ? "+" : ""}
                    {transaction.amount < 0 ? "-" : ""}$
                    {Math.abs(transaction.amount).toFixed(2)}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
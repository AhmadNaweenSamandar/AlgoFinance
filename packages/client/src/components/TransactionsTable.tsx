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

//Transaction table details
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

//color and small rounded square assigned to each user
const categoryColors: Record<string, string> = {
  Food: "bg-emerald-100 text-emerald-700",
  Dining: "bg-blue-100 text-blue-700",
  Shopping: "bg-purple-100 text-purple-700",
  Transport: "bg-orange-100 text-orange-700",
  Entertainment: "bg-pink-100 text-pink-700",
  Health: "bg-cyan-100 text-cyan-700",
  Utilities: "bg-amber-100 text-amber-700",
  Income: "bg-green-100 text-green-700",
  Benefits: "bg-teal-100 text-white-700",
  Bills: "bg-yellow-100 text-orange-700",
  Loans: "bg-red-100 text-red-700",
  Transfer: "bg-gray-100 text-gray-700",
  Cash: "bg-gray-100 text-brown-700",
  Other: "bg-gray-100 text-gray-700",
};

export function TransactionsTable({
  transactions,
  compact = false,
}: TransactionsTableProps) {
  return (
    <div className="rounded-md border">
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
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="text-sm text-gray-600">
                {new Date(transaction.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </TableCell>
              {/* Transaction amount logic: if amount is negative assigne red arrow up symbol, else arrow down green */}
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
                  className={
                    categoryColors[transaction.category] ||
                    "bg-gray-100 text-gray-700"
                  }
                >
                  {transaction.category}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={
                    transaction.amount > 0 ? "text-green-600" : "text-red-600"
                  }
                >
                  {transaction.amount > 0 ? "+" : ""}
                  {transaction.amount < 0 ? "-" : ""}$
                  {Math.abs(transaction.amount).toFixed(2)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

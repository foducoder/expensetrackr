import { formatIndianCurrency } from "@/lib/formatters";
import { getInlineDateString } from "@/lib/dateUtils";
import { Transaction } from "@shared/schema";
import { ArrowDownLeft, ArrowUpRight, ShoppingBag, CreditCard, IndianRupee } from "lucide-react";
import { CategoryIcon } from "./CategoryPieChart";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TransactionListProps {
  transactions: Transaction[];
  loading?: boolean;
  showEmpty?: boolean;
}

export function TransactionList({ 
  transactions, 
  loading = false,
  showEmpty = false
}: TransactionListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-2">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0 && showEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">No transactions</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          No transactions found for this period or with the selected filters.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-[400px]">
      <div className="space-y-1">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between rounded-lg p-2 hover:bg-muted/50"
          >
            <div className="flex items-start space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <CategoryIcon category={transaction.category} size={16} />
              </div>
              <div>
                <p className="font-medium">{transaction.merchantName || transaction.description}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>{getInlineDateString(new Date(transaction.timestamp))}</span>
                  <span className="mx-1">•</span>
                  <span>{transaction.category}</span>
                  {transaction.source && (
                    <>
                      <span className="mx-1">•</span>
                      <span>{transaction.source}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className={`flex items-center font-medium ${
              transaction.type === 'debit' ? 'text-red-500' : 'text-green-600'
            }`}>
              {transaction.type === 'debit' ? (
                <ArrowDownLeft className="mr-1 h-3 w-3" />
              ) : (
                <ArrowUpRight className="mr-1 h-3 w-3" />
              )}
              {formatIndianCurrency(transaction.amount)}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { MonthNavigation } from "@/components/MonthNavigation";
import { ExpenseSummary } from "@/components/ExpenseSummary";
import { CategoryPieChart } from "@/components/CategoryPieChart";
import { SMSReader } from "@/components/SMSReader";
import { formatIndianCurrency } from "@/lib/formatters";
import { getInlineDateString } from "@/lib/dateUtils";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronRight, Filter, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionList } from "@/components/TransactionList";
import { useToast } from "@/hooks/use-toast";
import { Transaction } from "@shared/schema";

const Home = () => {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState<{year: number, month: number}>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // Fetch available months with transactions
  const { data: months, isLoading: isLoadingMonths } = useQuery({
    queryKey: ['/api/transactions/months'],
  });

  // Fetch transactions for the selected month
  const { 
    data: transactions, 
    isLoading: isLoadingTransactions,
    refetch: refetchTransactions
  } = useQuery<Transaction[]>({
    queryKey: [`/api/transactions/${selectedMonth.year}/${selectedMonth.month}`],
  });

  // Fetch category summary for the selected month
  const { 
    data: categorySummary, 
    isLoading: isLoadingCategories 
  } = useQuery({
    queryKey: [`/api/categories/${selectedMonth.year}/${selectedMonth.month}`],
  });

  // Calculate month totals
  const totals = {
    income: 0,
    expense: 0,
    balance: 0,
  };

  if (transactions) {
    transactions.forEach(tx => {
      if (tx.type === 'credit') {
        totals.income += tx.amount;
      } else {
        totals.expense += tx.amount;
      }
    });
    totals.balance = totals.income - totals.expense;
  }

  const handleRefresh = () => {
    refetchTransactions();
    toast({
      title: "Refreshed",
      description: "Transaction data has been refreshed",
    });
  };

  return (
    <div className="space-y-6 px-4 pb-8">
      <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:space-y-0">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="h-9"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <SMSReader onSync={refetchTransactions} />
        </div>
      </div>

      <MonthNavigation 
        selectedMonth={selectedMonth} 
        onSelectMonth={setSelectedMonth} 
        availableMonths={months || []}
        loading={isLoadingMonths}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ExpenseSummary 
          income={totals.income}
          expense={totals.expense}
          balance={totals.balance}
          loading={isLoadingTransactions}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Recent Transactions</CardTitle>
            <Link href={`/transactions/${selectedMonth.year}/${selectedMonth.month}`}>
              <Button variant="ghost" size="sm" className="text-sm">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <TransactionList 
              transactions={transactions?.slice(0, 5) || []}
              loading={isLoadingTransactions}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPieChart 
              data={categorySummary || []}
              loading={isLoadingCategories}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;

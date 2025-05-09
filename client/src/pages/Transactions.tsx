import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { MonthNavigation } from "@/components/MonthNavigation";
import { TransactionList } from "@/components/TransactionList";
import { SMSReader } from "@/components/SMSReader";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, RefreshCcw, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Transaction, TRANSACTION_CATEGORIES } from "@shared/schema";
import { Link } from "wouter";

const Transactions = () => {
  const { toast } = useToast();
  const params = useParams<{ year: string; month: string }>();
  const [_, setLocation] = useLocation();
  
  const [selectedMonth, setSelectedMonth] = useState<{year: number, month: number}>({
    year: parseInt(params.year, 10),
    month: parseInt(params.month, 10)
  });
  
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

  // Update URL when selected month changes
  useEffect(() => {
    setLocation(`/transactions/${selectedMonth.year}/${selectedMonth.month}`);
  }, [selectedMonth, setLocation]);

  // Filter transactions based on search query, category and type
  const filteredTransactions = transactions?.filter(tx => {
    // Filter by search query
    const matchesSearch = !searchQuery || 
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.merchantName && tx.merchantName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by category
    const matchesCategory = !selectedCategory || tx.category === selectedCategory;
    
    // Filter by type
    const matchesType = activeTab === "all" || 
      (activeTab === "expense" && tx.type === "debit") ||
      (activeTab === "income" && tx.type === "credit");
    
    return matchesSearch && matchesCategory && matchesType;
  }) || [];

  const handleRefresh = () => {
    refetchTransactions();
    toast({
      title: "Refreshed",
      description: "Transaction data has been refreshed",
    });
  };

  return (
    <div className="space-y-6 px-4 pb-8">
      <div className="flex items-center">
        <Link href="/">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
      </div>

      <MonthNavigation 
        selectedMonth={selectedMonth} 
        onSelectMonth={setSelectedMonth} 
        availableMonths={months || []}
        loading={isLoadingMonths}
      />

      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
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
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full sm:w-[250px]"
          />
          <Select value={selectedCategory || ''} onValueChange={(value) => setSelectedCategory(value || null)}>
            <SelectTrigger className="h-9 w-full sm:w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {TRANSACTION_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="expense">Expenses</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                {filteredTransactions.length} Transaction{filteredTransactions.length !== 1 ? 's' : ''}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionList 
                transactions={filteredTransactions}
                loading={isLoadingTransactions}
                showEmpty={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Transactions;

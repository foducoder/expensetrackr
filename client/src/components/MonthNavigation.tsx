import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { getMonthName } from "@/lib/dateUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MonthNavigationProps {
  selectedMonth: { year: number; month: number };
  onSelectMonth: (month: { year: number; month: number }) => void;
  availableMonths?: { year: number; month: number }[];
  loading?: boolean;
}

export function MonthNavigation({ 
  selectedMonth, 
  onSelectMonth, 
  availableMonths = [],
  loading = false
}: MonthNavigationProps) {
  // Create a list of unique years from availableMonths
  const availableYears = Array.from(
    new Set(availableMonths.map((m) => m.year))
  ).sort((a, b) => b - a);

  // Get current month's display text
  const currentMonthText = `${getMonthName(selectedMonth.month)} ${selectedMonth.year}`;

  // Check if previous/next month buttons should be disabled
  const isPreviousDisabled = !availableMonths.some(m => 
    (m.year < selectedMonth.year) || 
    (m.year === selectedMonth.year && m.month < selectedMonth.month)
  );
  
  const isNextDisabled = !availableMonths.some(m => 
    (m.year > selectedMonth.year) || 
    (m.year === selectedMonth.year && m.month > selectedMonth.month)
  );

  // Handle month navigation
  const goToPreviousMonth = () => {
    let newYear = selectedMonth.year;
    let newMonth = selectedMonth.month - 1;
    
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    
    onSelectMonth({ year: newYear, month: newMonth });
  };
  
  const goToNextMonth = () => {
    let newYear = selectedMonth.year;
    let newMonth = selectedMonth.month + 1;
    
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    
    onSelectMonth({ year: newYear, month: newMonth });
  };

  // Generate dropdown options for months within the selected year
  const monthsInSelectedYear = availableMonths
    .filter(m => m.year === selectedMonth.year)
    .sort((a, b) => b.month - a.month);

  // If no months are available yet, add current month
  useEffect(() => {
    if (!loading && availableMonths.length === 0) {
      const now = new Date();
      onSelectMonth({ year: now.getFullYear(), month: now.getMonth() });
    }
  }, [loading, availableMonths, onSelectMonth]);

  if (loading) {
    return (
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-32" />
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div className="flex items-center space-x-3">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
          <Select
            value={selectedMonth.year.toString()}
            onValueChange={(value) => {
              const year = parseInt(value, 10);
              // When changing year, try to keep the same month if it exists
              const monthsInNewYear = availableMonths.filter(m => m.year === year);
              const hasSelectedMonth = monthsInNewYear.some(m => m.month === selectedMonth.month);
              
              if (hasSelectedMonth) {
                onSelectMonth({ year, month: selectedMonth.month });
              } else if (monthsInNewYear.length > 0) {
                // Select the latest month in the new year
                const latestMonth = monthsInNewYear.reduce((prev, curr) => 
                  prev.month > curr.month ? prev : curr
                );
                onSelectMonth({ year, month: latestMonth.month });
              }
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={selectedMonth.month.toString()}
            onValueChange={(value) => {
              onSelectMonth({ 
                year: selectedMonth.year, 
                month: parseInt(value, 10) 
              });
            }}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {monthsInSelectedYear.map((m) => (
                <SelectItem key={m.month} value={m.month.toString()}>
                  {getMonthName(m.month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={goToPreviousMonth}
          disabled={isPreviousDisabled}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={goToNextMonth}
          disabled={isNextDisabled}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

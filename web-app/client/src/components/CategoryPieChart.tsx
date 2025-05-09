import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { TRANSACTION_CATEGORIES } from "@shared/schema";
import { formatIndianCurrency } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBag, Coffee, Film, Bus, Zap, Heart, GraduationCap, Plane, ShoppingCart, PiggyBank, Briefcase, Home, CreditCard, CircleDollarSign } from "lucide-react";

// Define color palette for categories
const COLORS = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#f59e0b', // amber-500
  '#eab308', // yellow-500
  '#84cc16', // lime-500
  '#22c55e', // green-500
  '#10b981', // emerald-500
  '#14b8a6', // teal-500
  '#06b6d4', // cyan-500
  '#0ea5e9', // sky-500
  '#3b82f6', // blue-500
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#a855f7', // purple-500
];

interface CategoryPieChartProps {
  data: { category: string; total: number }[];
  loading?: boolean;
}

export function CategoryIcon({ category, size = 20 }: { category: string; size?: number }) {
  const props = { size };
  
  switch (category) {
    case "Food & Dining":
      return <Coffee {...props} />;
    case "Shopping":
      return <ShoppingBag {...props} />;
    case "Entertainment":
      return <Film {...props} />;
    case "Transportation":
      return <Bus {...props} />;
    case "Utilities":
      return <Zap {...props} />;
    case "Health":
      return <Heart {...props} />;
    case "Education":
      return <GraduationCap {...props} />;
    case "Travel":
      return <Plane {...props} />;
    case "Groceries":
      return <ShoppingCart {...props} />;
    case "Investment":
      return <PiggyBank {...props} />;
    case "Salary":
      return <Briefcase {...props} />;
    case "Rent":
      return <Home {...props} />;
    case "Other Income":
      return <CreditCard {...props} />;
    case "Other Expense":
    default:
      return <CircleDollarSign {...props} />;
  }
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <p className="text-sm font-medium">{data.category}</p>
        <p className="text-sm text-muted-foreground">
          {formatIndianCurrency(data.total)} ({data.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

export function CategoryPieChart({ data, loading = false }: CategoryPieChartProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-2">
        <Skeleton className="h-40 w-40 rounded-full" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-sm font-medium">No expense data</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          No expenses found for this period.
        </p>
      </div>
    );
  }

  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.total, 0);
  
  // Prepare data with percentages
  const chartData = data.map((item, index) => ({
    ...item,
    percentage: Math.round((item.total / total) * 100),
    fill: COLORS[index % COLORS.length],
  }));

  return (
    <div className="flex flex-col">
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              dataKey="total"
              nameKey="category"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
        {chartData.slice(0, 6).map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center space-x-1">
            <div
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <div className="truncate">
              {entry.category} ({entry.percentage}%)
            </div>
          </div>
        ))}
        {chartData.length > 6 && (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-gray-300" />
            <div>+{chartData.length - 6} more</div>
          </div>
        )}
      </div>
    </div>
  );
}

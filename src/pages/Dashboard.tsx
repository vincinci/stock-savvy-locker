
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import StatsCard from "@/components/dashboard/StatsCard";
import ProductList from "@/components/products/ProductList";
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ShoppingCart 
} from "lucide-react";

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Remove simulated loading
    setIsLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your inventory and stock statistics.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Products"
          value={isLoading ? "--" : "0"}
          description="Total products in inventory"
          icon={<Package className="h-5 w-5 text-muted-foreground" />}
        />
        <StatsCard
          title="Total Value"
          value={isLoading ? "--" : "$0"}
          description="Inventory valuation"
          icon={<TrendingUp className="h-5 w-5 text-muted-foreground" />}
        />
        <StatsCard
          title="Low Stock Items"
          value={isLoading ? "--" : "0"}
          description="Products close to out of stock"
          icon={<AlertTriangle className="h-5 w-5 text-muted-foreground" />}
        />
        <StatsCard
          title="Recent Orders"
          value={isLoading ? "--" : "0"}
          description="Last 7 days"
          icon={<ShoppingCart className="h-5 w-5 text-muted-foreground" />}
        />
      </div>
      
      <ProductList />
    </div>
  );
}

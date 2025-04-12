
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
import { useProducts } from "@/components/products/useProducts";

export default function Dashboard() {
  const { products, isLoading } = useProducts();
  
  // Calculated statistics
  const totalProducts = products.length;
  
  const totalValue = products.reduce((sum, product) => {
    return sum + (product.price * product.stock);
  }, 0);
  
  const lowStockItems = products.filter(product => product.stock <= 10).length;
  
  // For recent orders, we'll just show a placeholder since we don't have order tracking yet
  const recentOrders = 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your inventory and stock statistics.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Products"
          value={isLoading ? "--" : totalProducts.toString()}
          description="Total products in inventory"
          icon={<Package className="h-5 w-5 text-muted-foreground" />}
        />
        <StatsCard
          title="Total Value"
          value={isLoading ? "--" : `${totalValue.toLocaleString('en-US')} RWF`}
          description="Inventory valuation"
          icon={<TrendingUp className="h-5 w-5 text-muted-foreground" />}
        />
        <StatsCard
          title="Low Stock Items"
          value={isLoading ? "--" : lowStockItems.toString()}
          description="Products with 10 or fewer items"
          icon={<AlertTriangle className="h-5 w-5 text-muted-foreground" />}
        />
        <StatsCard
          title="Recent Orders"
          value={isLoading ? "--" : recentOrders.toString()}
          description="Last 7 days"
          icon={<ShoppingCart className="h-5 w-5 text-muted-foreground" />}
        />
      </div>
      
      <ProductList />
    </div>
  );
}

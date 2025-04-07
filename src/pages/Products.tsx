
import ProductList from "@/components/products/ProductList";

export default function Products() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground">Manage your product inventory.</p>
      </div>
      
      <ProductList />
    </div>
  );
}

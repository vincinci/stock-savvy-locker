
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, FileText, Plus, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Product {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  sku: string;
}

// Mock data
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Wireless Earbuds",
    category: "Electronics",
    stock: 45,
    price: 59.99,
    sku: "EAR-001",
  },
  {
    id: "2",
    name: "Leather Wallet",
    category: "Accessories",
    stock: 120,
    price: 29.99,
    sku: "WAL-002",
  },
  {
    id: "3",
    name: "Smart Watch",
    category: "Electronics",
    stock: 18,
    price: 199.99,
    sku: "WAT-003",
  },
  {
    id: "4",
    name: "Office Chair",
    category: "Furniture",
    stock: 7,
    price: 149.99,
    sku: "FUR-004",
  },
  {
    id: "5",
    name: "Coffee Maker",
    category: "Home",
    stock: 32,
    price: 89.99,
    sku: "HOM-005",
  },
];

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    category: 'Electronics',
    stock: 0,
    price: 0,
    sku: '',
  });
  const { toast } = useToast();

  // Function to handle delete product
  const handleDelete = (id: string) => {
    setProducts(products.filter((product) => product.id !== id));
    toast({
      title: "Product deleted",
      description: "The product has been removed from inventory.",
    });
  };

  // Function to open edit dialog
  const handleEditOpen = (product: Product) => {
    setCurrentProduct({ ...product });
    setIsEditOpen(true);
  };

  // Function to handle edit product
  const handleEditSave = () => {
    if (!currentProduct) return;

    setProducts(products.map((p) => 
      p.id === currentProduct.id ? currentProduct : p
    ));
    
    setIsEditOpen(false);
    toast({
      title: "Product updated",
      description: "The product details have been updated.",
    });
  };

  // Function to open add dialog
  const handleAddOpen = () => {
    setNewProduct({
      name: '',
      category: 'Electronics',
      stock: 0,
      price: 0,
      sku: '',
    });
    setIsAddOpen(true);
  };

  // Function to handle add product
  const handleAddSave = () => {
    // Generate a unique ID
    const newId = (Math.max(...products.map(p => parseInt(p.id))) + 1).toString();
    
    const productToAdd: Product = {
      id: newId,
      ...newProduct
    };
    
    setProducts([...products, productToAdd]);
    setIsAddOpen(false);
    toast({
      title: "Product added",
      description: "The new product has been added to inventory.",
    });
  };

  // Function to export products as CSV
  const exportToCSV = () => {
    // Create CSV header
    const headers = ["Name", "Category", "SKU", "Price", "Stock"];
    
    // Convert products to CSV format
    const csvRows = products.map((product) => {
      return [
        product.name,
        product.category,
        product.sku,
        product.price.toFixed(2),
        product.stock,
      ].join(",");
    });

    // Combine header and rows
    const csvContent = [headers.join(","), ...csvRows].join("\n");
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link to trigger download
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "inventory-products.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: "The product list has been exported as CSV.",
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Products Inventory</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <FileText className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button size="sm" onClick={handleAddOpen}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton className="h-4 w-[120px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[80px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[80px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[60px]" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-[50px]" />
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Skeleton className="h-8 w-8 rounded-md" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={product.stock > 10 ? "outline" : "destructive"}
                        >
                          {product.stock}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditOpen(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={currentProduct?.name || ""}
                onChange={(e) => setCurrentProduct(prev => prev ? { ...prev, name: e.target.value } : null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select 
                value={currentProduct?.category}
                onValueChange={(value) => setCurrentProduct(prev => prev ? { ...prev, category: value } : null)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Accessories">Accessories</SelectItem>
                  <SelectItem value="Furniture">Furniture</SelectItem>
                  <SelectItem value="Home">Home</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sku" className="text-right">
                SKU
              </Label>
              <Input
                id="sku"
                value={currentProduct?.sku || ""}
                onChange={(e) => setCurrentProduct(prev => prev ? { ...prev, sku: e.target.value } : null)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price ($)
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={currentProduct?.price || 0}
                onChange={(e) => setCurrentProduct(prev => 
                  prev ? { ...prev, price: parseFloat(e.target.value) } : null
                )}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">
                Stock
              </Label>
              <Input
                id="stock"
                type="number"
                value={currentProduct?.stock || 0}
                onChange={(e) => setCurrentProduct(prev => 
                  prev ? { ...prev, stock: parseInt(e.target.value) } : null
                )}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-name" className="text-right">
                Name
              </Label>
              <Input
                id="new-name"
                value={newProduct.name}
                onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-category" className="text-right">
                Category
              </Label>
              <Select 
                value={newProduct.category}
                onValueChange={(value) => setNewProduct(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Accessories">Accessories</SelectItem>
                  <SelectItem value="Furniture">Furniture</SelectItem>
                  <SelectItem value="Home">Home</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-sku" className="text-right">
                SKU
              </Label>
              <Input
                id="new-sku"
                value={newProduct.sku}
                onChange={(e) => setNewProduct(prev => ({ ...prev, sku: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-price" className="text-right">
                Price ($)
              </Label>
              <Input
                id="new-price"
                type="number"
                step="0.01"
                value={newProduct.price || ""}
                onChange={(e) => setNewProduct(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-stock" className="text-right">
                Stock
              </Label>
              <Input
                id="new-stock"
                type="number"
                value={newProduct.stock || ""}
                onChange={(e) => setNewProduct(prev => ({ ...prev, stock: parseInt(e.target.value) }))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSave}>Add Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

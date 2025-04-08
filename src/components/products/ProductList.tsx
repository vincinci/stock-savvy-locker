import { useState, useEffect } from "react";
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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

interface Product {
  id: string;
  name: string;
  category: string | null;
  stock: number;
  price: number;
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    category: '',
    stock: 0,
    price: 0,
  });
  
  const [categories, setCategories] = useState<string[]>([]);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('stock_items')
          .select('*');
        
        if (error) {
          console.error('Error fetching products:', error);
          toast({
            title: "Failed to load products",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
        
        const uniqueCategories = Array.from(
          new Set(data.map(item => item.category).filter(Boolean) as string[])
        );
        setCategories(uniqueCategories);
        
        const mappedProducts: Product[] = data.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          stock: item.quantity,
          price: item.price,
        }));
        
        setProducts(mappedProducts);
      } catch (err) {
        console.error('Unexpected error:', err);
        toast({
          title: "An unexpected error occurred",
          description: "Could not load products. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  const handleDelete = async (id: string) => {
    try {
      const { error: historyDeleteError } = await supabase
        .from('stock_history')
        .delete()
        .eq('item_id', id);
      
      if (historyDeleteError) {
        throw historyDeleteError;
      }
      
      const { error: productDeleteError } = await supabase
        .from('stock_items')
        .delete()
        .eq('id', id);
      
      if (productDeleteError) {
        throw productDeleteError;
      }
      
      setProducts(products.filter((product) => product.id !== id));
      
      toast({
        title: "Product deleted",
        description: "The product and its history have been removed.",
      });
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: "Failed to delete product",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditOpen = (product: Product) => {
    setCurrentProduct({ ...product });
    setIsEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!currentProduct) return;

    try {
      const { error } = await supabase
        .from('stock_items')
        .update({
          name: currentProduct.name,
          category: currentProduct.category,
          quantity: currentProduct.stock,
          price: currentProduct.price
        })
        .eq('id', currentProduct.id);
      
      if (error) {
        throw error;
      }
      
      await supabase
        .from('stock_history')
        .insert({
          item_id: currentProduct.id,
          action: 'updated'
        });
      
      setProducts(products.map((p) => 
        p.id === currentProduct.id ? currentProduct : p
      ));
      
      setIsEditOpen(false);
      toast({
        title: "Product updated",
        description: "The product details have been updated.",
      });
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast({
        title: "Failed to update product",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddOpen = () => {
    setNewProduct({
      name: '',
      category: categories.length > 0 ? categories[0] : null,
      stock: 0,
      price: 0,
    });
    setIsAddOpen(true);
  };

  const handleAddSave = async () => {
    try {
      const id = uuidv4();
      
      const { error } = await supabase
        .from('stock_items')
        .insert({
          id,
          name: newProduct.name,
          category: newProduct.category,
          quantity: newProduct.stock,
          price: newProduct.price
        });
      
      if (error) {
        throw error;
      }
      
      await supabase
        .from('stock_history')
        .insert({
          item_id: id,
          action: 'added'
        });
      
      const productToAdd: Product = {
        id,
        ...newProduct
      };
      
      setProducts([...products, productToAdd]);
      
      if (newProduct.category && !categories.includes(newProduct.category)) {
        setCategories([...categories, newProduct.category]);
      }
      
      setIsAddOpen(false);
      toast({
        title: "Product added",
        description: "The new product has been added to inventory.",
      });
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast({
        title: "Failed to add product",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const headers = ["Name", "Category", "Price (RWF)", "Stock"];
    
    const csvRows = products.map((product) => {
      return [
        product.name,
        product.category || "",
        product.price.toLocaleString('en-US'),
        product.stock,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...csvRows].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
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

  const handleAddCategory = () => {
    if (newCategory.trim() === '') return;
    if (categories.includes(newCategory.trim())) {
      toast({
        title: "Category exists",
        description: "This category already exists in the list.",
        variant: "destructive",
      });
      return;
    }
    
    setCategories([...categories, newCategory.trim()]);
    setNewCategory("");
    
    toast({
      title: "Category added",
      description: `"${newCategory.trim()}" has been added to categories.`,
    });
  };

  const openDeleteCategoryDialog = (category: string) => {
    setCategoryToDelete(category);
    setIsDeleteCategoryDialogOpen(true);
  };

  const handleDeleteCategory = () => {
    if (!categoryToDelete) return;
    
    const productsUsingCategory = products.filter(p => p.category === categoryToDelete);
    
    if (productsUsingCategory.length > 0) {
      toast({
        title: "Cannot delete category",
        description: `There are ${productsUsingCategory.length} products using this category. Please reassign them first.`,
        variant: "destructive",
      });
    } else {
      setCategories(categories.filter(c => c !== categoryToDelete));
      toast({
        title: "Category deleted",
        description: `"${categoryToDelete}" has been removed from categories.`,
      });
    }
    
    setCategoryToDelete(null);
    setIsDeleteCategoryDialogOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Products Inventory</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsCategorySheetOpen(true)}>
              Manage Categories
            </Button>
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
                  <TableHead className="text-right">Price (RWF)</TableHead>
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
                      <TableCell className="text-right">{product.price.toLocaleString('en-US')} RWF</TableCell>
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
                value={currentProduct?.category || ""}
                onValueChange={(value) => setCurrentProduct(prev => prev ? { ...prev, category: value } : null)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price (RWF)
              </Label>
              <Input
                id="price"
                type="number"
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
                value={newProduct.category || ""}
                onValueChange={(value) => setNewProduct(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-price" className="text-right">
                Price (RWF)
              </Label>
              <Input
                id="new-price"
                type="number"
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

      <Sheet open={isCategorySheetOpen} onOpenChange={setIsCategorySheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Manage Categories</SheetTitle>
          </SheetHeader>
          
          <div className="py-6">
            <div className="flex items-center space-x-2 mb-6">
              <Input
                placeholder="New category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCategory();
                  }
                }}
              />
              <Button onClick={handleAddCategory}>Add</Button>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Current Categories</h3>
              {categories.length === 0 ? (
                <p className="text-sm text-muted-foreground">No categories defined</p>
              ) : (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category} className="flex justify-between items-center p-2 border rounded-md">
                      <span>{category}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openDeleteCategoryDialog(category)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <SheetFooter>
            <Button variant="outline" onClick={() => setIsCategorySheetOpen(false)}>
              Close
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDeleteCategoryDialogOpen} onOpenChange={setIsDeleteCategoryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to delete the "{categoryToDelete}" category. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

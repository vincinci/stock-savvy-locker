
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import { useProducts } from "./useProducts";
import { ProductTable } from "./ProductTable";
import { EditProductDialog } from "./EditProductDialog";
import { AddProductDialog } from "./AddProductDialog";
import { CategoryManager } from "./CategoryManager";
import { exportProductsToCSV } from "./productUtils";
import { Product } from "./types";

export default function ProductList() {
  const {
    products,
    categories,
    isLoading,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    deleteCategory
  } = useProducts();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  const handleEditOpen = (product: Product) => {
    setCurrentProduct({ ...product });
    setIsEditOpen(true);
  };

  const handleEditSave = async (product: Product) => {
    const success = await updateProduct(product);
    if (success) {
      setIsEditOpen(false);
    }
  };

  const handleAddOpen = () => {
    setIsAddOpen(true);
  };

  const handleAddSave = async (newProduct: Omit<Product, 'id'>) => {
    const success = await addProduct(newProduct);
    if (success) {
      setIsAddOpen(false);
    }
  };

  const handleExportCSV = () => {
    exportProductsToCSV(products);
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
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
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
          <ProductTable 
            products={products}
            isLoading={isLoading}
            onEdit={handleEditOpen}
            onDelete={deleteProduct}
          />
        </CardContent>
      </Card>

      <EditProductDialog 
        product={currentProduct}
        categories={categories}
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        onSave={handleEditSave}
      />

      <AddProductDialog 
        categories={categories}
        isOpen={isAddOpen}
        setIsOpen={setIsAddOpen}
        onSave={handleAddSave}
      />

      <CategoryManager 
        categories={categories}
        isOpen={isCategorySheetOpen}
        setIsOpen={setIsCategorySheetOpen}
        onAddCategory={addCategory}
        onDeleteCategory={deleteCategory}
      />
    </>
  );
}

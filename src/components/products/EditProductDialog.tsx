
import React, { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "./types";

interface EditProductDialogProps {
  product: Product | null;
  categories: string[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSave: (product: Product) => void;
}

export const EditProductDialog = ({
  product,
  categories,
  isOpen,
  setIsOpen,
  onSave
}: EditProductDialogProps) => {
  const [currentProduct, setCurrentProduct] = useState<Product | null>(product);

  // Update local state when product prop changes
  React.useEffect(() => {
    setCurrentProduct(product);
  }, [product]);

  const handleSave = () => {
    if (currentProduct) {
      onSave(currentProduct);
    }
  };

  if (!currentProduct) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

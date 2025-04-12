
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NewProduct } from "./types";

interface AddProductDialogProps {
  categories: string[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSave: (product: NewProduct) => void;
}

export const AddProductDialog = ({
  categories,
  isOpen,
  setIsOpen,
  onSave
}: AddProductDialogProps) => {
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: '',
    category: null,
    stock: 0,
    price: 0,
  });

  // Reset form when dialog opens and set default category if available
  useEffect(() => {
    if (isOpen) {
      setNewProduct({
        name: '',
        category: categories.length > 0 ? categories[0] : null,
        stock: 0,
        price: 0,
      });
    }
  }, [isOpen, categories]);

  const handleSave = () => {
    onSave(newProduct);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Add Product</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

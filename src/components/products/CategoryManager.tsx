
import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface CategoryManagerProps {
  categories: string[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onAddCategory: (category: string) => boolean;
  onDeleteCategory: (category: string) => boolean;
}

export const CategoryManager = ({
  categories,
  isOpen,
  setIsOpen,
  onAddCategory,
  onDeleteCategory
}: CategoryManagerProps) => {
  const [newCategory, setNewCategory] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleAddCategory = () => {
    if (onAddCategory(newCategory)) {
      setNewCategory("");
    }
  };

  const openDeleteDialog = (category: string) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteCategory = () => {
    if (categoryToDelete) {
      onDeleteCategory(categoryToDelete);
    }
    setCategoryToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
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
                        onClick={() => openDeleteDialog(category)}
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
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
};


import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { Product, NewProduct } from "./types";

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
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

  const addProduct = async (newProduct: NewProduct) => {
    if (!newProduct.name || newProduct.price < 0 || newProduct.stock < 0) {
      toast({
        title: "Invalid Product Details",
        description: "Please check product name, price, and stock.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const id = uuidv4();
      
      const { error: insertError } = await supabase
        .from('stock_items')
        .insert({
          id,
          name: newProduct.name,
          category: newProduct.category,
          quantity: newProduct.stock,
          price: newProduct.price
        });
      
      if (insertError) {
        console.error('Error inserting product:', insertError);
        toast({
          title: "Failed to add product",
          description: insertError.message,
          variant: "destructive",
        });
        return false;
      }
      
      const { error: historyError } = await supabase
        .from('stock_history')
        .insert({
          item_id: id,
          action: 'added'
        });
      
      if (historyError) {
        console.error('Error logging product history:', historyError);
        // We'll still consider this a success since the product was added
      }
      
      const productToAdd: Product = {
        id,
        ...newProduct
      };
      
      setProducts(prev => [...prev, productToAdd]);
      
      if (newProduct.category && !categories.includes(newProduct.category)) {
        setCategories(prev => [...prev, newProduct.category]);
      }
      
      toast({
        title: "Product added",
        description: "The new product has been added to inventory.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Unexpected error adding product:', error);
      toast({
        title: "Failed to add product",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    if (!updatedProduct.name || updatedProduct.price < 0 || updatedProduct.stock < 0) {
      toast({
        title: "Invalid Product Details",
        description: "Please check product name, price, and stock.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error: updateError } = await supabase
        .from('stock_items')
        .update({
          name: updatedProduct.name,
          category: updatedProduct.category,
          quantity: updatedProduct.stock,
          price: updatedProduct.price
        })
        .eq('id', updatedProduct.id);
      
      if (updateError) {
        console.error('Error updating product:', updateError);
        toast({
          title: "Failed to update product",
          description: updateError.message,
          variant: "destructive",
        });
        return false;
      }
      
      const { error: historyError } = await supabase
        .from('stock_history')
        .insert({
          item_id: updatedProduct.id,
          action: 'updated'
        });
      
      if (historyError) {
        console.error('Error logging product history:', historyError);
        // We'll still consider this a success since the product was updated
      }
      
      setProducts(prev => 
        prev.map((p) => p.id === updatedProduct.id ? updatedProduct : p)
      );
      
      toast({
        title: "Product updated",
        description: "The product details have been updated.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Unexpected error updating product:', error);
      toast({
        title: "Failed to update product",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      // First, delete associated history records
      const { error: historyDeleteError } = await supabase
        .from('stock_history')
        .delete()
        .eq('item_id', id);
      
      if (historyDeleteError) {
        console.error('Error deleting product history:', historyDeleteError);
        toast({
          title: "Failed to delete product history",
          description: historyDeleteError.message,
          variant: "destructive",
        });
        return false;
      }
      
      // Then delete the product itself
      const { error: productDeleteError } = await supabase
        .from('stock_items')
        .delete()
        .eq('id', id);
      
      if (productDeleteError) {
        console.error('Error deleting product:', productDeleteError);
        toast({
          title: "Failed to delete product",
          description: productDeleteError.message,
          variant: "destructive",
        });
        return false;
      }
      
      // Remove the product from local state
      setProducts(prev => prev.filter((product) => product.id !== id));
      
      toast({
        title: "Product deleted",
        description: "The product and its history have been removed.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Unexpected error deleting product:', error);
      toast({
        title: "Failed to delete product",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const addCategory = (newCategory: string) => {
    if (newCategory.trim() === '') return false;
    if (categories.includes(newCategory.trim())) {
      toast({
        title: "Category exists",
        description: "This category already exists in the list.",
        variant: "destructive",
      });
      return false;
    }
    
    setCategories(prev => [...prev, newCategory.trim()]);
    
    toast({
      title: "Category added",
      description: `"${newCategory.trim()}" has been added to categories.`,
    });
    
    return true;
  };

  const deleteCategory = (categoryToDelete: string) => {
    const productsUsingCategory = products.filter(p => p.category === categoryToDelete);
    
    if (productsUsingCategory.length > 0) {
      toast({
        title: "Cannot delete category",
        description: `There are ${productsUsingCategory.length} products using this category. Please reassign them first.`,
        variant: "destructive",
      });
      return false;
    } else {
      setCategories(prev => prev.filter(c => c !== categoryToDelete));
      toast({
        title: "Category deleted",
        description: `"${categoryToDelete}" has been removed from categories.`,
      });
      return true;
    }
  };

  return {
    products,
    categories,
    isLoading,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    deleteCategory,
    fetchProducts
  };
};

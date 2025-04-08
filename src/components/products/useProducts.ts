
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
      
      toast({
        title: "Product added",
        description: "The new product has been added to inventory.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast({
        title: "Failed to add product",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    try {
      const { error } = await supabase
        .from('stock_items')
        .update({
          name: updatedProduct.name,
          category: updatedProduct.category,
          quantity: updatedProduct.stock,
          price: updatedProduct.price
        })
        .eq('id', updatedProduct.id);
      
      if (error) {
        throw error;
      }
      
      await supabase
        .from('stock_history')
        .insert({
          item_id: updatedProduct.id,
          action: 'updated'
        });
      
      setProducts(products.map((p) => 
        p.id === updatedProduct.id ? updatedProduct : p
      ));
      
      toast({
        title: "Product updated",
        description: "The product details have been updated.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast({
        title: "Failed to update product",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteProduct = async (id: string) => {
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
      
      return true;
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: "Failed to delete product",
        description: error.message,
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
    
    setCategories([...categories, newCategory.trim()]);
    
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
      setCategories(categories.filter(c => c !== categoryToDelete));
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
    deleteCategory
  };
};

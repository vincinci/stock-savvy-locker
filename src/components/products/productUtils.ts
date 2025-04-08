
import { Product } from "./types";

export const exportProductsToCSV = (products: Product[]) => {
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

  return true;
};

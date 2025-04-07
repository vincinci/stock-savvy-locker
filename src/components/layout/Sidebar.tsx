
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Package, 
  BarChart, 
  ShoppingCart, 
  Truck, 
  Settings, 
  Users, 
  AlertTriangle
} from "lucide-react";

const sidebarItems = [
  {
    title: "Dashboard",
    icon: BarChart,
    href: "/dashboard",
  },
  {
    title: "Products",
    icon: Package,
    href: "/products",
  },
  {
    title: "Orders",
    icon: ShoppingCart,
    href: "/orders",
  },
  {
    title: "Suppliers",
    icon: Truck,
    href: "/suppliers",
  },
  {
    title: "Users",
    icon: Users,
    href: "/users",
  },
  {
    title: "Low Stock",
    icon: AlertTriangle,
    href: "/low-stock",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export default function Sidebar() {
  const location = useLocation();
  
  return (
    <aside className="hidden border-r bg-sidebar md:block md:w-64 lg:w-72">
      <div className="flex h-full flex-col space-y-2 py-6">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Main Menu
          </h2>
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                  location.pathname === item.href
                    ? "bg-sidebar-accent text-primary font-medium"
                    : "text-sidebar-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

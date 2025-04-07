
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface HistoryItem {
  id: string;
  productName: string;
  action: "added" | "updated" | "deleted" | "adjusted";
  quantity: number;
  date: string;
  user: string;
}

// Mock data for history items
const mockHistoryItems: HistoryItem[] = [
  {
    id: "1",
    productName: "Wireless Earbuds",
    action: "added",
    quantity: 20,
    date: "2025-04-05T14:30:00",
    user: "admin@example.com",
  },
  {
    id: "2",
    productName: "Smart Watch",
    action: "updated",
    quantity: 5,
    date: "2025-04-04T09:15:00",
    user: "manager@example.com",
  },
  {
    id: "3",
    productName: "Coffee Maker",
    action: "adjusted",
    quantity: -3,
    date: "2025-04-03T16:45:00",
    user: "admin@example.com",
  },
  {
    id: "4",
    productName: "Office Chair",
    action: "deleted",
    quantity: 0,
    date: "2025-04-02T11:20:00",
    user: "manager@example.com",
  },
  {
    id: "5",
    productName: "Leather Wallet",
    action: "adjusted",
    quantity: 10,
    date: "2025-04-01T13:50:00",
    user: "admin@example.com",
  },
];

export default function History() {
  const [historyItems] = useState<HistoryItem[]>(mockHistoryItems);

  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Function to get badge color based on action
  const getActionBadge = (action: HistoryItem["action"]) => {
    switch (action) {
      case "added":
        return <Badge className="bg-green-600">Added</Badge>;
      case "updated":
        return <Badge className="bg-blue-600">Updated</Badge>;
      case "deleted":
        return <Badge className="bg-red-600">Deleted</Badge>;
      case "adjusted":
        return <Badge className="bg-amber-600">Adjusted</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">History</h1>
        <p className="text-muted-foreground">Track inventory changes over time.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Inventory History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell>{getActionBadge(item.action)}</TableCell>
                    <TableCell>
                      {item.action === "deleted" 
                        ? "-" 
                        : item.quantity > 0 
                          ? `+${item.quantity}` 
                          : item.quantity}
                    </TableCell>
                    <TableCell>{formatDate(item.date)}</TableCell>
                    <TableCell>{item.user}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

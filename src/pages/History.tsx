
import { useEffect, useState, useMemo } from "react";
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
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { addDays, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface HistoryItem {
  id: string;
  productName: string;
  action: "added" | "updated" | "deleted" | "adjusted";
  quantity: number;
  date: string;
  user: string;
}

export default function History() {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -7),
    to: new Date(),
  });
  const { toast } = useToast();

  // Fetch history data
  useEffect(() => {
    const fetchHistoryData = async () => {
      setIsLoading(true);
      try {
        const { data: historyData, error: historyError } = await supabase
          .from('stock_history')
          .select(`
            id, 
            action,
            timestamp,
            item_id,
            stock_items (
              name,
              quantity
            )
          `);

        if (historyError) {
          console.error("Error fetching history:", historyError);
          toast({
            title: "Failed to load history",
            description: historyError.message,
            variant: "destructive",
          });
          return;
        }

        // Transform data to match our interface
        const transformedData: HistoryItem[] = historyData.map(item => ({
          id: item.id,
          productName: item.stock_items?.name || "Unknown Product",
          action: item.action as "added" | "updated" | "deleted" | "adjusted",
          quantity: item.stock_items?.quantity || 0,
          date: item.timestamp || new Date().toISOString(),
          user: "admin@example.com", // In a real app, this would come from auth
        }));

        setHistoryItems(transformedData);
      } catch (error) {
        console.error("Unexpected error:", error);
        toast({
          title: "An unexpected error occurred",
          description: "Could not load history data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoryData();
  }, [toast]);

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

  // Filter items based on selected date range
  const filteredItems = useMemo(() => {
    if (!dateRange || !dateRange.from) {
      return historyItems;
    }

    return historyItems.filter((item) => {
      const itemDate = new Date(item.date);
      
      if (dateRange.from && !dateRange.to) {
        // If only start date is selected
        return itemDate >= startOfDay(dateRange.from);
      } else if (dateRange.from && dateRange.to) {
        // If both start and end dates are selected
        return isWithinInterval(itemDate, {
          start: startOfDay(dateRange.from),
          end: endOfDay(dateRange.to),
        });
      }
      
      return true;
    });
  }, [historyItems, dateRange]);

  // Reset date range to show all records
  const resetDateRange = () => {
    setDateRange(undefined);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">History</h1>
        <p className="text-muted-foreground">Track inventory changes over time.</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
        <div className="w-full sm:w-auto sm:flex-1 md:max-w-md">
          <DateRangePicker 
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </div>
        <Button 
          variant="outline" 
          size="icon"
          onClick={resetDateRange}
          title="Reset date filter"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>
            Inventory History
            {dateRange?.from && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {filteredItems.length} records
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
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
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
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
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        No history items found in the selected date range.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

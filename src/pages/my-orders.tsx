import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  ShoppingCart,
  Calendar,
  Package,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import type { Order } from "@/modules/orders/types";
import { OrdersService } from "@/modules/orders/services";
import { useNavigate } from "react-router-dom";

export default function MyOrders() {
  const router = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await OrdersService.findAll();
      setOrders(response.data.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast("Error", {
        description: "Failed to load orders",
        action: {
          label: "Undo",
          onClick: () => console.log("Undo", error),
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      await fetchOrders();
    };
    loadData();
  }, []);

  // Filter orders based on search
  const filteredOrders = orders.filter(
    (order) =>
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm)
  );

  // Handle change order status
  const handleChangeStatus = async (orderId: number) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const newStatus =
      order.status === "Pending"
        ? "InProgress"
        : order.status === "InProgress"
        ? "Completed"
        : "Pending";

    try {
      await OrdersService.changeStatus(orderId, newStatus);
      await fetchOrders();
      toast("Success", {
        description: `Order status updated to ${newStatus}`,
        action: {
          label: "Undo",
          onClick: () => console.log("Undo"),
        },
      });
    } catch (error) {
      toast("Error", {
        description: "Failed to update order status",
        action: {
          label: "Undo",
          onClick: () => console.log("Undo" + error),
        },
      });
    }
  };

  // Handle delete order
  const handleDeleteOrder = async (orderId: number) => {
    console.log("Eliminando pedido con ID:", orderId);
    try {
      await OrdersService.delete(orderId);
      toast("Success", {
        description: "Order deleted successfully",
        action: {
          label: "Undo",
          onClick: () => console.log("Undo"),
        },
      });
      await fetchOrders();
    } catch (error) {
      toast("Error", {
        description: "Failed to delete order",
        action: {
          label: "Undo",
          onClick: () => console.log("Undo" + error),
        },
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
          <p className="text-muted-foreground">
            Manage your orders and track sales
          </p>
        </div>

        {/* Button to redirect a add products */}
        <Button
          onClick={() => router("/products/")}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          View Products
        </Button>

        {/* Button to redirect a add orders */}
        <Button
          onClick={() => router("/add-orders/")}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Order
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {orders
                .reduce((sum, order) => sum + parseFloat(order.final_price), 0)
                .toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Orders
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter((order) => order.status === "Pending").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Order Value
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {orders.length > 0
                ? (
                    orders.reduce(
                      (sum, order) => sum + parseFloat(order.final_price),
                      0
                    ) / orders.length
                  ).toFixed(2)
                : "0.00"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Orders</CardTitle>
              <CardDescription>
                A list of all your orders with their details
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full sm:w-[300px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Order #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead># Products</TableHead>
                  <TableHead>Final Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Options</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <Package className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No orders found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.order_number}</TableCell>
                      <TableCell>
                        {new Date(order.order_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {order.total_products}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${parseFloat(order.final_price).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          onClick={() => handleChangeStatus(order.id)}
                          className={
                            order.status === "Completed"
                              ? "bg-green-500 text-white"
                              : order.status === "Pending"
                              ? "bg-red-500 text-white"
                              : "bg-yellow-500 text-white"
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router(`/add-orders/${order.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will
                                  permanently delete the order{" "}
                                  <strong>{order.order_number}</strong>.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction asChild>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteOrder(order.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </button>
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Hash,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/modules/products/types";
import type { Order, OrderItem } from "@/modules/orders/types";
import { ProductsService } from "@/modules/products/services";
import { toast } from "sonner";
import { OrdersService } from "@/modules/orders/services";
import { Label } from "@/components/ui/label";

export default function MyOrdersForm() {
  const router = useNavigate();
  const params = useParams();
  const orderId = params.id as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [creatingOrder, setCreatingOrder] = useState<Order | null>(null);

  // Load products and order data
  // Fetch products from API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await ProductsService.findAll();
      setProducts(response.data.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast("Error", {
        description: "Failed to load products",
        action: {
          label: "Undo",
          onClick: () => console.log("Undo", error),
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch products from an order by ID
  const fetchProductsByOrderId = async (order_id: number) => {
    setLoading(true);
    try {
      const response = await ProductsService.findByOrderId(order_id);
      setSelectedItems(response.data.data);
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

  // Fetch orders from API
  const fetchOrderById = async (order_id: number) => {
    setLoading(true);
    try {
      const response = await OrdersService.findById(order_id);
      setEditingOrder(response.data.data);
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

  useEffect(() => {
    const loadData = async () => {
      await fetchProducts();
      await fetchOrderById(Number(orderId));
      await fetchProductsByOrderId(Number(orderId));
    };
    loadData();
  }, [orderId, router]);

  // Filter products for selection
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Handle adding product to order
  const addProductToOrder = (product: Product) => {
    const existingItem = selectedItems.find(
      (item) => item.product_id === product.id
    );

    if (existingItem) {
      setSelectedItems((items) =>
        items.map((item) =>
          item.product_id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      setSelectedItems((items) => [
        ...items,
        {
          order_id: editingOrder?.id ?? 0,
          product_id: product.id,
          product_name: product.name,
          qty: 1,
          unit_price: product.unit_price,
        },
      ]);
    }
  };

  // Handle removing product from order
  const removeProductFromOrder = (productId: number) => {
    setSelectedItems((items) =>
      items.filter((item) => item.product_id !== productId)
    );
  };

  // Handle quantity change
  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeProductFromOrder(productId);
      return;
    }

    setSelectedItems((items) =>
      items.map((item) =>
        item.product_id === productId ? { ...item, qty: quantity } : item
      )
    );
  };

  // Calculate totals
  const calculateTotals = () => {
    const total_products = selectedItems.reduce(
      (sum, item) => sum + item.qty,
      0
    );
    const final_price = selectedItems.reduce(
      (sum, item) => sum + item.unit_price * item.qty,
      0
    );
    return { total_products, final_price };
  };

  // Handle save order
  const handleSaveOrder = async () => {
    if (selectedItems.length === 0) {
      console.error("No items selected");
      return;
    }

    setSaving(true);

    try {
      const { total_products, final_price } = calculateTotals();

      // Update the order
      const updatedOrder: Order = {
        ...editingOrder!,
        total_products,
        final_price: final_price.toString(),
      };

      // Create new order
      const newOrder: Order = {
        id: Date.now(),
        order_number: creatingOrder?.order_number || "",
        order_date: new Date().toISOString().split("T")[0],
        total_products,
        final_price: final_price.toString(),
        status: "Pending",
      };

      if (editingOrder) {
        await OrdersService.update(editingOrder.id, updatedOrder);
        selectedItems.forEach(async (item) => {
        await OrdersService.updateDetails({
          order_id: item.order_id,
          product_id: item.product_id,
          product_name: item.product_name,
          qty: item.qty,
          unit_price: item.unit_price,
        });
      });
      } else {
        const order = await OrdersService.create(newOrder);
        const orderId = order.data.data.id;
        selectedItems.forEach(async (item) => {
        await OrdersService.createDetails({
          order_id: orderId,
          product_id: item.product_id,
          product_name: item.product_name,
          qty: item.qty,
          unit_price: item.unit_price,
        });
      });
      }

      
      router("/my-orders");
    } catch (error) {
      console.error("Error saving order:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router("/my-orders")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {editingOrder ? "Edit Order" : "Add Order"}
          </h1>
          <p className="text-muted-foreground">
            {editingOrder && editingOrder.order_number
              ? `Order #${editingOrder.order_number}`
              : "Create a new order"}
            {editingOrder && (
              <p className="text-muted-foreground">
                Editing order {editingOrder.order_number} -{" "}
                {new Date(editingOrder.order_date).toLocaleDateString()}
              </p>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products Selection */}
        <Card>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="order_number" className="pb-2">
                  Order Number
                </Label>
                <div className="relative">
                  <Hash className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    id="order_number"
                    placeholder="Add order number"
                    defaultValue={editingOrder?.order_number || ""}
                    onChange={(e) =>
                      editingOrder
                        ? setEditingOrder({
                            ...editingOrder,
                            order_number: e.target.value,
                            id: editingOrder.id,
                          })
                        : setCreatingOrder({
                            ...creatingOrder!,
                            order_number: e.target.value,
                          })
                    }
                    className="pl-7"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="order_date" className="pb-2">
                  Order Date
                </Label>
                <Input
                  id="order_date"
                  placeholder="Add order date"
                  defaultValue={editingOrder?.order_date || ""}
                  onChange={(e) =>
                    editingOrder &&
                    setEditingOrder({
                      ...editingOrder,
                      order_date: e.target.value,
                      id: editingOrder.id,
                    })
                  }
                />
              </div>
            </div>

            <div className="relative">
              <Label htmlFor="order_number" className="pb-2">
                Available Products
              </Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="product-search"
                  placeholder="Search products to add..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={
                          product.image_url ||
                          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHICWZcFeQ7UuaU7N30-E4Vt1GaTYIU1DIEA&s"
                        }
                        alt={product.name}
                        className="w-12 h-12 rounded-md object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm font-semibold">
                          ${product.unit_price}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addProductToOrder(product)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Selected Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>
                  Products selected for this order
                </CardDescription>
              </div>
              <Badge variant="secondary">{selectedItems.length} items</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedItems.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">
                  No products selected
                </p>
                <p className="text-sm text-muted-foreground">
                  Add products from the left panel
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedItems.map((item) => (
                    <Card key={item.product_id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-muted-foreground">
                              ${item.unit_price} each
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateQuantity(item.product_id, item.qty - 1)
                              }
                            >
                              -
                            </Button>
                            <span className="w-8 text-center">{item.qty}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateQuantity(item.product_id, item.qty + 1)
                              }
                            >
                              +
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                removeProductFromOrder(item.product_id)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 text-right">
                          <p className="font-semibold">
                            ${(item.unit_price * item.qty).toFixed(2)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Products:</span>
                        <span className="font-semibold">
                          {calculateTotals().total_products}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Final Price:</span>
                        <span>${calculateTotals().final_price.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => router("/my-orders")}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveOrder}
                    disabled={selectedItems.length === 0 || saving}
                    className="flex-1"
                  >
                    {editingOrder
                      ? saving
                        ? "Updating..."
                        : "Update Order"
                      : saving
                      ? "Saving..."
                      : "Save Order"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

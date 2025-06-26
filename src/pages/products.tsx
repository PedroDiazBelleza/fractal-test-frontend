"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Package,
  DollarSign,
  TrendingUp,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product } from "@/modules/products/types";
import { ProductsService } from "@/modules/products/services";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "unit_price">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    unit_price: "",
    image_url: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
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

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      await fetchProducts();
    };
    loadData();
  }, []);

  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = sortBy === "name" ? a.name.toLowerCase() : a.unit_price;
      const bValue = sortBy === "name" ? b.name.toLowerCase() : b.unit_price;

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Calculate statistics
  const stats = {
    totalProducts: products.length,
    averagePrice:
      products.length > 0
        ? products.reduce((sum, p) => sum + Number(p.unit_price), 0) /
          products.length
        : 0,
    highestPrice:
      products.length > 0 ? Math.max(...products.map((p) => p.unit_price)) : 0,
    lowestPrice:
      products.length > 0 ? Math.min(...products.map((p) => p.unit_price)) : 0,
  };

  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Product name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Product name must be at least 2 characters";
    }

    if (!formData.unit_price) {
      errors.unit_price = "Unit price is required";
    } else if (
      isNaN(Number(formData.unit_price)) ||
      Number(formData.unit_price) <= 0
    ) {
      errors.unit_price = "Unit price must be a valid positive number";
    }

    if (!formData.image_url.trim()) {
      errors.image = "Image URL is required";
    } else if (!isValidUrl(formData.image_url)) {
      errors.image = "Please enter a valid URL";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // URL validation helper
  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (e) {
      console.error("Invalid URL:", string, e);
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const productData = {
        name: formData.name.trim(),
        unit_price: Number(formData.unit_price),
        image_url: formData.image_url.trim(),
      };

      if (editingProduct) {
        // Update existing product
        await ProductsService.update(editingProduct.id, productData);
        await fetchProducts();
      } else {
        // Create new product
        await ProductsService.create(productData);
        await fetchProducts();
      }

      // Reset form and close dialog
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setSaving(false);
    }
  };

  // Handle edit product
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      unit_price: product.unit_price.toString(),
      image_url: product.image_url,
    });
    setFormErrors({});
    setIsDialogOpen(true);
  };

  // Handle delete product
  const handleDeleteProduct = async (productId: number) => {
    try {
      await ProductsService.delete(productId);
      await fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      unit_price: "",
      image_url: "",
    });
    setFormErrors({});
    setEditingProduct(null);
  };

  // Handle dialog close
  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
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
          <h1 className="text-3xl font-bold tracking-tight">
            Products Management
          </h1>
          <p className="text-muted-foreground">
            Manage your product catalog and inventory
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Product" : "Create New Product"}
              </DialogTitle>
              <DialogDescription>
                {editingProduct
                  ? "Update the product information below"
                  : "Fill in the product details below"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>

              {/* Unit Price */}
              <div className="space-y-2">
                <Label htmlFor="unit_price">Unit Price ($)</Label>
                <Input
                  id="unit_price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.unit_price}
                  onChange={(e) =>
                    setFormData({ ...formData, unit_price: e.target.value })
                  }
                  className={formErrors.unit_price ? "border-red-500" : ""}
                />
                {formErrors.unit_price && (
                  <p className="text-sm text-red-500">
                    {formErrors.unit_price}
                  </p>
                )}
              </div>

              {/* Image URL */}
              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  className={formErrors.image_url ? "border-red-500" : ""}
                />
                {formErrors.image_url && (
                  <p className="text-sm text-red-500">{formErrors.image_url}</p>
                )}

                {/* Image Preview */}
                {formData.image_url && isValidUrl(formData.image_url) && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground mb-2">
                      Preview:
                    </p>
                    <img
                      src={
                        formData.image_url ||
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHICWZcFeQ7UuaU7N30-E4Vt1GaTYIU1DIEA&s"
                      }
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-md border"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={saving}>
                {saving
                  ? editingProduct
                    ? "Updating..."
                    : "Creating..."
                  : editingProduct
                  ? "Update Product"
                  : "Create Product"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.averagePrice.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Price</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.highestPrice.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lowest Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.lowestPrice.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Products</CardTitle>
              <CardDescription>Manage your product catalog</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full sm:w-[250px]"
                />
              </div>

              {/* Sort */}
              <div className="flex gap-2">
                <Select
                  value={sortBy}
                  onValueChange={(value: "name" | "unit_price") =>
                    setSortBy(value)
                  }
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="unit_price">Price</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={sortOrder}
                  onValueChange={(value: "asc" | "desc") => setSortOrder(value)}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">A-Z</SelectItem>
                    <SelectItem value="desc">Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <Package className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchTerm
                            ? "No products found matching your search"
                            : "No products found"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-muted/50">
                      <TableCell>
                        <img
                          src={
                            product.image_url ||
                            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHICWZcFeQ7UuaU7N30-E4Vt1GaTYIU1DIEA&s"
                          }
                          alt={product.name}
                          className="w-12 h-12 rounded-md object-cover border"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHICWZcFeQ7UuaU7N30-E4Vt1GaTYIU1DIEA&s";
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-semibold">
                          ${Number(product.unit_price).toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditProduct(product)}
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
                                  permanently delete the product{" "}
                                  <strong>"{product.name}"</strong>.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteProduct(product.id)
                                  }
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
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

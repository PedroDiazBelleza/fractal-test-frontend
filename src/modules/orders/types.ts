export type OrderItem = {
  order_id: number;
  product_id: number;
  product_name: string;
  qty: number;
  unit_price: number;
}

export type Order = {
  id: number;
  order_number: string;
  order_date: string;
  total_products: number;
  final_price: string;
  status: "Pending" | "Completed" | "InProgress";
}
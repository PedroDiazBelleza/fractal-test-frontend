import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MyOrders from "./pages/my-orders";
import MyOrdersForm from "./pages/my-orders-form";
import ProductsPage from "./pages/products";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/add-orders/:id?" element={<MyOrdersForm />} />
        <Route path="/products" element={<ProductsPage />} />
      </Routes>
    </Router>
  );
}

export default App;

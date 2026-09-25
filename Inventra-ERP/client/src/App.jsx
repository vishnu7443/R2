import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import Customers from "./pages/Customers";
import AddCustomer from "./pages/AddCustomer";
import EditCustomer from "./pages/EditCustomer";

import Products from "./pages/Products";

import Supplier from "./pages/Supplier";
import AddSupplier from "./pages/AddSupplier";
import EditSupplier from "./pages/EditSupplier";

import Purchase from "./pages/Purchase";
import AddPurchase from "./pages/AddPurchase";
import EditPurchase from "./pages/EditPurchase";

import Sale from "./pages/sale";
import AddSale from "./pages/AddSale";
import Reports from "./pages/Reports";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import OutageCrashOverlay from "./components/OutageCrashOverlay";
import PredictivePreventionBanner from "./components/PredictivePreventionBanner";

function App() {
  return (
    <>
      <PredictivePreventionBanner />
      <OutageCrashOverlay />
      <Routes>

      <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/add" element={<AddCustomer />} />
        <Route path="/customers/edit/:id" element={<EditCustomer />} />

        <Route path="/products" element={<Products />} />

        <Route path="/suppliers" element={<Supplier />} />
        <Route path="/suppliers/add" element={<AddSupplier />} />
        <Route path="/suppliers/edit/:id" element={<EditSupplier />} />

        <Route path="/purchases" element={<Purchase />} />
        <Route path="/purchases/add" element={<AddPurchase />} />
        <Route path="/purchases/edit/:id" element={<EditPurchase />} />

        <Route path="/sales" element={<Sale />} />
        <Route path="/sales/add" element={<AddSale />} />

        <Route path="/reports" element={<Reports />} />

      </Route>

      <Route path="*" element={<h1>404 - Page Not Found</h1>} />

    </Routes>
    </>
  );
}

export default App;
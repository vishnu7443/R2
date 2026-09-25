import { useEffect, useState } from "react";

import ProductTable from "../components/products/ProductTable";
import ProductModal from "../components/products/ProductModal";
import ProductForm from "../components/products/ProductForm";

import {
  getProducts,
  deleteProduct,
} from "../api/productApi";

import API from "../api/axios";

const Products = () => {
  const role = localStorage.getItem("role") || "EMPLOYEE";
  const isAdmin = role === "ADMIN" || role === "MANAGER";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [search, setSearch] = useState("");

  // ==========================
  // LOAD PRODUCTS
  // ==========================
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await getProducts();

      console.log("PRODUCT RESPONSE:", response);

      setProducts(response.data || []);
    } catch (error) {
      console.log(error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // LOAD CATEGORIES
  // ==========================
  const fetchCategories = async () => {
    try {
      const response = await API.get("/categories");

      console.log("CATEGORY RESPONSE:", response.data);

      setCategories(response.data.data || []);
    } catch (error) {
      console.log(error);
      setCategories([]);
    }
  };

  // ==========================
  // LOAD SUPPLIERS
  // ==========================
  const fetchSuppliers = async () => {
    try {
      const response = await API.get("/suppliers");

      console.log("SUPPLIER RESPONSE:", response.data);

      setSuppliers(response.data.data || []);
    } catch (error) {
      console.log(error);
      setSuppliers([]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSuppliers();
  }, []);

  // ==========================
  // ADD
  // ==========================
  const handleAdd = () => {
    setSelectedProduct(null);
    setShowModal(true);
  };

  // ==========================
  // EDIT
  // ==========================
  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  // ==========================
  // DELETE
  // ==========================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete Product?")) return;

    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (error) {
      console.log(error);
    }
  };

  // ==========================
  // SEARCH
  // ==========================
  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Product Management
        </h1>

        {isAdmin && (
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg"
          >
            + Add Product
          </button>
        )}
      </div>

      <input
        type="text"
        placeholder="Search Product..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-lg p-3 mb-5"
      />

      {loading ? (
        <p>Loading Products...</p>
      ) : (
        <ProductTable
          products={filteredProducts}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isAdmin={isAdmin}
        />
      )}

      <ProductModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={
          selectedProduct
            ? "Edit Product"
            : "Add Product"
        }
      >
        <ProductForm
          product={selectedProduct}
          categories={categories}
          suppliers={suppliers}
          onSuccess={fetchProducts}
          onClose={() => setShowModal(false)}
        />
      </ProductModal>
    </div>
  );
};

export default Products;
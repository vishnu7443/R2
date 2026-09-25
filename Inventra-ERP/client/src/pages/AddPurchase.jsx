import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";

import { createPurchase } from "../api/purchaseApi";
import { getSuppliers } from "../api/supplierApi";
import { getProducts } from "../api/productApi";

function AddPurchase() {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [notes, setNotes] = useState("");

  const [items, setItems] = useState([
    { productId: "", quantity: 1, price: 0 },
  ]);

  // ==============================
  // LOAD DROPDOWNS
  // ==============================
  useEffect(() => {
    const loadData = async () => {
      try {
        const [supplierRes, productRes] = await Promise.all([
          getSuppliers(),
          getProducts(),
        ]);
        setSuppliers(supplierRes.data || []);
        setProducts(productRes.data || []);
      } catch (error) {
        console.error("Load error:", error);
      }
    };
    loadData();
  }, []);

  // ==============================
  // ITEMS MANAGEMENT
  // ==============================
  const addItem = () => {
    setItems([...items, { productId: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    // Auto-fill price when product is selected
    if (field === "productId") {
      const product = products.find((p) => p.id === Number(value));
      if (product) {
        updated[index].price = product.price;
      }
    }

    setItems(updated);
  };

  // ==============================
  // COMPUTED TOTAL
  // ==============================
  const total = items.reduce(
    (sum, item) => sum + Number(item.quantity) * Number(item.price),
    0
  );

  // ==============================
  // SUBMIT
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!invoiceNumber.trim()) {
      alert("Enter an invoice number");
      return;
    }
    if (!supplierId) {
      alert("Select a supplier");
      return;
    }
    for (const item of items) {
      if (!item.productId) {
        alert("Select a product for every item");
        return;
      }
      if (Number(item.quantity) < 1) {
        alert("Quantity must be at least 1");
        return;
      }
      if (Number(item.price) <= 0) {
        alert("Price must be greater than 0");
        return;
      }
    }

    const purchaseData = {
      invoiceNumber: invoiceNumber.trim(),
      supplierId: Number(supplierId),
      purchaseDate: purchaseDate || null,
      notes,
      items: items.map((item) => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity),
        price: Number(item.price),
      })),
    };

    try {
      setSubmitting(true);
      await createPurchase(purchaseData);
      alert("Purchase created successfully!");
      navigate("/purchases");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Purchase creation failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ==============================
  // RENDER
  // ==============================
  return (
    <div className="p-6 max-w-4xl mx-auto">

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">New Purchase</h1>
        <button
          type="button"
          onClick={() => navigate("/purchases")}
          className="text-gray-500 hover:text-gray-800 text-sm underline"
        >
          ← Back to Purchases
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Header fields */}
        <div className="bg-white rounded-xl shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Invoice Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. PO-2024-001"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Supplier <span className="text-red-500">*</span>
            </label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
              required
            >
              <option value="">— Select Supplier —</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.companyName ? `(${s.companyName})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Purchase Date
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Notes
            </label>
            <input
              type="text"
              placeholder="Optional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

        </div>

        {/* Items */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-gray-700">Purchase Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm transition"
            >
              <Plus size={15} />
              Add Item
            </button>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-12 gap-2 mb-2 px-1">
            <div className="col-span-5 text-xs font-semibold text-gray-500 uppercase">Product</div>
            <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase">Current Stock</div>
            <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase">Qty</div>
            <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase">Unit Price (₹)</div>
            <div className="col-span-1"></div>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => {
              const selectedProduct = products.find(
                (p) => p.id === Number(item.productId)
              );

              return (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">

                  {/* Product select */}
                  <div className="col-span-5">
                    <select
                      value={item.productId}
                      onChange={(e) => updateItem(index, "productId", e.target.value)}
                      className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      <option value="">— Select Product —</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (SKU: {p.sku})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Stock badge */}
                  <div className="col-span-2 text-center">
                    {selectedProduct ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        selectedProduct.stock === 0
                          ? "bg-red-100 text-red-600"
                          : selectedProduct.stock <= 10
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {selectedProduct.stock} in stock
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", e.target.value)}
                      className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>

                  {/* Price */}
                  <div className="col-span-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updateItem(index, "price", e.target.value)}
                      className="w-full border rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>

                  {/* Remove */}
                  <div className="col-span-1 flex justify-center">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-400 hover:text-red-600 transition"
                      >
                        <Trash2 size={17} />
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

          {/* Line subtotals */}
          {items.some((i) => i.productId) && (
            <div className="mt-4 border-t pt-4 space-y-1">
              {items.map((item, index) => {
                const product = products.find((p) => p.id === Number(item.productId));
                if (!product) return null;
                const subtotal = Number(item.quantity) * Number(item.price);
                return (
                  <div key={index} className="flex justify-between text-sm text-gray-600">
                    <span>{product.name} × {item.quantity}</span>
                    <span>₹ {subtotal.toLocaleString("en-IN")}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Total + Submit */}
        <div className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-sm text-gray-500">Grand Total</p>
            <p className="text-3xl font-bold text-orange-600">
              ₹ {total.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/purchases")}
              className="px-6 py-2.5 border rounded-lg text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save Purchase"}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}

export default AddPurchase;
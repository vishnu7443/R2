// In-Memory Enterprise Fallback Store
// Ensures the ERP works seamlessly with full live CRUD when PostgreSQL is offline or unseeded

const categories = [
  { id: 1, name: "Enterprise Laptops & PCs" },
  { id: 2, name: "Server & Cloud Infrastructure" },
  { id: 3, name: "Network & Security Hardware" },
  { id: 4, name: "Monitors & Visual Displays" },
  { id: 5, name: "Accessories & Ergonomics" },
];

const suppliers = [
  {
    id: 1,
    name: "Apex Tech Distributors",
    email: "contact@apextech.com",
    phone: "+1-800-555-0199",
    address: "1000 Silicon Way, Austin, TX",
    companyName: "Apex Tech Holdings",
  },
  {
    id: 2,
    name: "Nova Global Logistics",
    email: "supply@novaglobal.io",
    phone: "+1-888-444-2200",
    address: "450 Innovation Blvd, San Jose, CA",
    companyName: "Nova Supply Chain Inc",
  },
  {
    id: 3,
    name: "Quantum Component Works",
    email: "sales@quantumworks.com",
    phone: "+1-877-333-8811",
    address: "780 Tech Ridge, Seattle, WA",
    companyName: "Quantum Micro Corp",
  },
  {
    id: 4,
    name: "CyberPeak Solutions",
    email: "orders@cyberpeak.net",
    phone: "+1-866-999-3344",
    address: "220 Harbor Plaza, Boston, MA",
    companyName: "CyberPeak Hardware Ltd",
  },
];

const customers = [
  {
    id: 1,
    name: "Nexus Innovations Inc.",
    email: "billing@nexusinnovations.com",
    phone: "+1-555-014-9922",
    address: "100 Innovation Way, Suite 400, New York, NY",
    createdAt: new Date("2026-01-15T09:30:00Z"),
  },
  {
    id: 2,
    name: "Vanguard Financial Systems",
    email: "accounts@vanguardfs.com",
    phone: "+1-555-018-8833",
    address: "45 Wall Street, Floor 28, New York, NY",
    createdAt: new Date("2026-02-01T11:15:00Z"),
  },
  {
    id: 3,
    name: "Aura Biotech Labs",
    email: "procurement@aurabiotech.org",
    phone: "+1-555-012-7711",
    address: "750 Cambridge Pkwy, Cambridge, MA",
    createdAt: new Date("2026-02-10T14:20:00Z"),
  },
  {
    id: 4,
    name: "Starlight Media & Gaming",
    email: "ops@starlightmedia.co",
    phone: "+1-555-019-3355",
    address: "1200 Sunset Blvd, Los Angeles, CA",
    createdAt: new Date("2026-02-18T16:45:00Z"),
  },
  {
    id: 5,
    name: "Horizon Logistics Corp",
    email: "admin@horizonlogistics.com",
    phone: "+1-555-016-5544",
    address: "300 Harbor Dr, Chicago, IL",
    createdAt: new Date("2026-03-02T10:00:00Z"),
  },
  {
    id: 6,
    name: "Sriram Sundararajan (Key Enterprise Account)",
    email: "sriram@example.com",
    phone: "+91-98765-43210",
    address: "Tidel Park Tech Zone, Chennai, India",
    createdAt: new Date("2026-03-10T12:00:00Z"),
  },
];

const products = [
  {
    id: 1,
    name: 'Dell Precision 7780 Workstation (i9 / 64GB / RTX 4000)',
    sku: 'PROD-DL-7780',
    price: 249999,
    stock: 14,
    categoryId: 1,
    supplierId: 1,
  },
  {
    id: 2,
    name: 'Apple MacBook Pro M3 Max 16" (36GB / 1TB SSD)',
    sku: 'PROD-AP-M3MX',
    price: 319900,
    stock: 8,
    categoryId: 1,
    supplierId: 2,
  },
  {
    id: 3,
    name: 'Dell PowerEdge R760 Dual Xeon 2U Rack Server',
    sku: 'PROD-PE-R760',
    price: 485000,
    stock: 5,
    categoryId: 2,
    supplierId: 1,
  },
  {
    id: 4,
    name: 'Cisco Catalyst 9300 48-Port PoE+ Managed Switch',
    sku: 'PROD-CS-9300',
    price: 185000,
    stock: 12,
    categoryId: 3,
    supplierId: 3,
  },
  {
    id: 5,
    name: 'Fortinet FortiGate 100F Enterprise Firewall Gateway',
    sku: 'PROD-FG-100F',
    price: 145000,
    stock: 7,
    categoryId: 3,
    supplierId: 3,
  },
  {
    id: 6,
    name: 'LG UltraFine 32" 4K OLED Pro Display (Thunderbolt 4)',
    sku: 'PROD-LG-32OLED',
    price: 74999,
    stock: 22,
    categoryId: 4,
    supplierId: 4,
  },
  {
    id: 7,
    name: 'Logitech MX Master 3S + Mechanical Wireless Suite',
    sku: 'PROD-MX-BNDL',
    price: 18499,
    stock: 45,
    categoryId: 5,
    supplierId: 4,
  },
  {
    id: 8,
    name: 'Ubiquiti UniFi Pro 7 Tri-Band WiFi Access Point',
    sku: 'PROD-UB-U7PRO',
    price: 22999,
    stock: 3,
    categoryId: 3,
    supplierId: 3,
  },
];

const sales = [
  {
    id: 1,
    invoiceNumber: "INV-2026-0081",
    customerId: 1,
    totalAmount: 499998,
    status: "COMPLETED",
    createdAt: new Date("2026-03-01T14:30:00Z"),
    items: [
      { id: 1, productId: 1, quantity: 2, unitPrice: 249999, totalPrice: 499998 }
    ]
  },
  {
    id: 2,
    invoiceNumber: "INV-2026-0082",
    customerId: 2,
    totalAmount: 639800,
    status: "COMPLETED",
    createdAt: new Date("2026-03-05T10:15:00Z"),
    items: [
      { id: 2, productId: 2, quantity: 2, unitPrice: 319900, totalPrice: 639800 }
    ]
  },
  {
    id: 3,
    invoiceNumber: "INV-2026-0083",
    customerId: 3,
    totalAmount: 185000,
    status: "COMPLETED",
    createdAt: new Date("2026-03-12T16:00:00Z"),
    items: [
      { id: 3, productId: 4, quantity: 1, unitPrice: 185000, totalPrice: 185000 }
    ]
  },
  {
    id: 4,
    invoiceNumber: "INV-2026-0084",
    customerId: 6,
    totalAmount: 394898,
    status: "COMPLETED",
    createdAt: new Date("2026-03-15T11:45:00Z"),
    items: [
      { id: 4, productId: 2, quantity: 1, unitPrice: 319900, totalPrice: 319900 },
      { id: 5, productId: 6, quantity: 1, unitPrice: 74999, totalPrice: 74999 }
    ]
  }
];

const purchases = [
  {
    id: 1,
    invoiceNumber: "PO-2026-041",
    supplierId: 1,
    totalAmount: 970000,
    notes: "Q1 Server Refresh Batch",
    purchaseDate: new Date("2026-01-20T08:00:00Z"),
    createdAt: new Date("2026-01-20T08:00:00Z"),
    items: [
      { id: 1, productId: 3, quantity: 2, price: 485000, subtotal: 970000 }
    ]
  },
  {
    id: 2,
    invoiceNumber: "PO-2026-042",
    supplierId: 3,
    totalAmount: 555000,
    notes: "Network Infrastructure Expansion",
    purchaseDate: new Date("2026-02-12T09:30:00Z"),
    createdAt: new Date("2026-02-12T09:30:00Z"),
    items: [
      { id: 2, productId: 4, quantity: 3, price: 185000, subtotal: 555000 }
    ]
  }
];

const demoStore = {
  // Categories
  getCategories: () => [...categories],
  getCategoryById: (id) => categories.find((c) => c.id === Number(id)),

  // Suppliers
  getSuppliers: () => [...suppliers],
  getSupplierById: (id) => suppliers.find((s) => s.id === Number(id)),
  createSupplier: (data) => {
    const newSupplier = {
      id: suppliers.length > 0 ? Math.max(...suppliers.map((s) => s.id)) + 1 : 1,
      ...data,
    };
    suppliers.unshift(newSupplier);
    return newSupplier;
  },

  // Customers
  getCustomers: () => [...customers],
  getCustomerById: (id) => customers.find((c) => c.id === Number(id)),
  createCustomer: (data) => {
    const newCustomer = {
      id: customers.length > 0 ? Math.max(...customers.map((c) => c.id)) + 1 : 1,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || null,
      createdAt: new Date(),
    };
    customers.unshift(newCustomer);
    return newCustomer;
  },
  updateCustomer: (id, data) => {
    const index = customers.findIndex((c) => c.id === Number(id));
    if (index === -1) return null;
    customers[index] = { ...customers[index], ...data };
    return customers[index];
  },
  deleteCustomer: (id) => {
    const index = customers.findIndex((c) => c.id === Number(id));
    if (index === -1) return false;
    customers.splice(index, 1);
    return true;
  },

  // Products
  getProducts: () => {
    return products.map((p) => ({
      ...p,
      category: categories.find((c) => c.id === p.categoryId) || null,
      supplier: suppliers.find((s) => s.id === p.supplierId) || null,
    }));
  },
  getProductById: (id) => {
    const p = products.find((prod) => prod.id === Number(id));
    if (!p) return null;
    return {
      ...p,
      category: categories.find((c) => c.id === p.categoryId) || null,
      supplier: suppliers.find((s) => s.id === p.supplierId) || null,
    };
  },
  createProduct: (data) => {
    const newProduct = {
      id: products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1,
      name: data.name,
      sku: data.sku || `SKU-${Date.now().toString().slice(-5)}`,
      price: Number(data.price) || 0,
      stock: Number(data.stock) || 0,
      categoryId: Number(data.categoryId) || 1,
      supplierId: Number(data.supplierId) || 1,
    };
    products.unshift(newProduct);
    return {
      ...newProduct,
      category: categories.find((c) => c.id === newProduct.categoryId),
      supplier: suppliers.find((s) => s.id === newProduct.supplierId),
    };
  },
  updateProduct: (id, data) => {
    const index = products.findIndex((p) => p.id === Number(id));
    if (index === -1) return null;
    products[index] = {
      ...products[index],
      ...data,
      price: data.price !== undefined ? Number(data.price) : products[index].price,
      stock: data.stock !== undefined ? Number(data.stock) : products[index].stock,
      categoryId: data.categoryId !== undefined ? Number(data.categoryId) : products[index].categoryId,
      supplierId: data.supplierId !== undefined ? Number(data.supplierId) : products[index].supplierId,
    };
    return {
      ...products[index],
      category: categories.find((c) => c.id === products[index].categoryId),
      supplier: suppliers.find((s) => s.id === products[index].supplierId),
    };
  },
  deleteProduct: (id) => {
    const index = products.findIndex((p) => p.id === Number(id));
    if (index === -1) return false;
    products.splice(index, 1);
    return true;
  },

  // Sales
  getSales: () => {
    return sales.map((s) => ({
      ...s,
      customer: customers.find((c) => c.id === s.customerId) || { name: "Direct Client" },
    }));
  },
  createSale: (data) => {
    const newSale = {
      id: sales.length > 0 ? Math.max(...sales.map((s) => s.id)) + 1 : 1,
      invoiceNumber: data.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
      customerId: Number(data.customerId) || 1,
      totalAmount: Number(data.totalAmount) || 0,
      status: "COMPLETED",
      createdAt: new Date(),
      items: data.items || [],
    };
    sales.unshift(newSale);
    return {
      ...newSale,
      customer: customers.find((c) => c.id === newSale.customerId) || { name: "Direct Client" },
    };
  },

  // Purchases
  getPurchases: () => {
    return purchases.map((p) => ({
      ...p,
      supplier: suppliers.find((s) => s.id === p.supplierId) || { name: "Global Vendor" },
    }));
  },

  // Dashboard Stats
  getDashboardSummary: () => {
    const totalSalesAmount = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const totalPurchasesAmount = purchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    const profit = Math.max(totalSalesAmount - totalPurchasesAmount, 0);

    return {
      totalProducts: products.length,
      totalCustomers: customers.length,
      totalSuppliers: suppliers.length,
      totalSales: totalSalesAmount,
      totalPurchases: totalPurchasesAmount,
      profit,
    };
  },

  getLowStock: (threshold = 10) => {
    return products
      .filter((p) => p.stock <= threshold)
      .map((p) => ({
        id: p.id,
        name: p.name,
        stock: p.stock,
        category: categories.find((c) => c.id === p.categoryId)?.name || "General",
      }));
  },

  getSalesChart: () => {
    return [
      { month: "Jan", sales: 420000 },
      { month: "Feb", sales: 680000 },
      { month: "Mar", sales: 1719696 },
      { month: "Apr", sales: 950000 },
      { month: "May", sales: 1250000 },
      { month: "Jun", sales: 1480000 },
    ];
  },

  getRecentSales: (limit = 5) => {
    return sales.slice(0, limit).map((s) => ({
      ...s,
      customer: customers.find((c) => c.id === s.customerId) || { name: "Client" },
    }));
  },
};

module.exports = demoStore;

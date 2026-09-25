require("dotenv/config");
const prisma = require("../config/prisma");
const bcrypt = require("bcrypt");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log("🌱 Starting sequential seeding on Render PostgreSQL...");

  const passwordHash = await bcrypt.hash("password123", 10);

  // 1. Users
  console.log("Creating users...");
  const user1 = await prisma.user.upsert({
    where: { email: "sriram@example.com" },
    update: { password: passwordHash },
    create: {
      name: "SRIRAM S (Admin)",
      email: "sriram@example.com",
      password: passwordHash,
      role: "ADMIN",
    },
  });
  await sleep(200);

  const user2 = await prisma.user.upsert({
    where: { email: "admin@inventra.erp" },
    update: { password: passwordHash },
    create: {
      name: "Enterprise Administrator",
      email: "admin@inventra.erp",
      password: passwordHash,
      role: "ADMIN",
    },
  });
  await sleep(200);

  const user3 = await prisma.user.upsert({
    where: { email: "staff@inventra.erp" },
    update: { password: passwordHash },
    create: {
      name: "Operations Specialist",
      email: "staff@inventra.erp",
      password: passwordHash,
      role: "STAFF",
    },
  });
  console.log("✅ Users created / upserted successfully");
  await sleep(300);

  // 2. Categories
  console.log("Creating categories...");
  const catNames = [
    "Enterprise Laptops & PCs",
    "Server & Cloud Infrastructure",
    "Network & Security Hardware",
    "Monitors & Visual Displays",
    "Accessories & Ergonomics",
  ];
  const categories = [];
  for (const name of catNames) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categories.push(cat);
    await sleep(150);
  }
  console.log(`✅ ${categories.length} Categories ready`);

  // 3. Suppliers
  console.log("Creating suppliers...");
  const supplierData = [
    {
      name: "Apex Tech Distributors",
      companyName: "Apex Tech Holdings",
      email: "contact@apextech.com",
      phone: "+1-800-555-0199",
      address: "1000 Silicon Way, Austin, TX",
    },
    {
      name: "Nova Global Logistics",
      companyName: "Nova Supply Chain Inc",
      email: "supply@novaglobal.io",
      phone: "+1-888-444-2200",
      address: "450 Innovation Blvd, San Jose, CA",
    },
    {
      name: "Quantum Component Works",
      companyName: "Quantum Micro Corp",
      email: "sales@quantumworks.com",
      phone: "+1-877-333-8811",
      address: "780 Tech Ridge, Seattle, WA",
    },
    {
      name: "CyberPeak Solutions",
      companyName: "CyberPeak Hardware Ltd",
      email: "orders@cyberpeak.net",
      phone: "+1-866-999-3344",
      address: "220 Harbor Plaza, Boston, MA",
    },
  ];
  const suppliers = [];
  for (const sup of supplierData) {
    let s = await prisma.supplier.findFirst({ where: { name: sup.name } });
    if (!s) {
      s = await prisma.supplier.create({ data: sup });
    }
    suppliers.push(s);
    await sleep(150);
  }
  console.log(`✅ ${suppliers.length} Suppliers ready`);

  // 4. Customers
  console.log("Creating customers...");
  const customerData = [
    {
      name: "Nexus Innovations Inc.",
      email: "billing@nexusinnovations.com",
      phone: "+1-555-014-9922",
      address: "100 Innovation Way, Suite 400, New York, NY",
    },
    {
      name: "Vanguard Financial Systems",
      email: "accounts@vanguardfs.com",
      phone: "+1-555-018-8833",
      address: "45 Wall Street, Floor 28, New York, NY",
    },
    {
      name: "Aura Biotech Labs",
      email: "procurement@aurabiotech.org",
      phone: "+1-555-012-7711",
      address: "750 Cambridge Pkwy, Cambridge, MA",
    },
    {
      name: "Starlight Media & Gaming",
      email: "ops@starlightmedia.co",
      phone: "+1-555-019-3355",
      address: "1200 Sunset Blvd, Los Angeles, CA",
    },
    {
      name: "Horizon Logistics Corp",
      email: "admin@horizonlogistics.com",
      phone: "+1-555-016-5544",
      address: "300 Harbor Dr, Chicago, IL",
    },
    {
      name: "Sriram Sundararajan (Key Enterprise Account)",
      email: "sriram@example.com",
      phone: "+91-98765-43210",
      address: "Tidel Park Tech Zone, Chennai, India",
    },
  ];
  const customers = [];
  for (const c of customerData) {
    let cust = await prisma.customer.findFirst({ where: { name: c.name } });
    if (!cust) {
      cust = await prisma.customer.create({ data: c });
    }
    customers.push(cust);
    await sleep(150);
  }
  console.log(`✅ ${customers.length} Customers ready`);

  // 5. Products
  console.log("Creating products...");
  const productData = [
    {
      name: "Dell Precision 7780 Workstation (i9 / 64GB / RTX 4000)",
      sku: "PROD-DL-7780",
      price: 249999,
      stock: 14,
      categoryId: categories[0].id,
      supplierId: suppliers[0].id,
    },
    {
      name: 'Apple MacBook Pro M3 Max 16" (36GB / 1TB SSD)',
      sku: "PROD-AP-M3MX",
      price: 319900,
      stock: 8,
      categoryId: categories[0].id,
      supplierId: suppliers[1].id,
    },
    {
      name: "Dell PowerEdge R760 Dual Xeon 2U Rack Server",
      sku: "PROD-PE-R760",
      price: 485000,
      stock: 5,
      categoryId: categories[1].id,
      supplierId: suppliers[0].id,
    },
    {
      name: "Cisco Catalyst 9300 48-Port PoE+ Managed Switch",
      sku: "PROD-CS-9300",
      price: 185000,
      stock: 12,
      categoryId: categories[2].id,
      supplierId: suppliers[2].id,
    },
    {
      name: "Fortinet FortiGate 100F Enterprise Firewall Gateway",
      sku: "PROD-FG-100F",
      price: 145000,
      stock: 7,
      categoryId: categories[2].id,
      supplierId: suppliers[2].id,
    },
    {
      name: 'LG UltraFine 32" 4K OLED Pro Display (Thunderbolt 4)',
      sku: "PROD-LG-32OLED",
      price: 74999,
      stock: 22,
      categoryId: categories[3].id,
      supplierId: suppliers[3].id,
    },
    {
      name: "Logitech MX Master 3S + Mechanical Wireless Suite",
      sku: "PROD-MX-BNDL",
      price: 18499,
      stock: 45,
      categoryId: categories[4].id,
      supplierId: suppliers[3].id,
    },
    {
      name: "Ubiquiti UniFi Pro 7 Tri-Band WiFi Access Point",
      sku: "PROD-UB-U7PRO",
      price: 22999,
      stock: 3,
      categoryId: categories[2].id,
      supplierId: suppliers[2].id,
    },
  ];
  const products = [];
  for (const p of productData) {
    const prod = await prisma.product.upsert({
      where: { sku: p.sku },
      update: { price: p.price, stock: p.stock },
      create: p,
    });
    products.push(prod);
    await sleep(150);
  }
  console.log(`✅ ${products.length} Products ready`);

  // 6. Purchases
  console.log("Creating purchases...");
  const purchase1 = await prisma.purchase.upsert({
    where: { invoiceNumber: "PO-2026-001" },
    update: {},
    create: {
      invoiceNumber: "PO-2026-001",
      supplierId: suppliers[0].id,
      totalAmount: 970000,
      notes: "Initial server infrastructure procurement",
      items: {
        create: [
          { productId: products[2].id, quantity: 2, price: 485000, subtotal: 970000 },
        ],
      },
    },
  });
  await sleep(200);

  const purchase2 = await prisma.purchase.upsert({
    where: { invoiceNumber: "PO-2026-002" },
    update: {},
    create: {
      invoiceNumber: "PO-2026-002",
      supplierId: suppliers[2].id,
      totalAmount: 555000,
      notes: "Network switches batch",
      items: {
        create: [
          { productId: products[3].id, quantity: 3, price: 185000, subtotal: 555000 },
        ],
      },
    },
  });
  console.log("✅ Purchases ready");
  await sleep(200);

  // 7. Sales
  console.log("Creating sales...");
  const sale1 = await prisma.sale.upsert({
    where: { invoiceNumber: "INV-2026-0081" },
    update: {},
    create: {
      invoiceNumber: "INV-2026-0081",
      customerId: customers[0].id,
      totalAmount: 499998,
      status: "COMPLETED",
      items: {
        create: [
          { productId: products[0].id, quantity: 2, unitPrice: 249999, totalPrice: 499998 },
        ],
      },
    },
  });
  await sleep(200);

  const sale2 = await prisma.sale.upsert({
    where: { invoiceNumber: "INV-2026-0082" },
    update: {},
    create: {
      invoiceNumber: "INV-2026-0082",
      customerId: customers[1].id,
      totalAmount: 639800,
      status: "COMPLETED",
      items: {
        create: [
          { productId: products[1].id, quantity: 2, unitPrice: 319900, totalPrice: 639800 },
        ],
      },
    },
  });
  await sleep(200);

  const sale3 = await prisma.sale.upsert({
    where: { invoiceNumber: "INV-2026-0083" },
    update: {},
    create: {
      invoiceNumber: "INV-2026-0083",
      customerId: customers[5].id,
      totalAmount: 394899,
      status: "COMPLETED",
      items: {
        create: [
          { productId: products[1].id, quantity: 1, unitPrice: 319900, totalPrice: 319900 },
          { productId: products[5].id, quantity: 1, unitPrice: 74999, totalPrice: 74999 },
        ],
      },
    },
  });
  console.log("✅ Sales ready");

  console.log("\n🎉 ALL USERS, PRODUCTS, CUSTOMERS, SUPPLIERS, PURCHASES & SALES HAVE BEEN CREATED IN POSTGRESQL!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

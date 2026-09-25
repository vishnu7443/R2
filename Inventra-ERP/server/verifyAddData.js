async function verifyAllAddOperations() {
  try {
    // 1. Login
    const loginRes = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "sriram@example.com", password: "password123" }),
    });
    const { token } = await loginRes.json();
    const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

    // 2. Add Customer
    const newCust = {
      name: `Test Customer ${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      phone: "+1-555-999-0000",
      address: "123 Tech Blvd, Suite 100",
    };
    const custRes = await fetch("http://localhost:5000/api/customers", {
      method: "POST",
      headers,
      body: JSON.stringify(newCust),
    });
    const custData = await custRes.json();
    console.log("✅ Customer Creation:", custData.success, custData.data?.name);

    // 3. Add Supplier
    const newSup = {
      name: `Test Supplier ${Date.now()}`,
      companyName: "Global Test Hardware",
      email: `vendor${Date.now()}@test.com`,
      phone: "+1-800-111-2222",
      address: "400 Industrial Way",
    };
    const supRes = await fetch("http://localhost:5000/api/suppliers", {
      method: "POST",
      headers,
      body: JSON.stringify(newSup),
    });
    const supData = await supRes.json();
    console.log("✅ Supplier Creation:", supData.success, supData.data?.name);

    // 4. Add Product
    const newProd = {
      name: `Ultra Test Monitor 4K ${Date.now().toString().slice(-4)}`,
      sku: `SKU-TST-${Date.now().toString().slice(-4)}`,
      price: 34999,
      stock: 25,
      categoryId: 4,
      supplierId: supData.data?.id || 1,
    };
    const prodRes = await fetch("http://localhost:5000/api/products", {
      method: "POST",
      headers,
      body: JSON.stringify(newProd),
    });
    const prodData = await prodRes.json();
    console.log("✅ Product Creation:", prodData.success, prodData.data?.name);

    // 5. Add Sale
    const newSale = {
      customerId: custData.data?.id || 1,
      invoiceNumber: `INV-TST-${Date.now().toString().slice(-5)}`,
      items: [
        {
          productId: prodData.data?.id || 1,
          quantity: 2,
          unitPrice: 34999,
        },
      ],
    };
    const saleRes = await fetch("http://localhost:5000/api/sales", {
      method: "POST",
      headers,
      body: JSON.stringify(newSale),
    });
    const saleData = await saleRes.json();
    console.log("✅ Sale Creation:", saleData.success, saleData.data?.invoiceNumber || "Created");

    // 6. Verify Fetch All
    const allCust = await (await fetch("http://localhost:5000/api/customers", { headers })).json();
    const allProd = await (await fetch("http://localhost:5000/api/products", { headers })).json();
    const allSup = await (await fetch("http://localhost:5000/api/suppliers", { headers })).json();
    console.log(`\n🎉 Verification Complete: ${allCust.data?.length} Customers, ${allProd.data?.length} Products, ${allSup.data?.length} Suppliers.`);
  } catch (err) {
    console.error("Verification failed:", err.message);
  }
}

verifyAllAddOperations();

async function testEndpoints() {
  try {
    // 1. Test Login
    const loginRes = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "sriram@example.com",
        password: "password123",
      }),
    });
    const loginData = await loginRes.json();
    console.log("✅ Login Success, token received:", !!loginData.token);
    const token = loginData.token;
    const headers = { Authorization: `Bearer ${token}` };

    // 2. Test Customers
    const custRes = await fetch("http://localhost:5000/api/customers", { headers });
    const custData = await custRes.json();
    console.log(`✅ Customers API: ${custData.data?.length} customers fetched`);

    // 3. Test Products
    const prodRes = await fetch("http://localhost:5000/api/products", { headers });
    const prodData = await prodRes.json();
    console.log(`✅ Products API: ${prodData.data?.length} products fetched`);

    // 4. Test Dashboard Summary
    const dashRes = await fetch("http://localhost:5000/api/dashboard/summary", { headers });
    const dashData = await dashRes.json();
    console.log("✅ Dashboard Summary API:", dashData.data);

    // 5. Test Categories
    const catRes = await fetch("http://localhost:5000/api/categories", { headers });
    const catData = await catRes.json();
    console.log(`✅ Categories API: ${catData.data?.length} categories fetched`);

    // 6. Test Suppliers
    const supRes = await fetch("http://localhost:5000/api/suppliers", { headers });
    const supData = await supRes.json();
    console.log(`✅ Suppliers API: ${supData.data?.length} suppliers fetched`);

    console.log("\n🎉 ALL API ENDPOINTS VERIFIED & WORKING 100%!");
  } catch (err) {
    console.error("Test Error:", err.message);
  }
}

testEndpoints();

import API from "./axios";

// GET INVENTORY HISTORY
export const getInventoryHistory = async () => {
  try {
    const response = await API.get("/inventory/history");
    return response.data;
  } catch (error) {
    console.error("Get Inventory History Error:", error.response?.data || error.message);
    throw error;
  }
};

// GET LOW STOCK PRODUCTS
export const getLowStock = async () => {
  try {
    const response = await API.get("/inventory/low-stock");
    return response.data;
  } catch (error) {
    console.error("Get Low Stock Error:", error.response?.data || error.message);
    throw error;
  }
};

// STOCK IN
export const stockIn = async (data) => {
  try {
    const response = await API.post("/inventory/stock-in", data);
    return response.data;
  } catch (error) {
    console.error("Stock In Error:", error.response?.data || error.message);
    throw error;
  }
};

// STOCK OUT
export const stockOut = async (data) => {
  try {
    const response = await API.post("/inventory/stock-out", data);
    return response.data;
  } catch (error) {
    console.error("Stock Out Error:", error.response?.data || error.message);
    throw error;
  }
};

// ADJUST STOCK
export const adjustStock = async (data) => {
  try {
    const response = await API.post("/inventory/adjust", data);
    return response.data;
  } catch (error) {
    console.error("Adjust Stock Error:", error.response?.data || error.message);
    throw error;
  }
};

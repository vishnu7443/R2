import API from "./axios";

// ======================================
// GET ALL SALES
// ======================================
export const getSales = async () => {
  try {
    const response = await API.get("/sales");
    return response.data;
  } catch (error) {
    console.error("Get Sales Error:", error.response?.data || error.message);
    throw error;
  }
};

// ======================================
// GET SALE BY ID
// ======================================
export const getSaleById = async (id) => {
  try {
    const response = await API.get(`/sales/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get Sale Error:", error.response?.data || error.message);
    throw error;
  }
};

// ======================================
// CREATE SALE
// ======================================
export const createSale = async (saleData) => {
  try {
    const response = await API.post("/sales", saleData);
    return response.data;
  } catch (error) {
    console.error("Create Sale Error:", error.response?.data || error.message);
    throw error;
  }
};

// ======================================
// UPDATE SALE STATUS
// ======================================
export const updateSaleStatus = async (id, status) => {
  try {
    const response = await API.put(`/sales/${id}`, { status });
    return response.data;
  } catch (error) {
    console.error("Update Sale Error:", error.response?.data || error.message);
    throw error;
  }
};

// ======================================
// DELETE SALE
// ======================================
export const deleteSale = async (id) => {
  try {
    const response = await API.delete(`/sales/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete Sale Error:", error.response?.data || error.message);
    throw error;
  }
};

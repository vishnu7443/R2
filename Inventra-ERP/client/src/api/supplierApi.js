import API from "./axios";


// GET ALL SUPPLIERS

export const getSuppliers = async () => {

    const response = await API.get("/suppliers");

    console.log(
        "SUPPLIER API RESPONSE:",
        response.data
    );

    return response.data;

};



// GET SINGLE SUPPLIER

export const getSupplierById = async (id) => {

    const response =
        await API.get(`/suppliers/${id}`);

    return response.data;

};



// CREATE SUPPLIER

export const createSupplier = async(data)=>{

    const response =
        await API.post(
            "/suppliers",
            data
        );

    return response.data;

};



// UPDATE SUPPLIER

export const updateSupplier = async(id,data)=>{

    const response =
        await API.put(
            `/suppliers/${id}`,
            data
        );

    return response.data;

};



// DELETE SUPPLIER

export const deleteSupplier = async(id)=>{

    const response =
        await API.delete(
            `/suppliers/${id}`
        );

    return response.data;

};
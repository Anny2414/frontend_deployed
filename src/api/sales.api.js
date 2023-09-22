import axios from "axios";

const orderApi = axios.create({
    baseURL: "https://yourburger.onrender.com/yourburger/api/v1/sales/",
});

export const getSales = () => orderApi.get("/");

export const getSale = (orderId) => orderApi.get(`/${orderId}/`);

export const createSale = (order) => orderApi.post("/", order);

export const deleteSale = (SalesId) => orderApi.delete(`/${SalesId}/`);

export const editSale = (SalesId, updatedSales) =>
    orderApi.patch(`/${SalesId}/`, updatedSales);

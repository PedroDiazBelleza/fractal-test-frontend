import axios from 'axios';
import type { Order, OrderItem } from './types';
const prefixUrl = 'http://localhost:3001/api/orders'; // Cambia esto a la URL de tu API


export const OrdersService = {
    findAll: async () => {
        const { data } = await axios.get(`${prefixUrl}`)
        return { data }
    },

    findById: async (id: number) => {
        const { data } = await axios.get(`${prefixUrl}/${id}`)
        return { data }
    },

    create: async (orders: Partial<Order>) => {
        const { data } = await axios.post(`${prefixUrl}`, orders)
        return { data }
    },

    createDetails: async (orders: Partial<OrderItem>) => {
        const { data } = await axios.post(`${prefixUrl}/createDetails`, orders)
        return { data }
    },

    updateDetails: async (details: Partial<OrderItem>) => {
        const { data } = await axios.put(`${prefixUrl}/updateDetails`, details);
        return { data };
    },


    update: async (id: number, orders: Partial<Order>) => {
        const { data } = await axios.put(`${prefixUrl}/${id}`, orders)
        return { data }
    },


    changeStatus: async (id: number, status: string) => {
        const { data } = await axios.patch(`${prefixUrl}/changeStatus/${id}`, { status });
        return data;
    },


    delete: async (id: number) => {
        const { data } = await axios.delete(`${prefixUrl}/${id}`)
        return { data }
    },
}

import axios from 'axios'; 
import type { Product } from './types';
const prefixUrl = 'http://localhost:3001/api/products'; // Cambia esto a la URL de tu API


export const  ProductsService = {
    findAll: async () => {
        const { data } = await axios.get(`${prefixUrl}`)
        return { data }
    },

    findById: async (id: number) => {
        const { data } = await axios.get(`${prefixUrl}/${id}`)
        return { data }
    },

    findByOrderId: async (id: number) => {
        const { data } = await axios.get(`${prefixUrl}/findByOrderId/${id}`)
        return { data }
    },

    create: async (products: Partial<Product>) => {
        const { data } = await axios.post(`${prefixUrl}`, products)
        return { data }
    },

    update: async (id: number, products: Partial<Product>) => {
        const { data } = await axios.put(`${prefixUrl}/${id}`, products)
        return { data }
    },

    delete: async (id: number) => {
        const { data } = await axios.delete(`${prefixUrl}/${id}`)
        return { data }
    },
}

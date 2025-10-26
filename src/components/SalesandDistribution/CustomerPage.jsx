import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {Link} from "react-router-dom";
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
export default function CustomerPage() {
    const [customers, setCustomers] = useState([]);
    const [formData, setFormData] = useState({
        customer_name: '',
        email: '',
        phone: '',
        address: '',
    });

    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);



    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await axios.get(BASE_URL);
            setCustomers(response.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await axios.put(`${BASE_URL}/${editId}`, formData);
            } else {
                await axios.post(BASE_URL, formData);
            }
            setFormData({ customer_name: '', email: '', phone: '', address: '' });
            setEditMode(false);
            setIsFormVisible(false);
            fetchCustomers();
        } catch (error) {
            console.error('Error saving customer:', error);
        }
    };

    const handleEdit = (customer) => {
        setFormData(customer);
        setEditMode(true);
        setEditId(customer.customer_id);
        setIsFormVisible(true);
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this customer?");
        if (!confirmDelete) return;

        try {
            await axios.delete(`${BASE_URL}/${id}`);
            fetchCustomers();
        } catch (error) {
            console.error('Error deleting customer:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#aec3c1] to-[#546464] p-8">
            <div className="max-w-7xl mx-auto"><div className="flex justify-start mb-0">
                <Link
                    to="/sales-dashboard"
                    className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                    ← Back to Sales Dashboard
                </Link>
            </div>
                <h1 className="text-4xl font-bold text-white text-center mb-8">Customer Management</h1>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
                >
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-[#546464]">Customer List</h2>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setIsFormVisible(true);
                                    setEditMode(false);
                                    setFormData({ customer_name: '', email: '', phone: '', address: '' });
                                }}
                                className="bg-[#aec3c1] text-white px-6 py-3 rounded-lg hover:bg-[#546464] transition-colors"
                            >
                                Add New Customer
                            </motion.button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                <tr className="bg-[#aec3c1] text-white">
                                    <th className="py-4 px-6 text-left">Name</th>
                                    <th className="py-4 px-6 text-left">Email</th>
                                    <th className="py-4 px-6 text-left">Phone</th>
                                    <th className="py-4 px-6 text-left">Address</th>
                                    <th className="py-4 px-6 text-left">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {customers.map((customer) => (
                                    <tr key={customer.customer_id} className="hover:bg-gray-50">
                                        <td className="py-4 px-6">{customer.customer_name}</td>
                                        <td className="py-4 px-6">{customer.email}</td>
                                        <td className="py-4 px-6">{customer.phone}</td>
                                        <td className="py-4 px-6">{customer.address}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex space-x-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleEdit(customer)}
                                                    className="bg-[#aec3c1] text-white px-4 py-2 rounded-lg hover:bg-[#546464] transition-colors"
                                                >
                                                    Edit
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleDelete(customer.customer_id)}
                                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                                                >
                                                    Delete
                                                </motion.button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {customers.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4 text-gray-500">No customers found.</td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>

                {isFormVisible && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white p-8 rounded-2xl shadow-xl w-[500px]"
                        >
                            <h2 className="text-2xl font-bold text-[#546464] mb-6">
                                {editMode ? 'Edit Customer' : 'Add New Customer'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 mb-2">Customer Name</label>
                                    <input
                                        type="text"
                                        name="customer_name"
                                        value={formData.customer_name}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#aec3c1] focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#aec3c1] focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-2">Phone</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#aec3c1] focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-2">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#aec3c1] focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end space-x-4 mt-6">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="button"
                                        onClick={() => setIsFormVisible(false)}
                                        className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="submit"
                                        className="px-6 py-3 bg-[#aec3c1] text-white rounded-lg hover:bg-[#546464] transition-colors"
                                    >
                                        {editMode ? 'Update' : 'Add'} Customer
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}
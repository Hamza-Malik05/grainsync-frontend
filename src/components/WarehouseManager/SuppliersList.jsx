import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {Link} from "react-router-dom";
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
const SupplierList = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [newSupplier, setNewSupplier] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        city: ''
    });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/suppliers`);
            setSuppliers(response.data);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            alert('Failed to load suppliers.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewSupplier(prev => ({ ...prev, [name]: value }));
    };

    const handleAddSupplier = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${BASE_URL}/api/suppliers`, newSupplier);
            setSuppliers(prev => [...prev, res.data]);
            setNewSupplier({ name: '', phone: '', email: '', address: '', city: '' });
        } catch (err) {
            console.error('Error adding supplier:', err);
            alert('Failed to add supplier.');
        }
    };

    const handleDeleteSupplier = async (id) => {
        const confirm = window.confirm('Are you sure you want to delete this supplier?');
        if (!confirm) return;

        try {
            await axios.delete(`${BASE_URL}/api/suppliers/${id}`);
            setSuppliers(prev => prev.filter(s => s.supplier_id !== id));
        } catch (err) {
            console.error('Error deleting supplier:', err);
            alert('Failed to delete supplier.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#cde1df] to-[#657f7f] p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8"
            ><div className="flex justify-start mb-0">
                <Link
                    to="/warehouse-dashboard"
                    className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                    ← Back to Warehouse Dashboard
                </Link>
            </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                    Supplier Directory
                </h2>

                {/* Add Supplier Form */}
                <form onSubmit={handleAddSupplier} className="space-y-4 mb-10">
                    <h3 className="text-xl font-semibold text-gray-700">Add New Supplier</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="name" value={newSupplier.name} onChange={handleInputChange} placeholder="Name" required className="border p-2 rounded" />
                        <input type="text" name="phone" value={newSupplier.phone} onChange={handleInputChange} placeholder="Phone" required className="border p-2 rounded" />
                        <input type="email" name="email" value={newSupplier.email} onChange={handleInputChange} placeholder="Email" required className="border p-2 rounded" />
                        <input type="text" name="address" value={newSupplier.address} onChange={handleInputChange} placeholder="Address" required className="border p-2 rounded" />
                        <input type="text" name="city" value={newSupplier.city} onChange={handleInputChange} placeholder="City" required className="border p-2 rounded" />
                    </div>
                    <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition">Add Supplier</button>
                </form>

                {/* Supplier Table */}
                <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
                    <thead className="bg-gray-200">
                    <tr>
                        <th className="py-3 px-4 text-left">ID</th>
                        <th className="py-3 px-4 text-left">Name</th>
                        <th className="py-3 px-4 text-left">Contact</th>
                        <th className="py-3 px-4 text-left">Email</th>
                        <th className="py-3 px-4 text-left">Address</th>
                        <th className="py-3 px-4 text-left">City</th>
                    </tr>
                    </thead>
                    <tbody>
                    {suppliers.map((supplier) => (
                        <tr key={supplier.supplier_id} className="border-t hover:bg-gray-50">
                            <td className="py-3 px-4">{supplier.supplier_id}</td>
                            <td className="py-3 px-4">{supplier.name}</td>
                            <td className="py-3 px-4">{supplier.phone}</td>
                            <td className="py-3 px-4">{supplier.email}</td>
                            <td className="py-3 px-4">{supplier.address}</td>
                            <td className="py-3 px-4">{supplier.city}</td>
                            <td className="py-3 px-4">
                                <button
                                    onClick={() => handleDeleteSupplier(supplier.supplier_id)}
                                    className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 transition"
                                >
                                    Delete
                                </button>
                            </td>

                        </tr>
                    ))}
                    {suppliers.length === 0 && (
                        <tr>
                            <td colSpan="7" className="text-center py-4 text-gray-500">
                                No suppliers found.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </motion.div>
        </div>
    );
};

export default SupplierList;

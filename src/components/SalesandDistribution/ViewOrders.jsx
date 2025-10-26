import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {Link} from "react-router-dom";
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
export default function ViewOrders() {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState(null);


    useEffect(() => {
        axios.get(`${BASE_URL}/orders`)
            .then(res => setOrders(res.data))
            .catch(err => {
                console.error('Failed to fetch orders:', err);
                setError('Failed to fetch orders.');
            });
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#aec3c1] to-[#546464] p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8"
            ><div className="flex justify-start mb-0">
                <Link
                    to="/sales-dashboard"
                    className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                    ← Back to Sales Dashboard
                </Link>
            </div>
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">View All Orders</h2>

                {error && <p className="text-center text-red-600">{error}</p>}

                {orders.length === 0 && !error ? (
                    <p className="text-center text-gray-600">No orders found.</p>
                ) : (
                    <div className="space-y-6">
                        {orders.map(order => (
                            <div key={order.order_id} className="bg-gray-100 rounded-lg p-6 shadow-md">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-xl font-semibold text-gray-800">Order #{order.order_id}</h3>
                                    <span className={`text-sm px-3 py-1 rounded-full ${order.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800'}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <p className="text-gray-700">Customer ID: {order.customer_id}</p>
                                <p className="text-gray-700">Address: {order.address || 'N/A'}</p>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
}

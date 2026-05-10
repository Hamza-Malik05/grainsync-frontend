import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const ViewSalesAndPurchases = () => {
    const [sales, setSales] = useState([]);

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/sales`);
            setSales(res.data);
        } catch (err) {
            console.error("Failed to fetch sales:", err);
            alert("Unable to load sales.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f1f6f5] to-[#a8c3bc] p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8"
            >
                <div className="flex justify-start mb-4">
                    <Link
                        to="/finance-dashboard"
                        className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                    >
                        ← Back to Finance Dashboard
                    </Link>
                </div>

                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Sales Records</h2>

                <div className="overflow-x-auto">
                    <motion.table
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full table-auto border-collapse"
                    >
                        <thead className="bg-[#6a8f8f] text-white">
                        <tr>
                            <th className="p-3 text-left">Sale ID</th>
                            <th className="p-3 text-left">Order ID</th>
                            <th className="p-3 text-left">Amount</th>
                            <th className="p-3 text-left">Payment Method</th>
                            <th className="p-3 text-left">Date</th>
                            <th className="p-3 text-left">Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {sales.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center p-4 text-gray-500">
                                    No sales found.
                                </td>
                            </tr>
                        ) : (
                            sales.map((sale) => (
                                <tr key={sale.sale_id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="p-3 font-medium">{sale.sale_id}</td>
                                    <td className="p-3">{sale.order_id}</td>
                                    <td className="p-3">
                                        {sale.transaction ? `$${sale.transaction.amount.toLocaleString()}` : 'N/A'}
                                    </td>
                                    <td className="p-3 capitalize">
                                        {sale.transaction ? sale.transaction.payment_method : 'N/A'}
                                    </td>
                                    <td className="p-3">
                                        {sale.transaction ? sale.transaction.date_of_transaction : 'N/A'}
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            sale.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                sale.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {sale.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </motion.table>
                </div>
            </motion.div>
        </div>
    );
};

export default ViewSalesAndPurchases;
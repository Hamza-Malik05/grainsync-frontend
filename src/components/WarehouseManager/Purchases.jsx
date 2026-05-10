import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function Purchases() {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);

    // Default price per unit for calculations if the DB row lacks it
    const DEFAULT_PRICE = 30.0;

    useEffect(() => {
        fetchPurchases();
    }, []);

    const fetchPurchases = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/purchases`);
            setPurchases(res.data || []);
        } catch (err) {
            console.error('Failed to load purchases:', err);
            alert('Failed to load purchases.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (raw) => {
        if (!raw) return 'N/A';
        const str = String(raw);
        if (str.includes('T')) return str.split('T')[0];
        if (str.includes(' ')) return str.split(' ')[0];
        return str.slice(0, 10);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#aec3c1] to-[#546464] p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-8"
            >
                <div className="flex justify-start mb-4">
                    <Link
                        to="/warehouse-dashboard"
                        className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                    >
                        ← Back to Warehouse Dashboard
                    </Link>
                </div>

                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Purchases</h2>

                {loading ? (
                    <div className="text-center py-8 text-gray-600">Loading purchases…</div>
                ) : purchases.length === 0 ? (
                    <div className="text-center py-8 text-gray-600">No purchases found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border rounded-lg">
                            <thead className="bg-[#aec3c1] text-white">
                            <tr>
                                <th className="py-3 px-4 text-left">Purchase ID</th>
                                <th className="py-3 px-4 text-left">Supplier ID</th>
                                <th className="py-3 px-4 text-left">Supplier Name</th>
                                <th className="py-3 px-4 text-left">Units Bought</th>
                                <th className="py-3 px-4 text-left">Price / Unit</th>
                                <th className="py-3 px-4 text-left">Total Amount</th>
                                <th className="py-3 px-4 text-left">Date</th>
                            </tr>
                            </thead>
                            <tbody>
                            {purchases.map((p) => {
                                // Extract required fields directly
                                const purchaseId = p.purchase_id ?? p.id ?? 'N/A';
                                const supplierId = p.supplier_id ?? (p.supplier?.supplier_id) ?? 'N/A';

                                // Safely extract the supplier name if your backend populates it
                                const supplierName = p.supplier?.name ?? p.supplier_name ?? 'N/A';

                                const units = parseFloat(p.units_bought || 0);
                                const uom = p.unit_of_measurement || 'kg';

                                // Fetch price or fall back to default
                                const price = parseFloat(p.price_per_unit || DEFAULT_PRICE);

                                // Calculate total dynamically at runtime
                                const runtimeTotal = units * price;

                                const date = formatDate(p.date_of_purchase ?? p.delivery_date);

                                return (
                                    <tr key={purchaseId} className="border-t hover:bg-gray-50">
                                        <td className="py-2 px-4 border font-medium text-gray-700">
                                            {purchaseId}
                                        </td>
                                        <td className="py-2 px-4 border text-gray-600">
                                            {supplierId}
                                        </td>
                                        <td className="py-2 px-4 border text-gray-600 font-medium">
                                            {supplierName}
                                        </td>
                                        <td className="py-2 px-4 border text-gray-600">
                                            {units} {uom}
                                        </td>
                                        <td className="py-2 px-4 border text-gray-600">
                                            ${price.toFixed(2)}
                                        </td>
                                        <td className="py-2 px-4 border font-semibold text-green-700">
                                            ${runtimeTotal.toFixed(2)}
                                        </td>
                                        <td className="py-2 px-4 border text-gray-600">
                                            {date}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
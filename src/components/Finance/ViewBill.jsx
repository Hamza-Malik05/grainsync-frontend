import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {Link} from "react-router-dom";
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
const ViewBills = () => {
    const [bills, setBills] = useState([]);

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/bills`);
            setBills(res.data);
        } catch (err) {
            console.error("Failed to fetch bills:", err);
            alert("Unable to load bills.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f1f6f5] to-[#a8c3bc] p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-8"
            ><div className="flex justify-start mb-0">
                <Link
                    to="/finance-dashboard"
                    className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                >
                    ← Back to Finance Dashboard
                </Link>
            </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">View Bills</h2>


                <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse">
                        <thead className="bg-[#6a8f8f] text-white">
                        <tr>
                            <th className="p-3 text-left">Bill ID</th>
                            <th className="p-3 text-left">Amount</th>
                            <th className="p-3 text-left">Issue Date</th>
                            <th className="p-3 text-left">Due Date</th>
                            <th className="p-3 text-left">Type</th>
                            <th className="p-3 text-left">Payment Method</th>
                        </tr>
                        </thead>
                        <tbody>
                        {bills.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center p-4 text-gray-500">No bills found.</td>
                            </tr>
                        ) : (
                            bills.map((bill) => (
                                <tr key={bill.bill_id} className="border-b border-gray-200 hover:bg-gray-50">
                                    <td className="p-3">{bill.bill_id}</td>
                                    <td className="p-3">{Number(bill.amount).toFixed(2)}</td>
                                    <td className="p-3">{bill.issue_date}</td>
                                    <td className="p-3">{bill.due_date}</td>
                                    <td className="p-3">{bill.bill_type}</td>
                                    <td className="p-3">{bill.payment_method || "—"}</td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default ViewBills;

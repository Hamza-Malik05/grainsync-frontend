import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {Link} from "react-router-dom";
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
export default function BatchSummary() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/batches`);
      setBatches(response.data);
    } catch (error) {
      console.error("Error fetching batches:", error);
      alert("Failed to load batches.");
    }
  };

  const calculateStats = (batch) => {
    if (!batch) return null;
    const yieldPercent = ((batch.quantity_produced / batch.quantity_used) * 100).toFixed(2);
    const wastage = (batch.quantity_used - batch.quantity_produced).toFixed(2);
    return { yieldPercent, wastage };
  };

  const stats = selectedBatch ? calculateStats(selectedBatch) : null;

  return (
      <div className="min-h-screen bg-gradient-to-br from-[#aec3c1] to-[#546464] p-8">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8"
        ><div className="flex justify-start mb-0">
          <Link
              to="/production-dashboard"
              className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            ← Back to Production Dashboard
          </Link>
        </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Batch Summary
          </h2>

          <div className="overflow-x-auto mb-8">
            <table className="min-w-full bg-white border rounded-lg">
              <thead className="bg-[#aec3c1] text-white">
              <tr>
                <th className="py-3 px-4 text-left">Batch ID</th>
                <th className="py-3 px-4 text-left">Product</th>
                <th className="py-3 px-4 text-left">Start Time</th>
                <th className="py-3 px-4 text-left">End Time</th>
                <th className="py-3 px-4 text-left">Employee</th>
              </tr>
              </thead>
              <tbody>
              {batches.map((batch) => (
                  <tr
                      key={batch.batch_id}
                      onClick={() => setSelectedBatch(batch)}
                      className={`cursor-pointer transition-colors ${
                          selectedBatch?.batch_id === batch.batch_id
                              ? "bg-gray-200"
                              : "hover:bg-gray-100"
                      }`}
                  >
                    <td className="py-2 px-4 border">{batch.batch_id}</td>
                    <td className="py-2 px-4 border">{batch.product?.name || "N/A"}</td>
                    <td className="py-2 px-4 border">{batch.start_time}</td>
                    <td className="py-2 px-4 border">{batch.end_time}</td>
                    <td className="py-2 px-4 border">
                      {batch.employee
                          ? `${batch.employee.first_name} ${batch.employee.last_name}`
                          : "N/A"}
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>

          {selectedBatch && stats && (
              <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="bg-gray-100 rounded-xl p-6 shadow-md"
              >
                <h3 className="text-2xl font-semibold mb-4 text-gray-800">
                  Production Stats
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <p><strong>Batch ID:</strong> {selectedBatch.batch_id}</p>
                  <p><strong>Product:</strong> {selectedBatch.product?.name || "N/A"}</p>
                  <p><strong>Yield (%):</strong> {stats.yieldPercent}%</p>
                  <p><strong>Wastage (Units):</strong> {stats.wastage}</p>
                </div>
              </motion.div>
          )}
        </motion.div>
      </div>
  );
}

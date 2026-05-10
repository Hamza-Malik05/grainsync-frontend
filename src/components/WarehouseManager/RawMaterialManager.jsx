import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const RawMaterialManager = () => {
    const [storageUnits, setStorageUnits] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [restockValues, setRestockValues] = useState({});
    const [selectedSuppliers, setSelectedSuppliers] = useState({});
    const BASE_URL = import.meta.env.VITE_BACKEND_URL;

    // Define the price per unit for calculations
    const PRICE_PER_UNIT = 30.0;

    useEffect(() => {
        fetchStorageUnits();
        fetchSuppliers();
    }, []);

    const fetchStorageUnits = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/storage-units`);
            setStorageUnits(response.data);
        } catch (error) {
            console.error('Error fetching storage units:', error);
            alert('Failed to load storage units.');
        }
    };

    const fetchSuppliers = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/suppliers`);
            setSuppliers(response.data);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            alert('Failed to load suppliers.');
        }
    };

    // Helper to derive a stable id for a unit (supports several possible backend field names)
    const getUnitKey = (unit) => {
        return (
            unit.id ??
            unit.r_storage_unit_id ??
            unit.storage_unit_id ??
            unit.p_storage_unit_id ??
            unit.storageUnitId ??
            unit.storageId ??
            unit.s_unit_id ??
            unit.s_storage_unit_id ??
            undefined
        );
    };

    const handleRestockChange = (key, value) => {
        // Allow clearing the input
        if (value === '') {
            setRestockValues(prev => ({ ...prev, [key]: '' }));
            return;
        }
        const floatVal = parseFloat(value);
        if (Number.isNaN(floatVal)) {
            // ignore invalid numeric input
            return;
        }
        if (floatVal < 0) {
            alert("Restock amount cannot be negative.");
            return;
        }
        setRestockValues(prev => ({ ...prev, [key]: value }));
    };

    const handleSupplierChange = (key, supplierId) => {
        setSelectedSuppliers(prev => ({ ...prev, [key]: supplierId }));
    };

    const handleRestock = async (unit, key) => {
        const additionalQty = parseFloat(restockValues[key]) || 0;
        const currentQty = unit.quantity_stored ?? 0;
        const newQty = currentQty + additionalQty;
        const supplierId = selectedSuppliers[key];

        // Calculate temp bill for the alert
        const totalBill = additionalQty * PRICE_PER_UNIT;

        if (newQty > (unit.capacity ?? Infinity)) {
            alert('Cannot exceed storage capacity.');
            return;
        }

        if (!supplierId) {
            alert('Please select a supplier.');
            return;
        }

        try {
            // Update storage unit using the derived key
            await axios.put(`${BASE_URL}/api/storage-units/${key}`, {
                ...unit,
                quantity_stored: newQty,
            });

            // Record purchase in DB (without the total_bill field)
            await axios.post(`${BASE_URL}/api/purchases`, {
                supplier: { supplier_id: supplierId },
                date_of_purchase: new Date().toISOString().split('T')[0],
                delivery_date: new Date().toISOString().split('T')[0],
                unit_of_measurement: unit.unit_of_measurement ?? 'kg',
                units_bought: additionalQty,
                price_per_unit: PRICE_PER_UNIT
            });

            // Refresh and reset only this unit's controls
            fetchStorageUnits();
            setRestockValues(prev => ({ ...prev, [key]: '' }));
            setSelectedSuppliers(prev => ({ ...prev, [key]: '' }));
            alert(`Restock successful! Total estimated cost: $${totalBill.toFixed(2)}`);
        } catch (error) {
            console.error('Error during restock or purchase:', error);
            alert('Failed to restock or record purchase.');
        }
    };

    // Create a sorted array based on the unit ID
    const sortedStorageUnits = [...storageUnits].sort((a, b) => {
        const idA = getUnitKey(a) ?? 0;
        const idB = getUnitKey(b) ?? 0;
        return idA - idB; // Ascending order
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#aec3c1] to-[#546464] p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8"
            >
                <div className="flex justify-start mb-0">
                    <Link
                        to="/warehouse-dashboard"
                        className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                    >
                        ← Back to Warehouse Dashboard
                    </Link>
                </div>

                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                    Raw Material Inventory
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sortedStorageUnits.map((unit) => {
                        const key = getUnitKey(unit);
                        // fallback key to index (less ideal) if no id is present
                        if (key === undefined) {
                            console.warn('Storage unit without identifiable id:', unit);
                        }
                        const unitKey = key ?? `idx-${unit.capacity ?? Math.random()}`;

                        const inputValue = parseFloat(restockValues[unitKey]) || 0;
                        const isActive = inputValue > 0;
                        // Temp calculated cost purely for UI display
                        const calculatedCost = inputValue * PRICE_PER_UNIT;

                        return (
                            <motion.div
                                key={unitKey}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                className="border rounded-xl p-6 shadow-sm bg-gray-50"
                            >
                                <h3 className="text-xl font-semibold mb-2 text-gray-800">Unit #{unitKey}</h3>
                                <p className="text-gray-700">Capacity: <strong>{unit.capacity}</strong></p>
                                <p className="text-gray-700 mb-4">Stored: <strong>{unit.quantity_stored}</strong></p>

                                <div className="mb-3">
                                    <label className="block mb-1 text-sm font-medium text-gray-700">Supplier</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-lg"
                                        value={selectedSuppliers[unitKey] || ''}
                                        onChange={(e) => handleSupplierChange(unitKey, e.target.value)}
                                    >
                                        <option value="">Select Supplier</option>
                                        {suppliers.map((supplier) => (
                                            <option key={supplier.supplier_id} value={supplier.supplier_id}>
                                                {supplier.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            placeholder="Restock amount"
                                            className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#aec3c1] focus:border-transparent"
                                            value={restockValues[unitKey] ?? ''}
                                            onChange={(e) => handleRestockChange(unitKey, e.target.value)}
                                        />
                                        <motion.button
                                            onClick={() => handleRestock(unit, unitKey)}
                                            whileHover={{ scale: isActive ? 1.02 : 1 }}
                                            whileTap={{ scale: isActive ? 0.98 : 1 }}
                                            disabled={!isActive}
                                            className={`px-4 py-2 rounded-lg transition-colors ${
                                                isActive
                                                    ? 'bg-[#aec3c1] text-white hover:bg-[#546464]'
                                                    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                            }`}
                                        >
                                            Restock
                                        </motion.button>
                                    </div>
                                    {/* Display calculated cost dynamically as a temp field */}
                                    <div className="text-sm font-medium text-gray-600 h-5">
                                        {isActive && (
                                            <span>Estimated Cost: <strong className="text-green-700">${calculatedCost.toFixed(2)}</strong></span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
};

export default RawMaterialManager;
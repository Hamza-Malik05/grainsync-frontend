import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const BASE_SALARIES = {
    'HR Manager': 5500, 'Admin': 6000,
    'Warehouse Manager': 5500,
    'Finance Manager': 5500,
    'Production Supervisor': 5500,
    'Sales Manager': 5500,
    'Training and Development Officer': 5800,
    'Attendance Supervisor': 5000,
    'Inventory Supervisor': 5200,
    'Dispatch Officer': 4800,
    'Supervisor': 6000,
    'Machine Operator': 4200,
    'Quality Inspector': 4500,
    'Process Technician': 4700,
    'Accountant': 6200,
    'Billing Officer': 5000,
    'Audit Officer': 6500,
    'Financial Analyst': 7000,
    'Sales Representative': 5300,
    'Customer Relations Officer': 5200,
    'Marketing Assistant': 4800,
    'Driver': 3500,
    'Delivery Supervisor': 4600,
    'Vehicle Maintenance Coordinator': 4800
};

const ManageSalaries = () => {
    const [salaries, setSalaries] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [accountants, setAccountants] = useState([]);
    const [selectedAccountant, setSelectedAccountant] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [editingSalary, setEditingSalary] = useState(null);
    const [editValues, setEditValues] = useState({ bonus: 0, fine: 0 });

    useEffect(() => {
        fetchData();
    }, [selectedMonth]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [employeesRes, salariesRes, accountantsRes] = await Promise.all([
                axios.get(`${BASE_URL}/api/employees`),
                axios.get(`${BASE_URL}/api/salaries/date/${selectedMonth}-01`),
                axios.get(`${BASE_URL}/api/accountant`)
            ]);

            setEmployees(employeesRes.data || []);
            setSalaries(salariesRes.data || []);
            setAccountants(accountantsRes.data || []);

            if (accountantsRes.data?.length > 0 && !selectedAccountant) {
                setSelectedAccountant(accountantsRes.data[0].accountant_id);
            }
            setError(null);
        } catch (err) {
            setError('Failed to fetch data. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAllSalaries = async () => {
        if (!selectedAccountant) {
            setError('Please select an accountant first');
            return;
        }

        try {
            setIsCreating(true);
            const employeesWithoutSalary = employees.filter(emp =>
                !salaries.some(s => s.employee?.employee_id === emp.employee_id)
            );

            if (employeesWithoutSalary.length === 0) {
                setIsCreating(false);
                return;
            }

            const createPromises = employeesWithoutSalary.map(employee =>
                axios.post(`${BASE_URL}/api/salaries`, null, {
                    params: {
                        employeeId: employee.employee_id,
                        date: `${selectedMonth}-01`,
                        baseAmount: BASE_SALARIES[employee.designation] || 0,
                        bonus: 0,
                        fine: 0,
                        accountantId: selectedAccountant,
                        paymentMethod: 'bank transfer'
                    }
                })
            );

            await Promise.all(createPromises);
            await fetchData();
        } catch (err) {
            setError('Failed to create salary records.');
            console.error(err);
        } finally {
            setIsCreating(false);
        }
    };

    const handleEdit = (salary) => {
        setEditingSalary(salary);
        setEditValues({
            bonus: salary.bonus || 0,
            fine: salary.fine || 0
        });
    };

    const handleEditChange = (field, value) => {
        setEditValues(prev => ({
            ...prev,
            [field]: parseFloat(value) || 0
        }));
    };

    // MOVED OUTSIDE THE RENDER LOOP
    const handleSave = async (salaryId) => {
        try {
            await axios.put(`${BASE_URL}/api/salaries/${salaryId}`, null, {
                params: {
                    bonus: editValues.bonus,
                    fine: editValues.fine
                }
            });
            setEditingSalary(null);
            setEditValues({ bonus: 0, fine: 0 });
            await fetchData();
        } catch (err) {
            setError('Failed to update salary.');
            console.error(err);
        }
    };

    if (loading) return <div className="flex justify-center p-10 font-bold">Loading...</div>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container mx-auto px-4 py-8">
            <div className="flex justify-start mb-4">
                <Link to="/finance-dashboard" className="bg-gray-500 text-white px-4 py-2 rounded-lg">← Back</Link>
            </div>

            {error && <div className="text-red-500 bg-red-50 p-4 rounded mb-4">{error}</div>}

            <div className="bg-white p-6 rounded-lg shadow mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold mb-4">Manage Salaries</h2>
                    <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="border p-2 rounded" />
                </div>
                <div className="flex gap-4">
                    <select value={selectedAccountant} onChange={(e) => setSelectedAccountant(e.target.value)} className="border p-2 rounded">
                        <option value="">Select Accountant</option>
                        {accountants.map(acc => (
                            <option key={acc.accountant_id} value={acc.accountant_id}>
                                {acc.employee?.first_name} {acc.employee?.last_name}
                            </option>
                        ))}
                    </select>
                    <button onClick={handleCreateAllSalaries} disabled={isCreating} className="bg-blue-600 text-white px-4 py-2 rounded">
                        {isCreating ? 'Processing...' : 'Create All Records'}
                    </button>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left">Employee</th>
                        <th className="px-6 py-3 text-left">Base</th>
                        <th className="px-6 py-3 text-left">Bonus</th>
                        <th className="px-6 py-3 text-left">Fine</th>
                        <th className="px-6 py-3 text-left">Total</th>
                        <th className="px-6 py-3 text-left">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {employees.map(employee => {
                        // DEFENSIVE MATCHING: Check both snake_case and camelCase
                        const salary = salaries.find(s => s.employee?.employee_id === employee.employee_id);
                        const baseSalary = BASE_SALARIES[employee.designation] || 0;
                        const sId = salary?.salary_id || salary?.salaryId; // Handle both cases

                        return (
                            <tr key={employee.employee_id} className="border-t">
                                <td className="px-6 py-4">
                                    <div className="font-bold">{employee.first_name} {employee.last_name}</div>
                                    <div className="text-sm text-gray-500">{employee.designation}</div>
                                </td>
                                <td className="px-6 py-4">${baseSalary.toFixed(2)}</td>
                                {salary ? (
                                    <>
                                        <td className="px-6 py-4">
                                            {editingSalary?.salary_id === sId || editingSalary?.salaryId === sId ? (
                                                <input type="number" value={editValues.bonus} onChange={(e) => handleEditChange('bonus', e.target.value)} className="border w-20 p-1" />
                                            ) : `$${salary.bonus}`}
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingSalary?.salary_id === sId || editingSalary?.salaryId === sId ? (
                                                <input type="number" value={editValues.fine} onChange={(e) => handleEditChange('fine', e.target.value)} className="border w-20 p-1" />
                                            ) : `$${salary.fine}`}
                                        </td>
                                        <td className="px-6 py-4 font-bold">
                                            ${(baseSalary + (salary.bonus || 0) - (salary.fine || 0)).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingSalary?.salary_id === sId || editingSalary?.salaryId === sId ? (
                                                <button onClick={() => handleSave(sId)} className="text-green-600 font-bold">Save</button>
                                            ) : (
                                                <button onClick={() => handleEdit(salary)} className="text-blue-600 underline">Edit</button>
                                            )}
                                        </td>
                                    </>
                                ) : (
                                    <td colSpan="4" className="px-6 py-4 text-gray-400 italic">Not yet created</td>
                                )}
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
};

export default ManageSalaries;
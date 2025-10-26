import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
const RegisterEmployeeUser = () => {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [form, setForm] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const userRole = localStorage.getItem('role');

    useEffect(() => {
        if (userRole !== 'admin') {
            navigate('/');
        }
    }, [userRole, navigate]);

    useEffect(() => {
        axios.get(`${BASE_URL}/api/employees/unregistered`)
            .then(res => setEmployees(res.data))
            .catch(err => {
                console.error('Error fetching employees:', err);
                alert('Failed to load employee data.');
            });
    }, []);

    // Check username availability
    useEffect(() => {
        if (form.username.trim().length > 0) {
            axios.get(`${BASE_URL}/api/users/check-username`, {
                params: { username: form.username }
            })
                .then(res => {
                    if (res.data === true) {
                        setUsernameError('Username is already taken.');
                    } else {
                        setUsernameError('');
                    }
                })
                .catch(err => {
                    console.error('Username check failed', err);
                });
        }
    }, [form.username]);

    const handleRegister = async (e) => {
        e.preventDefault();

        // Password length check
        if (form.password.length < 8) {
            setPasswordError("Password must be at least 8 characters.");
            return;
        } else {
            setPasswordError('');
        }

        if (form.password !== form.confirmPassword) {
            setPasswordError("Passwords do not match.");
            return;
        }

        if (usernameError) return;

        try {
            await axios.post(`${BASE_URL}/api/users/register-from-employee`, {
                employee_id: selectedEmployeeId,
                username: form.username,
                password: form.password
            });

            navigate('/remove-user');
        } catch (error) {
            console.error('Registration failed:', error.response?.data || error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#aec3c1] to-[#546464] p-8 flex justify-center items-start">
            <form onSubmit={handleRegister} className="bg-white p-8 rounded-xl shadow-md w-full max-w-xl space-y-6">
                <div className="flex justify-start mb-4">
                    <Link
                        to="/user-dashboard"
                        className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                    >
                        ← Back to User Dashboard
                    </Link>
                </div>

                <h2 className="text-2xl font-bold text-center text-gray-700">Register User</h2>

                <select
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none"
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    required
                >
                    <option value="">Select an employee</option>
                    {employees.map(emp => (
                        <option key={emp.employee_id} value={emp.employee_id}>
                            {emp.first_name} {emp.last_name} ({emp.department?.name})
                        </option>
                    ))}
                </select>

                <div>
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={form.username}
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    {usernameError && <p className="text-red-600 text-sm mt-1">{usernameError}</p>}
                </div>

                <div>
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                </div>

                <div>
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                    {passwordError && <p className="text-red-600 text-sm mt-1">{passwordError}</p>}
                </div>

                <button
                    type="submit"
                    className="w-full bg-[#aec3c1] text-white font-semibold py-2 rounded-lg hover:bg-[#546464] transition"
                >
                    Register User
                </button>
            </form>
        </div>
    );
};

export default RegisterEmployeeUser;

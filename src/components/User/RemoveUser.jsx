import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const RemoveUser = () => {
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState('');
    const loggedInUsername = localStorage.getItem('username'); // Get logged-in username

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/api/users`);
            setUsers(res.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            setMessage('Failed to load users.');
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await axios.delete(`${BASE_URL}/api/users/${userId}`);
            setMessage(`User with ID ${userId} deleted.`);
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            setMessage('Failed to delete user.');
        }
    };

    const handleMakeAdmin = async (userId) => {
        try {
            await axios.put(`${BASE_URL}/api/users/${userId}/make-admin`);
            setMessage(`User with ID ${userId} promoted to admin.`);
            fetchUsers();
        } catch (error) {
            console.error('Error promoting user:', error);
            setMessage('Failed to promote user.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#c3dcdc] to-[#4f6464] p-6">
            <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-8">
                <div className="flex justify-start mb-4">
                    <Link
                        to="/user-dashboard"
                        className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                    >
                        ← Back to User Dashboard
                    </Link>
                </div>

                <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Manage Users</h2>

                {message && <p className="text-blue-600 mb-4">{message}</p>}

                <table className="w-full border-collapse">
                    <thead>
                    <tr className="bg-gray-200 text-left">
                        <th className="p-3">User ID</th>
                        <th className="p-3">Username</th>
                        <th className="p-3">Role</th>
                        <th className="p-3 text-center">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="text-center p-4 text-gray-500">
                                No users found.
                            </td>
                        </tr>
                    ) : (
                        users.map((user) => {
                            const isProtected = user.username === 'h_malik' || user.username === loggedInUsername;
                            return (
                                <tr key={user.user_id} className="border-t hover:bg-gray-50">
                                    <td className="p-3">{user.user_id}</td>
                                    <td className="p-3">{user.username}</td>
                                    <td className="p-3 capitalize">{user.role}</td>
                                    <td className="p-3">
                                        <div className="flex justify-center gap-3">
                                            <button
                                                onClick={() => handleDelete(user.user_id)}
                                                disabled={isProtected}
                                                className={`px-4 py-1 rounded-lg shadow text-white ${
                                                    isProtected
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-red-500 hover:bg-red-600'
                                                }`}
                                            >
                                                {isProtected ? 'Protected' : 'Delete'}
                                            </button>
                                            <button
                                                onClick={() => handleMakeAdmin(user.user_id)}
                                                disabled={user.role === 'admin'}
                                                className={`px-4 py-1 rounded-lg shadow text-white ${
                                                    user.role === 'admin'
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-blue-500 hover:bg-blue-600'
                                                }`}
                                            >
                                                {user.role === 'admin' ? 'Already Admin' : 'Make Admin'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RemoveUser

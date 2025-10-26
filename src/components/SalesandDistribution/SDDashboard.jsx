import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
const SDDashboard = () => {
    const navigate = useNavigate();
const userRole = localStorage.getItem('role');
    const username = localStorage.getItem('username');
    const cards = [
        {
            title: 'Add Order',
            path: '/sd/orders/add',
            description: 'Create new orders',
            icon: '➕',
        },
        {
            title: 'View Orders',
            path: '/sd/orders/view',
            description: 'Browse all orders',
            icon: '📄',
        },
        {
            title: 'Manage Customers',
            path: '/sd/customers',
            description: 'Manage customer records',
            icon: '👥',
        },
        {
            title: 'Manage Deliveries',
            path: '/sd/deliveries',
            description: 'Track deliveries',
            icon: '🚚',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#aec3c1] to-[#546464] p-8">
            {userRole === 'admin' && (
                <div className="flex justify-start mb-0 text-center">
                    <button
                        onClick={() => navigate('/admin-dashboard')}
                        className="bg-[#aec3c1] hover:bg-[#546464] text-white font-semibold px-6 py-2 rounded-2xl shadow-md transition-all duration-300"
                    >
                        Back to Admin Dashboard
                    </button>
                </div>

            )}
            <div className="max-w-7xl mx-auto">
                <div className="relative mb-12 flex items-center justify-center">
                    <h1 className="text-4xl font-bold text-white text-center">
                        Sales and Distribution Dashboard
                    </h1>

                    {userRole === "sales_manager" && (
                        <div className="absolute right-0 text-white text-2xl font-medium px-4 py-2 rounded-full">
                            {username}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {cards.map((card, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.3,
                                delay: index * 0.1,
                                type: 'spring',
                                stiffness: 100,
                                damping: 15,
                            }}
                            onClick={() => navigate(card.path)}
                            className="bg-white rounded-2xl shadow-lg cursor-pointer flex flex-col h-[250px] hover:shadow-2xl transition-all"
                        >
                            <div className="p-6 flex-grow">
                                <div className="text-4xl mb-3">{card.icon}</div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">{card.title}</h2>
                                <p className="text-gray-600 text-sm">{card.description}</p>
                            </div>
                            <div className="bg-[#aec3c1] px-6 py-3 mt-auto">
                                <div className="flex items-center justify-between">
                                    <span className="text-white font-semibold">Access Module</span>
                                    <svg
                                        className="w-5 h-5 text-white transform transition-transform duration-150"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
            {userRole === "sales_manager" && (
                <button
                    onClick={() => navigate('/')}
                    className="fixed bottom-6 left-6 bg-white text-red-600 hover:text-red-700 border border-red-600 hover:border-red-700 font-semibold px-6 py-2 rounded-full shadow-sm transition-all duration-200"
                >
                    Logout
                </button>
            )}
        </div>
    );
};

export default SDDashboard;

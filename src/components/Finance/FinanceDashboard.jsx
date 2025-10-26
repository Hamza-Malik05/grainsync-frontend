import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('role');
    const username = localStorage.getItem('username');

    const cards = [
        {
            title: 'Add Bill',
            path: '/finance/add-bill',
            description: 'Create and log new financial bills',
            icon: '🧾',
        },
        {
            title: 'View Bills',
            path: '/finance/view-bill',
            description: 'Access and settle outstanding bills',
            icon: '💳',
        },
        {
            title: 'Manage Salaries',
            path: '/finance/salaries',
            description: 'Adjust and maintain employee salary records',
            icon: '💰',
        },
        {
            title: 'Track Sales',
            path: '/finance/track-finance',
            description: 'Monitor revenue and financial performance',
            icon: '📈',
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
                        Finance Dashboard
                    </h1>

                    {userRole === "finance_manager" && (
                        <div className="absolute right-0 text-white text-2xl font-medium px-4 py-2 rounded-full">
                            {username}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {cards.map((card, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.99 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.05,
                                type: "spring",
                                stiffness: 800,
                                damping: 15
                            }}
                            onClick={() => navigate(card.path)}
                            className="bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer transform transition-all duration-100 hover:shadow-2xl flex flex-col h-[250px]"
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
                                        className="w-5 h-5 text-white transform transition-transform duration-100 group-hover:translate-x-1"
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

            {userRole === "finance_manager" && (
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

export default Dashboard;

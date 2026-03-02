import React, { useState } from 'react';
import { Users, Mail, Shield, UserPlus, CheckCircle2, Clock, XCircle, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const initialUsers = [
    { id: 1, name: 'Alice Smith', email: 'alice@company.com', role: 'Admin', status: 'Accepted' },
    { id: 2, name: 'Bob Jones', email: 'bob@company.com', role: 'Manager', status: 'Pending' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@company.com', role: 'User', status: 'Not Sent' },
];

const UserManagement = () => {
    const [users, setUsers] = useState(initialUsers);
    const [searchTerm, setSearchTerm] = useState('');

    const handleRoleChange = (id, newRole) => {
        setUsers(users.map(user =>
            user.id === id ? { ...user, role: newRole } : user
        ));
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'Accepted':
                return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', icon: <CheckCircle2 size={12} /> };
            case 'Pending':
                return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', icon: <Clock size={12} /> };
            case 'Not Sent':
                return { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200', icon: <XCircle size={12} /> };
            default:
                return { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200', icon: null };
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-transparent p-2 space-y-6 max-w-7xl mx-auto w-full">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-5 transform translate-x-20 -translate-y-20" />

                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-[#111935] text-white flex items-center justify-center shadow-lg">
                        <Users size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-[#111935] tracking-tight">User Management</h1>
                        <p className="text-sm font-semibold text-gray-400 mt-1 flex items-center gap-2">
                            <span>Manage access roles and invitations</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span className="text-blue-600">{users.length} Active Users</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto relative z-10">
                    <div className="relative flex-1 md:min-w-[280px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Find a user..."
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-sm font-bold text-[#111935] placeholder:text-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-600/20 transition-all font-bold text-sm shrink-0 hover:-translate-y-0.5">
                        <UserPlus size={18} />
                        Invite User
                    </button>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100">
                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 w-1/3">User Profile</th>
                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">System Role</th>
                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400">Invite Status</th>
                                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => {
                                    const statusConfig = getStatusConfig(user.status);
                                    return (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="hover:bg-gray-50/50 transition-colors group"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-blue-600 font-black text-sm shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[#111935] text-sm group-hover:text-blue-600 transition-colors">{user.name}</p>
                                                        <p className="text-xs font-medium text-gray-400 flex items-center gap-1.5 mt-0.5">
                                                            <Mail size={10} className="opacity-70" /> {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2">
                                                    <Shield size={14} className={user.role === 'Admin' ? 'text-purple-500' : 'text-gray-400'} />
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                        className="bg-transparent text-sm font-bold text-[#111935] outline-none cursor-pointer focus:text-blue-600 hover:bg-gray-100 px-2 py-1 rounded-md transition-colors appearance-none"
                                                    >
                                                        <option value="Admin">Admin</option>
                                                        <option value="Manager">Manager</option>
                                                        <option value="User">User</option>
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black tracking-widest uppercase border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                                                    {statusConfig.icon}
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button className="text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-[#111935] px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                                                    Manage
                                                </button>
                                            </td>
                                        </motion.tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-8 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                                                <Users size={32} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#111935]">No users found</p>
                                                <p className="text-sm font-medium text-gray-400 mt-1">Try adjusting your search query</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default UserManagement;

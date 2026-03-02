import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, User, Globe, Clock, MessageSquare, CheckCircle2, X } from 'lucide-react';

const initialClients = [
    { id: 1, name: 'Acme Corp', industry: 'Technology', timezone: 'EST', language: 'English', status: 'Active' },
    { id: 2, name: 'Global Finance', industry: 'Finance', timezone: 'GMT', language: 'Spanish', status: 'Active' },
    { id: 3, name: 'HealthPlus', industry: 'Healthcare', timezone: 'PST', language: 'English', status: 'Inactive' },
];

const Clients = () => {
    const [clients, setClients] = useState(initialClients);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        industry: 'Technology',
        timezone: 'EST',
        language: 'English',
        status: 'Active'
    });

    const filteredClients = clients.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.industry.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 'Active' : 'Inactive') : value
        }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        const newClient = {
            id: Date.now(),
            ...formData
        };
        setClients([newClient, ...clients]);
        setIsModalOpen(false);
        setFormData({ name: '', industry: 'Technology', timezone: 'EST', language: 'English', status: 'Active' });
    };

    return (
        <div className="bg-white p-6 rounded-[32px] space-y-6">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50 p-4 rounded-3xl border border-gray-100/50">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#1e293b] text-white flex items-center justify-center shadow-md">
                        <User size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-[#1e293b] tracking-tight uppercase">Clients Management</h2>
                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">
                            {clients.length} Total Clients
                        </span>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Search Clients..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl focus:ring-1 focus:ring-blue-500 font-bold text-xs shadow-sm outline-none" 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                        />
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors text-xs font-bold shrink-0"
                    >
                        <Plus size={16} />
                        New Client
                    </button>
                </div>
            </div>

            {/* Table Area */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                                <th className="px-6 py-4">Client Name</th>
                                <th className="px-6 py-4">Industry</th>
                                <th className="px-6 py-4">Timezone</th>
                                <th className="px-6 py-4">Language</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredClients.length > 0 ? (
                                filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                                                    {client.name.charAt(0)}
                                                </div>
                                                <span className="font-bold text-[#1e293b] text-sm group-hover:text-blue-600 transition-colors">
                                                    {client.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                                                <Globe size={14} className="text-gray-400" />
                                                {client.industry}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                                                <Clock size={14} className="text-gray-400" />
                                                {client.timezone}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                                                <MessageSquare size={14} className="text-gray-400" />
                                                {client.language}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                client.status === 'Active' 
                                                ? 'bg-green-50 text-green-600 border border-green-100' 
                                                : 'bg-gray-100 text-gray-500 border border-gray-200'
                                            }`}>
                                                {client.status === 'Active' && <CheckCircle2 size={10} />}
                                                {client.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 text-sm">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <User size={32} className="text-gray-300" />
                                            <p>No clients found matching "{searchTerm}"</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, y: 20 }} 
                            animate={{ scale: 1, y: 0 }} 
                            exit={{ scale: 0.95, y: 20 }} 
                            className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="text-lg font-black text-[#1e293b]">Add New Client</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSave} className="p-6 space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Client Name</label>
                                    <input 
                                        type="text" 
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-medium"
                                        placeholder="E.g. Acme Corp"
                                    />
                                </div>
                                
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Industry</label>
                                    <select 
                                        name="industry"
                                        value={formData.industry}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium appearance-none"
                                    >
                                        <option value="Technology">Technology</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Healthcare">Healthcare</option>
                                        <option value="Education">Education</option>
                                        <option value="Retail">Retail</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Timezone</label>
                                        <select 
                                            name="timezone"
                                            value={formData.timezone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium appearance-none"
                                        >
                                            <option value="EST">EST</option>
                                            <option value="CST">CST</option>
                                            <option value="MST">MST</option>
                                            <option value="PST">PST</option>
                                            <option value="GMT">GMT</option>
                                            <option value="CET">CET</option>
                                            <option value="IST">IST</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Language</label>
                                        <select 
                                            name="language"
                                            value={formData.language}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium appearance-none"
                                        >
                                            <option value="English">English</option>
                                            <option value="Spanish">Spanish</option>
                                            <option value="French">French</option>
                                            <option value="German">German</option>
                                            <option value="Mandarin">Mandarin</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <span className="text-sm font-bold text-gray-700">Client Status</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            name="status"
                                            className="sr-only peer"
                                            checked={formData.status === 'Active'}
                                            onChange={handleInputChange}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        <span className="ml-3 text-xs font-bold text-gray-600 uppercase tracking-wider min-w-[50px]">
                                            {formData.status}
                                        </span>
                                    </label>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
                                    >
                                        Save Client
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Clients;

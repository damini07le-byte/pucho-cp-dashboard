import React, { useState, useEffect } from 'react';
import { fetchStockData } from '../utils/dataService';

const StockPosition = () => {
    const [stockItems, setStockItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchStockData();
            setStockItems(data);
            setLoading(false);
        };
        loadData();
    }, []);

    const categories = ['All', ...new Set(stockItems.map(item => item.category))];

    const filteredItems = stockItems.filter(item => {
        const matchesTab = activeTab === 'All' || item.category === activeTab;
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Inventory Value', value: '₹14.8L', trend: '+2.4%' },
                    { label: 'Total Categories', value: categories.length - 1, trend: 'Stable' },
                    { label: 'Low Stock Items', value: stockItems.filter(i => i.status !== 'In Stock').length, trend: 'Needs Attention' },
                    { label: 'Inbound Today', value: '12', trend: '+5 units' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[32px] border border-black/5 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">{stat.label}</p>
                        <h3 className="text-3xl font-bold text-[#111935]">{stat.value}</h3>
                        <p className={`text-xs mt-2 font-bold ${stat.trend.includes('+') ? 'text-[#5a8052]' : 'text-gray-500'}`}>{stat.trend}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-black/5 shadow-sm">
                <div className="flex flex-col space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold">In-stock Inventory Items</h2>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-1 focus:ring-[#a0d296]"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === cat ? 'bg-black text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto mt-6 -mx-8 px-8">
                        <table className="w-full text-left min-w-[900px]">
                            <thead>
                                <tr className="border-b border-gray-50">
                                    <th className="pb-4 font-bold text-sm text-gray-400 uppercase tracking-wider">Item ID</th>
                                    <th className="pb-4 font-bold text-sm text-gray-400 uppercase tracking-wider">Product Name</th>
                                    <th className="pb-4 font-bold text-sm text-gray-400 uppercase tracking-wider">Category</th>
                                    <th className="pb-4 font-bold text-sm text-gray-400 uppercase tracking-wider">Quantity</th>
                                    <th className="pb-4 font-bold text-sm text-gray-400 uppercase tracking-wider">Value</th>
                                    <th className="pb-4 font-bold text-sm text-gray-400 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 text-sm font-medium">{item.id}</td>
                                        <td className="py-4 text-sm font-bold">{item.name}</td>
                                        <td className="py-4 text-sm text-gray-600">{item.category}</td>
                                        <td className="py-4 text-sm font-bold">{item.quantity}</td>
                                        <td className="py-4 text-sm text-gray-600">{item.value}</td>
                                        <td className="py-4 text-sm">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${item.status === 'In Stock' ? 'bg-[#a0d296]/20 text-[#5a8052]' :
                                                item.status === 'Low Stock' ? 'bg-amber-50 text-amber-600' :
                                                    'bg-red-50 text-red-600'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StockPosition;

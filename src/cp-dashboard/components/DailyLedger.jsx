import React, { useState, useEffect } from 'react';
import { fetchLedgerData } from '../utils/dataService';

const DailyLedger = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newEntry, setNewEntry] = useState({
        party: '',
        account: 'Sales',
        type: 'Credit',
        amount: ''
    });

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchLedgerData();
            setTransactions(data);
            setLoading(false);
        };
        loadData();
    }, []);

    const handleSave = (e) => {
        e.preventDefault();
        const entry = {
            id: `#TRX-${Math.floor(100 + Math.random() * 900)}`,
            date: new Date().toISOString().split('T')[0],
            ...newEntry,
            amount: newEntry.amount.startsWith('₹') ? newEntry.amount : `₹${newEntry.amount}`,
            status: 'Pending'
        };
        setTransactions([entry, ...transactions]);
        setIsModalOpen(false);
        setNewEntry({ party: '', account: 'Sales', type: 'Credit', amount: '' });
    };

    const filteredTransactions = transactions.filter(trx =>
        trx.party?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trx.id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white p-8 rounded-[40px] border border-black/5 shadow-sm space-y-6 relative">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Daily Ledger</h2>
                    <p className="text-sm text-gray-500">Real-time transaction log from Tally</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-1 focus:ring-[#a0d296] w-full md:w-64 font-medium"
                    />
                    <button className="px-6 py-3 rounded-2xl bg-[#a0d296]/10 text-[#5a8052] font-bold text-sm hover:bg-[#a0d296]/20 transition-all">Download PDF</button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-3 rounded-2xl bg-black text-white font-bold text-sm hover:scale-105 transition-all"
                    >
                        New Entry
                    </button>
                </div>
            </div>

            {/* New Entry Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold mb-6">Create New Ledger Entry</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Party Name</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-5 py-3 bg-gray-50 border border-black/5 rounded-2xl text-sm font-bold outline-none focus:border-[#a0d296]"
                                    value={newEntry.party}
                                    onChange={e => setNewEntry({ ...newEntry, party: e.target.value })}
                                    placeholder="e.g. Acme Corp"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Account</label>
                                    <select
                                        className="w-full px-5 py-3 bg-gray-50 border border-black/5 rounded-2xl text-sm font-bold outline-none appearance-none"
                                        value={newEntry.account}
                                        onChange={e => setNewEntry({ ...newEntry, account: e.target.value })}
                                    >
                                        <option>Sales</option>
                                        <option>Purchase</option>
                                        <option>Expense</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Type</label>
                                    <select
                                        className="w-full px-5 py-3 bg-gray-50 border border-black/5 rounded-2xl text-sm font-bold outline-none appearance-none"
                                        value={newEntry.type}
                                        onChange={e => setNewEntry({ ...newEntry, type: e.target.value })}
                                    >
                                        <option>Credit</option>
                                        <option>Debit</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Amount (₹)</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-5 py-3 bg-gray-50 border border-black/5 rounded-2xl text-sm font-bold outline-none focus:border-[#a0d296]"
                                    value={newEntry.amount}
                                    onChange={e => setNewEntry({ ...newEntry, amount: e.target.value })}
                                    placeholder="e.g. 15000"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-3 rounded-2xl bg-gray-100 text-gray-500 font-bold text-sm hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 rounded-2xl bg-black text-white font-bold text-sm hover:opacity-90 transition-all"
                                >
                                    Save Entry
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
            ) : (
                <div className="overflow-x-auto -mx-8 px-8">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="border-b border-gray-50">
                                <th className="pb-4 font-bold text-sm text-gray-400">ID</th>
                                <th className="pb-4 font-bold text-sm text-gray-400">Date</th>
                                <th className="pb-4 font-bold text-sm text-gray-400">Party Name</th>
                                <th className="pb-4 font-bold text-sm text-gray-400">Account</th>
                                <th className="pb-4 font-bold text-sm text-gray-400">Type</th>
                                <th className="pb-4 font-bold text-sm text-gray-400">Amount</th>
                                <th className="pb-4 font-bold text-sm text-gray-400">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredTransactions.map((trx) => (
                                <tr key={trx.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 text-sm font-medium">{trx.id}</td>
                                    <td className="py-4 text-sm text-gray-600">{trx.date}</td>
                                    <td className="py-4 text-sm font-bold">{trx.party}</td>
                                    <td className="py-4 text-sm text-gray-600">{trx.account}</td>
                                    <td className="py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${trx.type === 'Credit' ? 'bg-[#a0d296]/20 text-[#5a8052]' : 'bg-red-50 text-red-600'
                                            }`}>
                                            {trx.type}
                                        </span>
                                    </td>
                                    <td className="py-4 text-sm font-bold">{trx.amount}</td>
                                    <td className="py-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${trx.status === 'Settled' ? 'bg-[#a0d296]' : 'bg-amber-400'}`} />
                                            {trx.status}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DailyLedger;

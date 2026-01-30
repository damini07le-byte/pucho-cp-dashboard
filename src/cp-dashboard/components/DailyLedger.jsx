import React, { useState, useEffect } from 'react';
import { fetchLedgerData } from '../utils/dataService';

const DailyLedger = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchLedgerData();
            setTransactions(data);
            setLoading(false);
        };
        loadData();
    }, []);

    const filteredTransactions = transactions.filter(trx =>
        trx.party.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trx.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white p-8 rounded-[40px] border border-black/5 shadow-sm space-y-6">
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
                    <button className="px-6 py-3 rounded-2xl bg-black text-white font-bold text-sm hover:scale-105 transition-all">New Entry</button>
                </div>
            </div>

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

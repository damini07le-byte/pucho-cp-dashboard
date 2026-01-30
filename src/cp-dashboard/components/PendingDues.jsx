import React, { useState, useEffect } from 'react';
import { fetchDuesData } from '../utils/dataService';

const PendingDues = () => {
    const [dues, setDues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [callingId, setCallingId] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchDuesData();
            setDues(data);
            setLoading(false);
        };
        loadData();
    }, []);

    const handleCall = (id, name, mobile) => {
        setCallingId(id);
        // Simulate a call initiation
        setTimeout(() => {
            alert(`Voice Agent connected to ${name} (${mobile}). Redirecting to monitoring...`);
            setCallingId(null);
        }, 1500);
    };

    return (
        <div className="bg-white p-8 rounded-[40px] border border-black/5 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div>
                <h2 className="text-xl font-bold">Outstanding Payments</h2>
                <p className="text-sm text-gray-500">List of customers for revenue collection calls</p>
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
                                <th className="pb-4 font-bold text-sm text-gray-400 capitalize">Customer</th>
                                <th className="pb-4 font-bold text-sm text-gray-400 capitalize">Amount Due</th>
                                <th className="pb-4 font-bold text-sm text-gray-400 capitalize">Overdue By</th>
                                <th className="pb-4 font-bold text-sm text-gray-400 capitalize">Priority</th>
                                <th className="pb-4 font-bold text-sm text-gray-400 capitalize text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {dues.map((due) => (
                                <tr key={due.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-[#111935]">{due.name}</span>
                                            <span className="text-[11px] text-gray-400 font-medium">{due.id}</span>
                                        </div>
                                    </td>
                                    <td className="py-5 text-sm font-bold text-pucho-purple">{due.amount}</td>
                                    <td className="py-5 text-sm text-gray-600 font-medium">{due.overdue}</td>
                                    <td className="py-5 text-sm">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${due.priority === 'Critical' ? 'bg-red-50 text-red-600' :
                                            due.priority === 'High' ? 'bg-amber-50 text-amber-600' :
                                                'bg-[#a0d296]/20 text-[#5a8052]'
                                            }`}>
                                            {due.priority}
                                        </span>
                                    </td>
                                    <td className="py-5 text-right">
                                        <button
                                            disabled={callingId !== null}
                                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[12px] font-bold transition-all ${callingId === due.id
                                                ? 'bg-amber-400 text-black animate-pulse'
                                                : 'bg-[#111935] text-white hover:scale-105'
                                                }`}
                                            onClick={() => handleCall(due.id, due.name, due.mobile)}
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            {callingId === due.id ? 'Calling...' : 'Call Agent'}
                                        </button>
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

export default PendingDues;

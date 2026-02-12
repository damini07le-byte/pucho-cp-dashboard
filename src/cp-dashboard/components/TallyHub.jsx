import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Phone, Mail, User, Search, RefreshCw,
    Clock, Zap, Users, X, Info, ShieldCheck, Tag
} from 'lucide-react';
import { useSheetData } from '../hooks/useSheetData';

const TALLY_SHEETS = {
    'UPGRADE': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRJn480F_uTcZeXSQBSAh1A1tKpnAjk_9RNS31SdlK4PCfTyL6LFaRbPvCXCzqwh8v-m5DwKxZzGAzF/pub?output=csv&gid=0',
    'OWNER': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRJn480F_uTcZeXSQBSAh1A1tKpnAjk_9RNS31SdlK4PCfTyL6LFaRbPvCXCzqwh8v-m5DwKxZzGAzF/pub?output=csv&gid=113319197',
    'RENEWAL': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRJn480F_uTcZeXSQBSAh1A1tKpnAjk_9RNS31SdlK4PCfTyL6LFaRbPvCXCzqwh8v-m5DwKxZzGAzF/pub?output=csv&gid=307229921'
};

const TallyHub = () => {
    const [activeTab, setActiveTab] = useState('UPGRADE');
    // Silent 10s refresh implemented via hook
    const { data: rawData, loading, lastUpdated, refetch } = useSheetData(10000, TALLY_SHEETS[activeTab]);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const tabs = [
        { id: 'UPGRADE', name: 'Tally Upgrade', icon: <Zap size={18} /> },
        { id: 'OWNER', name: 'Tally Business Owner', icon: <Users size={18} /> },
        { id: 'RENEWAL', name: 'License Renewal', icon: <Clock size={18} /> }
    ];

    const handleAction = async (type, customer) => {
        setActionLoading(`${type}-${customer['Serial Number']}`);
        const webhookUrl = 'https://studio.pucho.ai/api/v1/webhooks/66x93VhoK1DTe9ZlJflZs';

        const payload = {
            action_type: type,
            category: activeTab,
            customer_data: {
                ...customer,
                source: "Tally_Hub",
                triggered_at: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
            }
        };

        try {
            const res = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) alert(`Success: ${type.toUpperCase()} triggered for ${customer['Org Name'] || 'Customer'}`);
            else alert('Failed to trigger action');
        } catch (err) {
            console.error(err);
            alert('Connection Error');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredData = (rawData || []).filter(item => {
        const search = searchTerm.toLowerCase();
        return (
            (item['Org Name'] || '').toLowerCase().includes(search) ||
            (item['Serial Number'] || '').toLowerCase().includes(search) ||
            (item['Mobile'] || '').toLowerCase().includes(search) ||
            (item['Contact Person'] || '').toLowerCase().includes(search)
        );
    });

    const parseLogs = (logString) => {
        if (!logString) return [];
        return logString.split('---').map(log => {
            const lines = log.trim().split('\n');
            const timestamp = lines[0] || '';
            const isManualCall = log.includes('[MANUAL CALL]');

            let status = 'DELIVERED';
            if (log.includes('Status: FAILED')) status = 'FAILED';
            if (log.includes('Status: SUCCESS')) status = 'SUCCESS';

            return {
                timestamp,
                type: isManualCall ? 'CALL' : 'ACTION',
                status,
                content: log
            };
        }).filter(l => l.timestamp).reverse();
    };

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex flex-wrap items-center gap-2 bg-white/50 p-1.5 rounded-[24px] border border-black/5 w-fit shadow-sm">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-[20px] text-[13px] font-black transition-all ${activeTab === tab.id
                            ? 'bg-[#1e293b] text-white shadow-lg'
                            : 'text-[#1e293b]/60 hover:bg-white hover:text-[#1e293b]'
                            }`}
                    >
                        {tab.icon}
                        {tab.name}
                    </button>
                ))}
            </div>

            {/* Header & Search */}
            <div className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black text-[#1e293b] uppercase tracking-tight">
                        {tabs.find(t => t.id === activeTab).name} Hub
                    </h2>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                        Live Sheet Data Management
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Sync</p>
                        <p className="text-[13px] font-black text-[#1e293b]">
                            {lastUpdated ? lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search by name, ID or mobile..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-gray-50 border border-black/5 rounded-2xl text-[13px] font-bold outline-none w-[260px] focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <button onClick={refetch} className="p-2.5 bg-white border border-black/5 rounded-2xl hover:bg-gray-50 transition-all">
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredData.map((customer, idx) => (
                        <motion.div
                            key={customer['Serial Number'] || idx}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-[32px] border border-black/5 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col group"
                        >
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-inner">
                                            <User size={24} />
                                        </div>
                                        <div className="max-w-[140px]">
                                            <h3 className="font-black text-[#1e293b] text-[14px] leading-tight truncate">
                                                {customer['Org Name'] || 'Unknown'}
                                            </h3>
                                            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-0.5 truncate">
                                                ID: {customer['Serial Number'] || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="px-2.5 py-1 bg-gray-50 rounded-full border border-black/5 text-[9px] font-black text-gray-500 uppercase">
                                        {customer['Product'] || 'PENDING'}
                                    </span>
                                </div>

                                <div className="space-y-2.5 mb-6 text-[12px] font-bold text-gray-600 bg-gray-50/50 p-3 rounded-2xl border border-black/5">
                                    <div className="flex items-center gap-3">
                                        <Users size={14} className="text-gray-400" />
                                        <span className="truncate">{customer['Contact Person'] || 'No Contact'}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone size={14} className="text-gray-400" />
                                        <span>{customer['Mobile'] || 'No Phone'}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Mail size={14} className="text-gray-400" />
                                        <span className="truncate">{customer['Email ID'] || 'No Email'}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Tag size={14} className="text-gray-400" />
                                        <span className="truncate text-blue-600">{customer['Release'] || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAction('call', customer)}
                                        disabled={actionLoading}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition-all font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-200"
                                    >
                                        <Phone size={16} fill="white" /> CALL AI AGENT
                                    </button>
                                </div>

                                <button
                                    onClick={() => setSelectedCustomer(customer)}
                                    className="w-full mt-3 py-2.5 rounded-2xl bg-white border border-black/5 text-gray-400 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 hover:text-[#1e293b] transition-all"
                                >
                                    <Info size={14} /> View History & Details
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Details Modal */}
            <AnimatePresence>
                {selectedCustomer && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedCustomer(null)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden">
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-xl font-black text-[#1e293b]">{selectedCustomer['Org Name']}</h3>
                                        <p className="text-xs font-bold text-gray-400 mt-1">Expiry: {selectedCustomer['TSS Expiry Date'] || 'N/A'}</p>
                                    </div>
                                    <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
                                </div>

                                <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                                    {(parseLogs(selectedCustomer['Manual Actions Log'] || selectedCustomer['Log History'])).length > 0 ? (
                                        parseLogs(selectedCustomer['Manual Actions Log'] || selectedCustomer['Log History']).map((log, i) => (
                                            <div key={i} className="p-4 rounded-3xl bg-gray-50 border border-black/5">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
                                                            <Phone size={14} />
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-widest">AI CALL LOG</span>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${log.status === 'SUCCESS' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                        {log.status}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-bold mb-2">{log.timestamp}</p>
                                                <div className="text-[12px] text-gray-600 font-medium whitespace-pre-wrap leading-relaxed">
                                                    {log.content.split('\n').slice(2).join('\n')}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-20 text-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200"><Clock className="text-gray-300" /></div>
                                            <p className="text-sm font-bold text-gray-400">No activity recorded for this company.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="p-6 bg-gray-50 border-t border-black/5 flex justify-end">
                                <button onClick={() => setSelectedCustomer(null)} className="px-6 py-2.5 rounded-2xl bg-[#1e293b] text-white text-[12px] font-black uppercase shadow-lg shadow-slate-200">Close Hub</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TallyHub;

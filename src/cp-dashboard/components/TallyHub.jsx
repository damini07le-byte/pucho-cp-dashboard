import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Phone, Mail, User, Search, RefreshCw,
    Clock, Zap, Users, X, Info, ShieldCheck, Tag, Calendar, PhoneCall
} from 'lucide-react';
import { useSheetData } from '../hooks/useSheetData';

// Using the Master Sheet URL as requested by user
const MASTER_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRJn480F_uTcZeXSQBSAh1A1tKpnAjk_9RNS31SdlK4PCfTyL6LFaRbPvCXCzqwh8v-m5DwKxZzGAzF/pub?gid=1744069029&single=true&output=csv';

const TallyHub = () => {
    const [activeTab, setActiveTab] = useState('UPGRADE');
    const { data: rawData, loading, lastUpdated, refetch } = useSheetData(10000, MASTER_SHEET_URL);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const tabs = [
        { id: 'UPGRADE', name: 'Tally Upgrade', icon: <Zap size={18} /> },
        { id: 'OWNER', name: 'Tally Business Owner', icon: <Users size={18} /> },
        { id: 'RENEWAL', name: 'License Renewal', icon: <Clock size={18} /> }
    ];

    // Restore "proper" dynamic aging calculation
    const getAging = (dateStr, sheetAging) => {
        if (sheetAging && sheetAging !== 'N/A' && sheetAging !== '#REF!') return sheetAging;
        if (!dateStr || dateStr === 'N/A') return 'N/A';
        try {
            let due;
            if (dateStr.includes('-')) {
                const parts = dateStr.split('-');
                if (parts[0].length === 4) due = new Date(parts[0], parts[1] - 1, parts[2]);
                else due = new Date(parts[2], parts[1] - 1, parts[0]);
            } else due = new Date(dateStr);

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const diff = Math.round((due - today) / 86400000);

            if (diff === 0) return "Due Today";
            if (diff < 0) return `${Math.abs(diff)} Days Past`;
            return `${diff} Days Left`;
        } catch (e) {
            return dateStr;
        }
    };

    const handleAction = async (type, customer) => {
        const id = customer['Serial Number'] || customer['Row ID'] || 'N/A';
        setActionLoading(`${type}-${id}`);
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
            if (res.ok) alert(`Success: Manual call triggered for ${customer._displayName}`);
            else alert('Failed to trigger action');
        } catch (err) {
            console.error(err);
            alert('Connection Error');
        } finally {
            setActionLoading(null);
        }
    };

    const transformedData = useMemo(() => {
        return (rawData || []).map(row => {
            const name = row['Org Name'] || row['Customer Name'] || 'Unknown';
            const id = row['Serial Number'] || row['Customer ID'] || 'N/A';
            const email = row['Email ID'] || row['Email'] || 'N/A';
            const date = row['TSS Expiry Date'] || row['Due Date'] || 'N/A';
            const sheetAging = row['Day Due'];

            // Map calling logs based on active tab
            let callingLog = '';
            if (activeTab === 'UPGRADE') callingLog = row['U-CALL'];
            else if (activeTab === 'OWNER') callingLog = row['O-CALL'];
            else if (activeTab === 'RENEWAL') callingLog = row['L-CALL'];

            return {
                ...row,
                _displayName: name,
                _displayId: id,
                _displayEmail: email,
                _displayDate: date,
                _aging: getAging(date, sheetAging),
                _callingLog: callingLog
            };
        });
    }, [rawData, activeTab]);

    const filteredData = transformedData.filter(item => {
        const search = searchTerm.toLowerCase();
        return (
            (item._displayName || '').toLowerCase().includes(search) ||
            (item._displayId || '').toLowerCase().includes(search) ||
            (item['Mobile'] || '').toLowerCase().includes(search) ||
            (item['Contact Person'] || '').toLowerCase().includes(search)
        );
    });

    const parseLogs = (logString) => {
        if (!logString || logString === 'N/A' || logString === 'Pending' || logString === '#REF!') return [];

        const logs = logString.split('---').filter(l => l.trim());
        if (logs.length === 0 && logString.trim()) logs.push(logString.trim());

        return logs.map(log => {
            const trimmedLog = log.trim();
            const lines = trimmedLog.split('\n');
            const timestamp = lines[0] || 'Activity Log';
            const isManualCall = trimmedLog.includes('[MANUAL CALL]');

            let status = 'DELIVERED';
            if (trimmedLog.toLowerCase().includes('status: failed')) status = 'FAILED';
            if (trimmedLog.toLowerCase().includes('status: success')) status = 'SUCCESS';

            return {
                timestamp,
                type: isManualCall ? 'CALL' : 'ACTION',
                status,
                content: trimmedLog
            };
        }).filter(l => l.content).reverse();
    };

    return (
        <div className="space-y-6">
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

            <div className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black text-[#1e293b] uppercase tracking-tight">
                        {tabs.find(t => t.id === activeTab).name} Hub
                    </h2>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1 text-blue-600">
                        {activeTab} MODE ACTIVE
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
                                placeholder="Search customers..."
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredData.length > 0 ? (
                        filteredData.map((customer) => (
                            <motion.div
                                key={customer.sheet_row_number}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white rounded-[32px] border border-black/5 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col group cursor-pointer"
                                onClick={() => setSelectedCustomer(customer)}
                            >
                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-inner">
                                                <User size={24} />
                                            </div>
                                            <div className="max-w-[140px]">
                                                <h3 className="font-black text-[#1e293b] text-[14px] leading-tight truncate">
                                                    {customer._displayName}
                                                </h3>
                                                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-0.5 truncate">
                                                    ID: {customer._displayId}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="px-2.5 py-1 bg-gray-50 rounded-full border border-black/5 text-[9px] font-black text-gray-500 uppercase">
                                                {customer['Product'] || 'N/A'}
                                            </span>
                                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${customer._aging.toLowerCase().includes('past') || customer._aging.toLowerCase().includes('due') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                                {customer._aging}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2.5 mb-6 text-[12px] font-bold text-gray-600 bg-gray-50/50 p-3 rounded-2xl border border-black/5">
                                        <div className="flex items-center gap-3">
                                            <Users size={14} className="text-gray-400" />
                                            <span className="truncate">{customer['Contact Person'] || 'Support Contact'}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone size={14} className="text-gray-400" />
                                            <span>{customer['Mobile'] || 'No Phone'}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Mail size={14} className="text-gray-400" />
                                            <span className="truncate">{customer._displayEmail}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={() => handleAction('call', customer)}
                                            disabled={actionLoading}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 transition-all font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50"
                                        >
                                            <PhoneCall size={16} fill="white" /> CALL AI AGENT
                                        </button>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between px-1">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            Actions Log: {parseLogs(customer._callingLog).length}
                                        </p>
                                        <div className="flex items-center gap-1">
                                            <span className="text-[9px] font-black text-blue-500 uppercase">View History</span>
                                            <Info size={12} className="text-blue-500" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-lg font-black text-[#1e293b] uppercase">No Data in Hub</h3>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {selectedCustomer && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedCustomer(null)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden">
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-xl font-black text-[#1e293b] truncate max-w-[300px]">{selectedCustomer._displayName}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{selectedCustomer._displayId}</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{activeTab} History</span>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
                                </div>

                                <div className="max-h-[450px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                                    {parseLogs(selectedCustomer._callingLog).length > 0 ? (
                                        parseLogs(selectedCustomer._callingLog).map((log, i) => (
                                            <div key={i} className="p-5 rounded-3xl bg-gray-50 border border-black/5 shadow-sm">
                                                <div className="flex items-center justify-between mb-3 pb-3 border-b border-black/[0.03]">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 rounded-lg bg-red-100 text-red-600">
                                                            <Phone size={14} />
                                                        </div>
                                                        <span className="text-[11px] font-black uppercase tracking-tight text-[#1e293b]">{activeTab} Activity</span>
                                                    </div>
                                                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${log.status === 'SUCCESS' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                        {log.status}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-bold mb-3">{log.timestamp}</p>
                                                <div className="text-[12px] text-gray-600 font-medium whitespace-pre-wrap leading-relaxed bg-white p-4 rounded-2xl border border-black/[0.02]">
                                                    {log.content.includes('\n') ? log.content.split('\n').slice(1).join('\n').trim() : log.content}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-20 text-center">
                                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                                                <PhoneCall className="text-gray-300" size={32} />
                                            </div>
                                            <h4 className="text-sm font-black text-[#1e293b] uppercase">No Activity Recorded</h4>
                                            <p className="text-[11px] font-bold text-gray-400 mt-2 px-10">We check the following sheet columns for data: U-CALL, O-CALL, or L-CALL depending on the active hub tab.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 bg-gray-100/50 border-t border-black/5 space-y-3">
                                <button
                                    onClick={() => handleAction('call', selectedCustomer)}
                                    disabled={actionLoading}
                                    className="w-full py-4 rounded-2xl bg-[#1e293b] text-white text-[12px] font-black uppercase shadow-lg flex items-center justify-center gap-3 hover:bg-black transition-all"
                                >
                                    <PhoneCall size={18} fill="white" /> Trigger Manual Action
                                </button>
                                <button onClick={() => setSelectedCustomer(null)} className="w-full py-3 text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2 hover:text-[#1e293b] transition-colors">
                                    Close details <X size={14} />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TallyHub;

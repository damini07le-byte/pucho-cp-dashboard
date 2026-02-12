import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Phone, Mail, User, Search, RefreshCw,
    Clock, Zap, Users, X, Info, ShieldCheck, Tag, Calendar, PhoneCall, ArrowUpRight, Activity
} from 'lucide-react';
import { useSheetData } from '../hooks/useSheetData';

// User requested URL for the Tally Hub tabs
const MASTER_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRJn480F_uTcZeXSQBSAh1A1tKpnAjk_9RNS31SdlK4PCfTyL6LFaRbPvCXCzqwh8v-m5DwKxZzGAzF/pub?gid=1744069029&single=true&output=csv';

const TallyHub = () => {
    const [activeTab, setActiveTab] = useState('UPGRADE');
    const { data: rawData, loading, lastUpdated, refetch } = useSheetData(10000, MASTER_SHEET_URL);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const tabs = [
        { id: 'UPGRADE', name: 'Tally Upgrade', icon: <Zap size={18} />, key_prefix: 'U' },
        { id: 'OWNER', name: 'Business Owner', icon: <Users size={18} />, key_prefix: 'O' },
        { id: 'RENEWAL', name: 'License Renewal', icon: <Clock size={18} />, key_prefix: 'L' }
    ];

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

            // Flexible header detection for U.CALL, U-CALL, etc.
            const p = tabs.find(t => t.id === activeTab).key_prefix;
            const callingLog = row[`${p}.CALL`] || row[`${p}-CALL`] || '';
            const whatsappLog = row[`${p}-WA`] || row[`${p}.WA`] || '';
            const emailLog = row[`${p}-EMAIL`] || row[`${p}.EMAIL`] || '';

            return {
                ...row,
                _displayName: name,
                _displayId: id,
                _displayEmail: email,
                _displayDate: date,
                _aging: getAging(date, sheetAging),
                _callingLog: callingLog,
                _whatsappLog: whatsappLog,
                _emailLog: emailLog,
                _hasActivity: callingLog.trim() !== '' || whatsappLog.trim() !== '' || emailLog.trim() !== ''
            };
        });
    }, [rawData, activeTab]);

    const filteredData = useMemo(() => {
        return transformedData.filter(item => {
            const search = searchTerm.toLowerCase();
            const matchesSearch = (
                (item._displayName || '').toLowerCase().includes(search) ||
                (item._displayId || '').toLowerCase().includes(search) ||
                (item['Mobile'] || '').toLowerCase().includes(search)
            );
            return matchesSearch;
        });
    }, [transformedData, searchTerm]);

    const parseLogs = (logString) => {
        if (!logString || logString === 'N/A' || logString === 'Pending' || logString === '#REF!') return [];

        // Multi-separator check: --- or detecting Date pattern
        const logs = logString.split('---').filter(l => l.trim());
        if (logs.length === 0 && logString.trim()) logs.push(logString.trim());

        return logs.map(log => {
            const trimmedLog = log.trim();
            const lines = trimmedLog.split('\n');
            const timestamp = lines[0] || 'Activity Log';

            let status = 'DELIVERED';
            if (trimmedLog.toLowerCase().includes('status: failed')) status = 'FAILED';
            if (trimmedLog.toLowerCase().includes('status: success')) status = 'SUCCESS';
            if (trimmedLog.toLowerCase().includes('status: busy')) status = 'BUSY';

            return {
                timestamp,
                status,
                content: trimmedLog
            };
        }).filter(l => l.content).reverse();
    };

    return (
        <div className="space-y-6">
            {/* Tabs Header */}
            <div className="flex flex-wrap items-center gap-2 bg-white/50 p-1.5 rounded-[24px] border border-black/5 w-fit shadow-sm">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-[20px] text-[13px] font-black transition-all ${activeTab === tab.id
                            ? 'bg-[#1e293b] text-white shadow-lg scale-105'
                            : 'text-[#1e293b]/60 hover:bg-white hover:text-[#1e293b]'
                            }`}
                    >
                        {tab.icon}
                        {tab.name}
                    </button>
                ))}
            </div>

            {/* Hub Banner */}
            <div className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black text-[#1e293b] uppercase tracking-tight flex items-center gap-2">
                        {tabs.find(t => t.id === activeTab).icon}
                        {tabs.find(t => t.id === activeTab).name} Hub
                    </h2>
                    <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mt-1">
                        Monitoring {activeTab} Activity Stream
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Live Sync</p>
                        <p className="text-[13px] font-black text-[#1e293b]">
                            {lastUpdated ? lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) : '--:--'}
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
                                className="pl-10 pr-4 py-2.5 bg-gray-50 border border-black/5 rounded-2xl text-[13px] font-bold outline-none w-[280px] focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                            />
                        </div>
                        <button onClick={refetch} className="p-2.5 bg-white border border-black/5 rounded-2xl hover:bg-gray-50 transition-all active:scale-95">
                            <RefreshCw size={18} className={loading ? 'animate-spin text-blue-500' : 'text-[#1e293b]'} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Customer Grid */}
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
                                className="bg-white rounded-[32px] border border-black/5 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col group cursor-pointer relative"
                                onClick={() => setSelectedCustomer(customer)}
                            >


                                <div className="p-6 flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                <User size={24} />
                                            </div>
                                            <div className="max-w-[140px]">
                                                <h3 className="font-black text-[#1e293b] text-[14px] leading-tight truncate uppercase">
                                                    {customer._displayName}
                                                </h3>
                                                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-0.5 truncate">
                                                    SN: {customer._displayId}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 pt-1">
                                            <span className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded-lg text-[8px] font-black border border-black/5 uppercase">
                                                {customer['Product'] || 'TE9 Silver'}
                                            </span>
                                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border ${customer._aging.toLowerCase().includes('past')
                                                ? 'bg-red-50 text-red-600 border-red-100'
                                                : 'bg-green-50 text-green-600 border-green-100'
                                                }`}>
                                                {customer._aging}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 mb-6">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-black/5 hover:bg-white transition-colors">
                                            <Users size={14} className="text-blue-400" />
                                            <span className="text-[12px] font-bold text-gray-600 truncate">{customer['Contact Person'] || 'Business Owner'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-black/5 hover:bg-white transition-colors">
                                            <Phone size={14} className="text-green-400" />
                                            <span className="text-[12px] font-black text-gray-800">{customer['Mobile'] || 'No Phone'}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={() => handleAction('call', customer)}
                                            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2.5xl bg-[#1e293b] text-white hover:bg-black transition-all font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-100 active:scale-95"
                                        >
                                            <PhoneCall size={16} fill="white" /> {actionLoading === `call-${customer._displayId}` ? 'INITIALIZING...' : `CALL ${activeTab}`}
                                        </button>
                                    </div>

                                    <div className="mt-5 flex items-center justify-between px-1">
                                        <div className="flex items-center gap-1.5">
                                            <Activity size={12} className="text-blue-500" />
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                LOGGED ENTRIES: {parseLogs(customer._callingLog).length}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 group/link">
                                            <span className="text-[9px] font-black text-blue-500 uppercase group-hover/link:underline">History</span>
                                            <ArrowUpRight size={12} className="text-blue-500" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-24 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search size={32} className="text-gray-200" />
                            </div>
                            <h3 className="text-xl font-black text-[#1e293b] uppercase">No Customers Found</h3>
                            <p className="text-[12px] font-bold text-gray-400 mt-2">Try searching with a different term or sync the sheet.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedCustomer && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedCustomer(null)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden">
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h3 className="text-2xl font-black text-[#1e293b] uppercase tracking-tight leading-none mb-2">{selectedCustomer._displayName}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-black border border-blue-100 uppercase tracking-tighter">SN: {selectedCustomer._displayId}</span>
                                            <span className="text-gray-300">•</span>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{activeTab} STREAM</span>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedCustomer(null)} className="p-3 hover:bg-gray-100 rounded-2xl transition-all group scale-110 active:scale-90">
                                        <X size={20} className="text-[#1e293b] group-hover:rotate-90 transition-transform" />
                                    </button>
                                </div>

                                <div className="max-h-[480px] overflow-y-auto pr-2 space-y-4 custom-scrollbar px-1">
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="bg-gray-50 p-4 rounded-3xl border border-black/5">
                                            <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Expiry Status</p>
                                            <p className="text-[13px] font-black text-[#1e293b]">{selectedCustomer._displayDate}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-3xl border border-black/5">
                                            <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Total Logs</p>
                                            <p className="text-[13px] font-black text-[#1e293b]">{parseLogs(selectedCustomer._callingLog).length} History Items</p>
                                        </div>
                                    </div>

                                    {parseLogs(selectedCustomer._callingLog).length > 0 ? (
                                        parseLogs(selectedCustomer._callingLog).map((log, i) => (
                                            <div key={i} className="p-6 rounded-[32px] bg-white border border-black/5 shadow-sm relative overflow-hidden group">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-xl border ${log.status === 'SUCCESS' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                                            <Activity size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-[#1e293b] uppercase leading-none">Category: {activeTab}</p>
                                                            <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">{log.timestamp}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${log.status === 'SUCCESS' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                        {log.status}
                                                    </span>
                                                </div>
                                                <div className="text-[11.5px] text-gray-600 font-bold whitespace-pre-wrap leading-relaxed bg-gray-50 p-5 rounded-2.5xl border border-black/5 font-mono">
                                                    {log.content.includes('\n') ? log.content.split('\n').slice(1).join('\n').trim() : log.content}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-20 text-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-100">
                                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                <Activity className="text-gray-200" size={32} />
                                            </div>
                                            <h4 className="text-sm font-black text-[#1e293b] uppercase">No History Recorded</h4>
                                            <p className="text-[10px] font-bold text-gray-400 mt-2 px-14 leading-relaxed uppercase">
                                                System is waiting to log {activeTab} outcomes for this customer.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-8 bg-gray-50/80 border-t border-black/5 backdrop-blur-sm">
                                <button
                                    onClick={() => handleAction('call', selectedCustomer)}
                                    disabled={actionLoading}
                                    className="w-full py-4.5 rounded-[24px] bg-[#1e293b] text-white text-[13px] font-black uppercase tracking-widest shadow-[0_10px_30px_-10px_rgba(30,41,59,0.5)] flex items-center justify-center gap-4 hover:bg-black transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <PhoneCall size={20} fill="white" className={actionLoading ? 'animate-bounce' : ''} />
                                    {actionLoading ? 'Connecting...' : `INITIATE ${activeTab} CALL`}
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

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Phone, MessageSquare, Mail, User, Search, RefreshCw,
    ArrowUpRight, Clock, ShieldCheck, Zap, BarChart3, Users
} from 'lucide-react';
import { useSheetData } from '../hooks/useSheetData';

const TALLY_SHEETS = {
    'UPGRADE': 'https://docs.google.com/spreadsheets/d/1pY9WtCSu6_A3YsZ31MgcbWj3Q2Ea8AO33Ztr8MVedAg/export?format=csv&gid=0',
    'OWNER': 'https://docs.google.com/spreadsheets/d/1pY9WtCSu6_A3YsZ31MgcbWj3Q2Ea8AO33Ztr8MVedAg/export?format=csv&gid=113319197',
    'RENEWAL': 'https://docs.google.com/spreadsheets/d/1pY9WtCSu6_A3YsZ31MgcbWj3Q2Ea8AO33Ztr8MVedAg/export?format=csv&gid=307229921'
};

const TallyHub = () => {
    const [activeTab, setActiveTab] = useState('UPGRADE');
    const { data: rawData, loading, error, lastUpdated, refetch } = useSheetData(10000, TALLY_SHEETS[activeTab]);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    const tabs = [
        { id: 'UPGRADE', name: 'Tally Upgrade', icon: <Zap size={18} /> },
        { id: 'OWNER', name: 'Tally Business Owner', icon: <Users size={18} /> },
        { id: 'RENEWAL', name: 'License Renewal', icon: <Clock size={18} /> }
    ];

    const handleAction = async (type, customer) => {
        setActionLoading(`${type}-${customer['Customer ID']}`);
        // Unified Webhook for all Tally Hub actions
        const webhookUrl = 'https://studio.pucho.ai/api/v1/webhooks/66x93VhoK1DTe9ZlJflZs';

        const payload = {
            action_type: type,        // 'call', 'whatsapp', or 'email'
            category: activeTab,      // 'UPGRADE', 'OWNER', or 'RENEWAL'
            customer_data: {
                ...customer,          // Sending complete sheet data
                source: "Tally_Hub",
                triggered_at: new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' })
            }
        };

        try {
            const res = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) alert(`Success: ${type.toUpperCase()} triggered for ${customer['Customer Name'] || customer['name']}`);
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
            (item['Customer Name'] || '').toLowerCase().includes(search) ||
            (item['Customer ID'] || '').toLowerCase().includes(search) ||
            (item['Mobile'] || '').toLowerCase().includes(search)
        );
    });

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
                        Management & Outreach Control
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
                                placeholder="Search customer..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2.5 bg-gray-50 border border-black/5 rounded-2xl text-[13px] font-bold outline-none focus:ring-2 focus:ring-blue-500/20 w-[240px] transition-all"
                            />
                        </div>
                        <button
                            onClick={refetch}
                            className="p-2.5 bg-white border border-black/5 rounded-2xl hover:bg-gray-50 transition-all text-[#1e293b]"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Cards Grid */}
            {loading && !rawData.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-[240px] bg-white rounded-[32px] animate-pulse border border-black/5" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredData.map((customer, idx) => (
                            <motion.div
                                key={customer['Customer ID'] || idx}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white rounded-[32px] border border-black/5 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 group overflow-hidden"
                            >
                                <div className="p-6 space-y-4">
                                    {/* Card Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-inner">
                                                <User size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-[#1e293b] text-[15px] leading-tight limit-1">
                                                    {customer['Customer Name'] || 'Unknown Entity'}
                                                </h3>
                                                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">
                                                    ID: {customer['Customer ID'] || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="px-2.5 py-1 bg-gray-50 rounded-full border border-black/5 text-[9px] font-black text-gray-500 uppercase">
                                            {customer['Status'] || 'Pending'}
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="space-y-2 py-2">
                                        <div className="flex items-center gap-3 text-[12px] font-bold text-gray-600">
                                            <Phone size={14} className="text-gray-400" />
                                            <span>{customer['Mobile'] || 'No Phone'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[12px] font-bold text-gray-600">
                                            <Mail size={14} className="text-gray-400" />
                                            <span className="truncate">{customer['Email'] || 'No Email'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[12px] font-bold text-gray-600">
                                            <Clock size={14} className="text-gray-400" />
                                            <span>{customer['Ageing'] || customer['Due Date'] || 'Recent'} Days</span>
                                        </div>
                                    </div>

                                    {/* Card Actions */}
                                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-50">
                                        <button
                                            onClick={() => handleAction('call', customer)}
                                            disabled={actionLoading}
                                            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all group/btn"
                                        >
                                            <Phone size={16} fill={actionLoading === `call-${customer['Customer ID']}` ? "currentColor" : "none"} />
                                            <span className="text-[9px] font-black uppercase">Call AI</span>
                                        </button>
                                        <button
                                            onClick={() => handleAction('whatsapp', customer)}
                                            disabled={actionLoading}
                                            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-all group/btn"
                                        >
                                            <MessageSquare size={16} fill={actionLoading === `whatsapp-${customer['Customer ID']}` ? "currentColor" : "none"} />
                                            <span className="text-[9px] font-black uppercase">WhatsApp</span>
                                        </button>
                                        <button
                                            onClick={() => handleAction('email', customer)}
                                            disabled={actionLoading}
                                            className="flex flex-col items-center gap-1.5 p-2 rounded-2xl bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition-all group/btn"
                                        >
                                            <Mail size={16} fill={actionLoading === `email-${customer['Customer ID']}` ? "currentColor" : "none"} />
                                            <span className="text-[9px] font-black uppercase">Email</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default TallyHub;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, X, MessageSquare, RefreshCw, History,
    ArrowUpRight, CheckCircle2, Clock, Mail,
    PhoneCall, AlertCircle, Calendar, ShieldCheck
} from 'lucide-react';
import { useSheetData } from '../hooks/useSheetData';

const PendingDues = () => {
    const { data, loading, error, lastUpdated, refetch } = useSheetData(10000); // Fast 10s auto-refresh
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [manualLoading, setManualLoading] = useState(null); // 'call', 'whatsapp', 'email'

    const handleManualAction = async (actionType, customer) => {
        setManualLoading(actionType);
        const webhookUrl = 'https://studio.pucho.ai/api/v1/webhooks/w5Ny98y5m9L0gYk0wvbXz';

        // Get the absolute latest data from the sheet sync state
        const latestInfo = data.find(row => row['Customer ID'] === customer['Customer ID']) || customer;

        // Function to calculate overdue status dynamically
        const getOverdueStatus = (dateStr) => {
            if (!dateStr || dateStr === 'N/A') return 'N/A';
            try {
                const [d, m, y] = dateStr.split('-').map(Number);
                const due = new Date(y, m - 1, d);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const diff = Math.round((due - today) / 86400000);

                if (diff === 0) return "Due Today";
                if (diff < 0) return `${Math.abs(diff)} Days Overdue`;
                return `${diff} Days Remaining`;
            } catch (e) {
                return dateStr;
            }
        };

        const payload = {
            action_type: actionType,
            customer_data: {
                id: latestInfo['Customer ID'],
                row_number: data.findIndex(row => row['Customer ID'] === latestInfo['Customer ID']) + 2, // Excel/Sheet index
                name: latestInfo['Customer Name'],
                amount: latestInfo['Amount'],
                due_date: latestInfo['Due Date'], // Raw date from sheet
                overdue: getOverdueStatus(latestInfo['Due Date']),
                mobile: latestInfo['Mobile'],
                email: latestInfo['Email'],
                priority: latestInfo['Priority'] || 'High',
                // Detailed data from latest sync
                emailOutcome: latestInfo['T-10 Mail'] || 'N/A',
                whatsappOutcome: latestInfo['T-15 WA'] || 'N/A',
                callOutcome: latestInfo['Overdue AI Call'] || 'N/A',
                followUp: `Manual ${actionType} triggered from Hub Dashboard`,
                actionType: actionType,
                triggeredAt: new Date().toISOString()
            },
            source: "CP_Dashboard",
            triggered_at: new Date().toISOString()
        };

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert(`SUCCESS! Manual ${actionType.toUpperCase()} triggered for ${latestInfo['Customer Name']}.`);
            } else {
                alert(`Error: Hub was unable to trigger ${actionType}.`);
            }
        } catch (err) {
            console.error('Webhook Error:', err);
            alert('Connection Error: Unable to reach recovery server.');
        } finally {
            setManualLoading(null);
        }
    };

    const parseLog = (logString) => {
        if (!logString || logString === 'NA' || logString === 'Pending' || logString.includes('#REF!')) return null;

        // Smart Extraction Logic
        if (logString.toUpperCase().includes('[WHATSAPP') || logString.toUpperCase().includes('[EMAIL')) {
            const lines = logString.split('\n');
            const timestamp = lines[0]?.trim();

            const extractSection = (marker) => {
                const markerRegex = new RegExp(`\\[${marker}(?: MESSAGE)?\\]([\\s\\S]*?)(?=\\[|$)`, 'i');
                const match = logString.match(markerRegex);
                return match ? match[1].trim() : '';
            };

            const getField = (text, field) => {
                const reg = new RegExp(`${field}:\\s*([\\s\\S]*?)(?=\\n(?:STATUS|SUBJECT|MESSAGE|BODY|ACTION):|$)`, 'i');
                const match = text?.match(reg);
                return match ? match[1].trim() : null;
            };

            const waText = extractSection('WHATSAPP');
            const emText = extractSection('EMAIL');

            return {
                timestamp,
                isCombo: true,
                wa: {
                    status: getField(waText, 'Status') || 'Delivered',
                    message: getField(waText, 'Message') || waText.replace(/Status:.*?\n/i, '').trim()
                },
                em: {
                    status: getField(emText, 'Status') || 'Sent',
                    subject: getField(emText, 'Subject') || 'No Subject',
                    body: getField(emText, 'Body') || getField(emText, 'Body Preview') || emText.replace(/Status:.*?\n|Subject:.*?\n/ig, '').trim()
                }
            };
        }

        const dateMatch = logString.match(/(\d{2}\/\d{2}\/\d{4},\s\d{2}:\d{2}\s[ap]m)/i) || logString.match(/(\d{2}-\d{2}-\d{4}\s\d{2}:\d{2})/);
        const timestamp = dateMatch ? dateMatch[0] : 'Time Pending';
        const content = logString.replace(timestamp, '').replace('|', '').trim();

        // Extract internal status if present (e.g., "| Status: SUCCESS |")
        const statusMatch = logString.match(/Status:\s*(SUCCESS|FAILED)/i);
        const status = statusMatch ? statusMatch[1].toUpperCase() : null;

        return {
            timestamp: timestamp,
            status: status,
            content: content || 'Status Updated'
        };
    };

    // Transform sheet data
    const transformedCustomers = data.map((row) => {
        // Clean data if it contains #ERROR!
        const rawMobile = row['Mobile'] || '';
        const cleanMobile = rawMobile.includes('#ERROR!') ? 'Invalid Number' : rawMobile;

        const rawEmail = row['Email'] || '';
        const cleanEmail = rawEmail.includes('#ERROR!') ? 'Invalid Email' : rawEmail;

        return {
            ...row,
            'Customer Name': row['Customer Name'] || 'Unknown Customer',
            'Customer ID': row['Customer ID'] || 'N/A',
            'Mobile': cleanMobile,
            'Email': cleanEmail,
            'Product': (row['Product'] || 'N/A').toUpperCase(),
            'Amount': row['Amount']?.toString() || '₹0',
            'Due Date': row['Due Date'] || 'N/A',
            'Payment Status': row['Payment Status'] || 'Unpaid',
            logs: {
                t15: parseLog(row['T-15 WA']),
                t10: parseLog(row['T-10 Mail']),
                t5: parseLog(row['T-5 Combo']),
                t0: parseLog(row['T-0 Urgent']),
                call: parseLog(row['Overdue AI Call']),
                // Manual intervention logs
                manual: {
                    call: parseLog(row['Manual Call']),
                    wa: parseLog(row['Manual WA']),
                    email: parseLog(row['Manual Email'])
                }
            }
        };
    }).filter(customer => customer['Payment Status'] !== 'Paid');

    if (loading && !data.length) {
        return (
            <div className="bg-white p-6 rounded-[32px] min-h-[500px] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#1e293b] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Entering Hub...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-[32px] space-y-6">
            {/* Header - Compact */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#1e293b] text-white flex items-center justify-center shadow-md">
                        <History size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-[#1e293b] tracking-tight uppercase">Recovery Hub</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Active</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Sync</p>
                        <p className="text-[13px] font-black text-[#1e293b]">
                            {lastUpdated ? lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--'}
                        </p>
                    </div>
                    <button onClick={refetch} className="p-2 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all shadow-sm">
                        <RefreshCw size={16} className={`${loading ? 'animate-spin' : ''} text-[#1e293b]`} />
                    </button>
                </div>
            </div>

            {/* Customer Cards - Compact */}
            <div className="space-y-4">
                {transformedCustomers.map((customer) => (
                    <motion.div
                        key={customer.sheet_row_number}
                        initial={false} // Disable entry animation on sync
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -2 }}
                        className="bg-white rounded-[28px] p-5 border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:border-blue-200 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.1)] transition-all duration-300 group cursor-pointer"
                    >
                        <div className="flex items-center justify-between">
                            {/* Profile Info */}
                            <div className="flex items-center gap-6 flex-1">
                                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0 group-hover:bg-blue-600 group-hover:border-blue-600 transition-all duration-500 shadow-sm">
                                    <User size={26} className="text-gray-400 group-hover:text-white transition-colors duration-300" />
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-black text-[#1e293b] leading-tight group-hover:text-blue-700 transition-colors">
                                            {customer['Customer Name']}
                                        </h3>
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-gray-100 shadow-sm">
                                            <span className="text-[9px] font-black text-gray-300 uppercase">ID:</span>
                                            <span className="text-[11px] font-black text-gray-600">{customer['Customer ID']}</span>
                                        </div>
                                        <div className="px-2.5 py-0.5 bg-purple-50 rounded-full border border-purple-100 shadow-sm">
                                            <span className="text-[9px] font-black text-purple-600 uppercase tracking-widest">{customer['Product']}</span>
                                        </div>
                                        {/* New Contacts Info */}
                                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50/50 rounded-full border border-blue-100/30 shadow-sm">
                                            <PhoneCall size={10} className="text-blue-500" />
                                            <span className={`text-[11px] font-black ${customer['Mobile'] === 'Invalid Number' ? 'text-red-500' : 'text-blue-600/80'}`}>
                                                {customer['Mobile']}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-50/50 rounded-full border border-indigo-100/30 shadow-sm">
                                            <Mail size={10} className="text-indigo-500" />
                                            <span className={`text-[11px] font-black ${customer['Email'] === 'Invalid Email' ? 'text-red-500' : 'text-indigo-600/80'}`}>
                                                {customer['Email']}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right px-10 border-x border-gray-50 flex flex-col justify-center min-w-[200px] group-hover:border-blue-50 transition-colors">
                                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-0.5">Total Dues</p>
                                <p className="text-2xl font-black text-[#1e293b] group-hover:text-blue-600 transition-colors">{customer['Amount'].includes('₹') ? customer['Amount'] : `₹${customer['Amount']}`}</p>
                                <div className="flex flex-col items-end gap-0.5 mt-1">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Due: {customer['Due Date']}</p>
                                    <p className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${customer.logs.call?.status === 'SUCCESS' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        {customer['Due Date'] ? (() => {
                                            const [d, m, y] = customer['Due Date'].split('-').map(Number);
                                            const due = new Date(y, m - 1, d);
                                            const today = new Date();
                                            today.setHours(0, 0, 0, 0);
                                            const diff = Math.round((due - today) / 86400000);
                                            if (diff === 0) return "Due Today";
                                            if (diff < 0) return `${Math.abs(diff)} Days Past`;
                                            return `${diff} Days Left`;
                                        })() : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* Action Button - Scaled Down */}
                            <div className="pl-10">
                                <button
                                    onClick={() => setSelectedCustomer(customer)}
                                    className="flex items-center gap-2.5 px-7 py-3.5 bg-gray-50 text-[#1e293b] rounded-2xl hover:bg-blue-600 hover:text-white transition-all transform active:scale-95 shadow-sm group-hover:shadow-blue-200 group-hover:bg-blue-600 group-hover:text-white border border-gray-100 hover:border-blue-600"
                                >
                                    <span className="text-[11px] font-black tracking-widest uppercase">View Details</span>
                                    <ArrowUpRight size={14} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal - Compact Scale */}
            <AnimatePresence>
                {selectedCustomer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedCustomer(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 10 }}
                            className="bg-white rounded-[40px] max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header - Compact */}
                            <div className="bg-[#1e293b] text-white p-7 relative shrink-0">
                                <button
                                    onClick={() => setSelectedCustomer(null)}
                                    className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-[24px] bg-white/10 flex items-center justify-center border border-white/20">
                                        <User size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tight uppercase leading-tight">{selectedCustomer['Customer Name']}</h3>
                                        <div className="flex items-center gap-3 mt-1.5 font-black uppercase text-[10px] tracking-widest">
                                            <span className="bg-white/10 px-3 py-1 rounded-full">ID: {selectedCustomer['Customer ID']}</span>
                                            <span className="bg-blue-500 px-3 py-1 rounded-full">{selectedCustomer['Product']}</span>
                                            <span className="text-gray-400">Due: {selectedCustomer['Due Date']}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Content - Smaller font/spacing */}
                            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8 bg-[#fafafa]">
                                {/* Manual Actions Section */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-black text-[#1e293b] flex items-center gap-2 uppercase tracking-tighter">
                                        <ArrowUpRight size={16} className="text-blue-500" />
                                        Manual Interventions
                                    </h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        <button
                                            onClick={() => handleManualAction('call', selectedCustomer)}
                                            disabled={manualLoading}
                                            className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-[24px] hover:border-red-200 hover:bg-red-50/30 transition-all group"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all shadow-sm">
                                                {manualLoading === 'call' ? <RefreshCw size={18} className="animate-spin" /> : <PhoneCall size={18} />}
                                            </div>
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Voice Call</span>
                                        </button>

                                        <button
                                            onClick={() => handleManualAction('whatsapp', selectedCustomer)}
                                            disabled={manualLoading}
                                            className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-[24px] hover:border-green-200 hover:bg-green-50/30 transition-all group"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-all shadow-sm">
                                                {manualLoading === 'whatsapp' ? <RefreshCw size={18} className="animate-spin" /> : <MessageSquare size={18} />}
                                            </div>
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">WhatsApp</span>
                                        </button>

                                        <button
                                            onClick={() => handleManualAction('email', selectedCustomer)}
                                            disabled={manualLoading}
                                            className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-[24px] hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
                                                {manualLoading === 'email' ? <RefreshCw size={18} className="animate-spin" /> : <Mail size={18} />}
                                            </div>
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Send Email</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Manual Log Stages (Dynamic Layout: 1, 2, or 3 logs) */}
                                {(() => {
                                    const activeLogs = [
                                        { id: 'call', title: 'Manual call', data: selectedCustomer.logs.manual.call, icon: <PhoneCall size={14} className="text-red-500" />, medium: 'Admin Voice Call', color: 'red' },
                                        { id: 'wa', title: 'Manual WhatsApp', data: selectedCustomer.logs.manual.wa, icon: <MessageSquare size={14} className="text-green-500" />, medium: 'Admin Message', color: 'green' },
                                        { id: 'email', title: 'Manual Email', data: selectedCustomer.logs.manual.email, icon: <Mail size={14} className="text-indigo-500" />, medium: 'Admin Outreach', color: 'indigo' }
                                    ].filter(l => l.data);

                                    if (activeLogs.length === 0) return null;

                                    return (
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-blue-600 flex items-center gap-2 uppercase tracking-widest">
                                                <History size={14} />
                                                Manual Intervention History ({activeLogs.length})
                                            </h4>
                                            <div className={`grid gap-4 ${activeLogs.length === 1 ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
                                                {activeLogs.map((logItem, idx) => (
                                                    <CompactStage
                                                        key={logItem.id}
                                                        title={logItem.title}
                                                        log={logItem.data}
                                                        icon={logItem.icon}
                                                        medium={logItem.medium}
                                                        color={logItem.color}
                                                        fullWidth={activeLogs.length === 3 && idx === 2} // Third item takes full width
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}

                                <div className="space-y-6">
                                    <h4 className="text-sm font-black text-[#1e293b] flex items-center gap-2 uppercase tracking-tighter">
                                        <ShieldCheck size={16} className="text-blue-500" />
                                        Communication Journal
                                    </h4>

                                    <div className="space-y-6">
                                        {/* Row 1: Standard Reminders */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <CompactStage
                                                title="T-15 Reminder"
                                                log={selectedCustomer.logs.t15}
                                                icon={<MessageSquare size={14} className="text-green-500" />}
                                                medium="WhatsApp Only"
                                                color="blue"
                                            />
                                            <CompactStage
                                                title="T-10 Awareness"
                                                log={selectedCustomer.logs.t10}
                                                icon={<Mail size={14} className="text-indigo-500" />}
                                                medium="Email Outreach"
                                                color="indigo"
                                            />
                                        </div>

                                        {/* Row 2: T-5 Combo */}
                                        <CompactStage
                                            title="T-5 Critical Follow-up"
                                            log={selectedCustomer.logs.t5}
                                            icon={<div className="flex -space-x-1.5"><MessageSquare size={12} className="text-green-600" /><Mail size={12} className="text-blue-600" /></div>}
                                            medium="Combo Flow (WhatsApp + Email)"
                                            color="orange"
                                            fullWidth={true}
                                        />

                                        {/* Row 3: T-0 Final Notice */}
                                        <CompactStage
                                            title="T-0 Final Notice"
                                            log={selectedCustomer.logs.t0}
                                            icon={<div className="flex -space-x-1.5"><MessageSquare size={12} className="text-red-600" /><Mail size={12} className="text-red-600" /></div>}
                                            medium="Urgent Final Combo"
                                            color="red"
                                            fullWidth={true}
                                        />
                                    </div>


                                    <div className="space-y-4">
                                        {/* Transcript - More Compact */}
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <h4 className="text-xs font-black text-red-600 flex items-center gap-2 uppercase mb-4 tracking-widest">
                                                <PhoneCall size={14} />
                                                Overdue AI Voice Agent
                                            </h4>

                                            {selectedCustomer.logs.call ? (
                                                <div className="bg-[#1e293b] rounded-[24px] p-5 text-white/90">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">Call Transcript</span>
                                                        <span className="text-[9px] opacity-40 uppercase">{selectedCustomer.logs.call.timestamp}</span>
                                                    </div>
                                                    <p className="text-xs font-medium italic border-l-2 border-red-500 pl-4 leading-relaxed">
                                                        "{selectedCustomer.logs.call.content}"
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="bg-white rounded-[24px] p-6 text-center border-2 border-dashed border-gray-100">
                                                    <p className="text-[10px] text-gray-400 font-black uppercase italic">No call recorded yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 bg-blue-50 rounded-[28px] border border-blue-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Clock size={18} className="text-blue-500" />
                                        <p className="text-[10px] font-black text-[#1e293b] uppercase tracking-widest">Synced with SAP Cloud</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedCustomer(null)}
                                        className="px-6 py-2 bg-white border border-blue-100 rounded-xl text-[10px] font-black text-blue-600 uppercase tracking-widest"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const CompactStage = ({ title, log, icon, medium, color, fullWidth = false }) => {
    const bgColor = { blue: 'bg-blue-50', indigo: 'bg-indigo-50', orange: 'bg-orange-50', red: 'bg-red-50' }[color];
    const textColor = { blue: 'text-blue-600', indigo: 'text-indigo-600', orange: 'text-orange-600', red: 'text-red-600' }[color];

    return (
        <div className={`p-4 rounded-[28px] border border-gray-100/80 ${log ? 'bg-white shadow-sm' : 'bg-gray-50/50 opacity-60'} transition-all`}>
            {/* Header Section */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl ${bgColor} flex items-center justify-center shrink-0 shadow-sm`}>
                        {icon}
                    </div>
                    <div>
                        <h5 className="font-black text-[#1e293b] text-[11px] uppercase tracking-tight leading-none">{title}</h5>
                        <p className={`text-[9px] font-black ${textColor} uppercase tracking-widest mt-1`}>{medium}</p>
                    </div>
                </div>
                {log && (
                    <div className="text-right">
                        <div className="flex items-center justify-end gap-1.5 mb-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'FAILED' || log.em?.status === 'FAILED' || log.wa?.status === 'FAILED' ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
                            <span className={`text-[9px] font-black uppercase ${log.status === 'FAILED' || log.em?.status === 'FAILED' || log.wa?.status === 'FAILED' ? 'text-red-600' : 'text-green-600'}`}>
                                {log.status || log.em?.status || log.wa?.status || 'Sent'}
                            </span>
                        </div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter tabular-nums">
                            {log.timestamp}
                        </p>
                    </div>
                )}
            </div>

            {log && (
                <div className="space-y-3">
                    {log.isCombo ? (
                        <div className={`grid grid-cols-1 ${log.wa?.message && log.em?.body ? 'md:grid-cols-2' : ''} gap-3`}>
                            {/* WhatsApp Column */}
                            {log.wa?.message && (
                                <div className="bg-green-50/30 p-4 rounded-[20px] border border-green-100/40">
                                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-green-100/50">
                                        <MessageSquare size={12} className="text-green-600" />
                                        <span className="text-[9px] font-black text-green-700 uppercase">WhatsApp Message</span>
                                    </div>
                                    <p className="text-[10.5px] font-medium text-gray-600 italic leading-relaxed whitespace-pre-wrap">
                                        {log.wa.message}
                                    </p>
                                </div>
                            )}

                            {/* Email Column - With Blue Heading Line */}
                            {log.em?.body && (
                                <div className="bg-blue-50/20 rounded-[20px] border border-blue-100/30 overflow-hidden flex flex-col">
                                    <div className="bg-blue-600 px-4 py-2 flex items-center gap-2">
                                        <Mail size={12} className="text-white" />
                                        <span className="text-[9px] font-black text-white uppercase truncate">
                                            {log.em.subject}
                                        </span>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-[10.5px] font-medium text-gray-500 italic leading-relaxed whitespace-pre-wrap">
                                            {log.em.body}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Standard Single Column (Like T-15 WA only) */
                        <div className="bg-gray-50/50 p-4 rounded-[20px] border border-gray-100">
                            <p className="text-[11px] font-medium text-gray-600 italic leading-relaxed whitespace-pre-wrap">
                                {log.content}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PendingDues;

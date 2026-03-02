import React, { useState } from 'react';
import { Blocks, CheckCircle2, Link2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const initialIntegrations = [
    {
        id: 'tally',
        name: 'Tally ERP',
        description: 'Sync your accounting ledgers and daily reports automatically in real-time.',
        icon: '📊',
        connected: false,
        theme: 'from-blue-500 to-indigo-600',
        bg: 'bg-blue-50'
    },
    {
        id: 'whatsapp',
        name: 'WhatsApp Business',
        description: 'Send automated alerts, payment reminders, and interact with customers seamlessly.',
        icon: '💬',
        connected: true,
        theme: 'from-emerald-400 to-green-600',
        bg: 'bg-emerald-50'
    },
    {
        id: 'gmail',
        name: 'Gmail',
        description: 'Connect your inbox to track communications and sync invoice deliveries.',
        icon: '📧',
        connected: false,
        theme: 'from-red-400 to-rose-600',
        bg: 'bg-rose-50'
    },
    {
        id: 'sheets',
        name: 'Google Sheets',
        description: 'Two-way sync for tabular data, forecasting models, and bulk edits.',
        icon: '📋',
        connected: true,
        theme: 'from-green-500 to-emerald-600',
        bg: 'bg-green-50'
    },
    {
        id: 'calendar',
        name: 'Google Calendar',
        description: 'Schedule follow-ups, sync payment due dates, and track renewals.',
        icon: '📅',
        connected: false,
        theme: 'from-blue-400 to-blue-600',
        bg: 'bg-blue-50'
    }
];

const Integrations = () => {
    const [integrations, setIntegrations] = useState(initialIntegrations);

    const toggleConnection = (id) => {
        setIntegrations(integrations.map(integ =>
            integ.id === id ? { ...integ, connected: !integ.connected } : integ
        ));
    };

    return (
        <div className="bg-transparent p-2 space-y-8 max-w-7xl mx-auto w-full">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#111935] text-white flex items-center justify-center shadow-lg">
                        <Blocks size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-[#111935] tracking-tight">Integrations Hub</h1>
                        <p className="text-sm font-semibold text-gray-400 mt-1">Connect your workspace with third-party tools</p>
                    </div>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {integrations.map((integration) => (
                    <motion.div
                        key={integration.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`bg-white rounded-[32px] p-8 border hover:shadow-xl transition-all relative overflow-hidden group ${integration.connected ? 'border-green-200 shadow-sm' : 'border-gray-100'
                            }`}
                    >
                        {/* Background Decoration */}
                        <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-10 bg-gradient-to-br ${integration.theme} group-hover:opacity-20 transition-opacity pointer-events-none`} />

                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-14 h-14 rounded-2xl ${integration.bg} flex items-center justify-center text-2xl shadow-inner`}>
                                {integration.icon}
                            </div>

                            {integration.connected && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-xl border border-green-100 text-[10px] font-black uppercase tracking-widest shadow-sm">
                                    <CheckCircle2 size={12} />
                                    Connected
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="text-lg font-black text-[#111935] mb-2">{integration.name}</h3>
                            <p className="text-sm font-medium text-gray-500 leading-relaxed min-h-[60px]">
                                {integration.description}
                            </p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                            <button className="text-gray-400 hover:text-[#111935] transition-colors p-2 hover:bg-gray-50 rounded-lg">
                                <ExternalLink size={18} />
                            </button>

                            <button
                                onClick={() => toggleConnection(integration.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${integration.connected
                                        ? 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                                        : 'bg-[#111935] text-white hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20'
                                    }`}
                            >
                                {integration.connected ? 'Disconnect' : (
                                    <>
                                        <Link2 size={16} />
                                        Connect App
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

        </div>
    );
};

export default Integrations;

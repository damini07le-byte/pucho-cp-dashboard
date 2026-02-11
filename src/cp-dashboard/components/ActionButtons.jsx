import React, { useState } from 'react';
import { Play, Mail, MessageCircle, Phone, RefreshCw, Download, Loader2 } from 'lucide-react';
import { triggerAgentFlow } from '../utils/agentService';

const ActionButtons = () => {
    const [running, setRunning] = useState(null);

    const handleBulkRun = async (type, flowId) => {
        setRunning(type);
        try {
            await triggerAgentFlow(type, flowId, { isBulk: true });
        } finally {
            setTimeout(() => setRunning(null), 2000);
        }
    };

    return (
        <div className="flex items-center gap-3 mb-8">
            <button
                onClick={() => handleBulkRun('bulk', 'WF3')}
                disabled={running !== null}
                className="flex items-center gap-3 px-8 h-[52px] bg-[#111935] text-white rounded-2xl font-black text-[15px] shadow-xl hover:bg-[#1a254d] active:scale-95 transition-all disabled:opacity-70"
            >
                {running === 'bulk' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-white" />}
                Run Tasks (WF3)
            </button>

            <button
                onClick={() => handleBulkRun('email', 'WF4')}
                disabled={running !== null}
                className="flex items-center gap-3 px-6 h-[52px] bg-white border border-black/5 rounded-2xl font-black text-[15px] text-[#111935] shadow-sm hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-70"
            >
                {running === 'email' ? <Loader2 className="w-5 h-5 animate-spin text-blue-500" /> : <Mail className="w-5 h-5 text-blue-500" />}
                Send Emails
            </button>

            <button
                onClick={() => handleBulkRun('whatsapp', 'WF5')}
                disabled={running !== null}
                className="flex items-center gap-3 px-6 h-[52px] bg-white border border-black/5 rounded-2xl font-black text-[15px] text-[#111935] shadow-sm hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-70"
            >
                {running === 'whatsapp' ? <Loader2 className="w-5 h-5 animate-spin text-green-500" /> : <MessageCircle className="w-5 h-5 text-green-500" />}
                WhatsApp Blast
            </button>

            <button
                onClick={() => handleBulkRun('call', 'WF6')}
                disabled={running !== null}
                className="flex items-center gap-3 px-6 h-[52px] bg-white border border-black/5 rounded-2xl font-black text-[15px] text-[#111935] shadow-sm hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-70"
            >
                {running === 'call' ? <Loader2 className="w-5 h-5 animate-spin text-purple-500" /> : <Phone className="w-5 h-5 text-purple-500" />}
                Voice Campaign
            </button>

            <div className="ml-auto flex items-center gap-2">
                <button className="w-10 h-10 rounded-full border border-black/5 flex items-center justify-center hover:bg-gray-50">
                    <RefreshCw className="w-4 h-4 text-gray-400" />
                </button>
                <button className="flex items-center gap-2 px-4 h-10 border border-black/5 rounded-full font-bold text-sm text-[#111935]">
                    <Download className="w-4 h-4" />
                    Export
                </button>
            </div>
        </div>
    );
};

export default ActionButtons;

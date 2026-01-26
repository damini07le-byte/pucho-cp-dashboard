import React from 'react';
import { Play, Mail, MessageCircle, Phone, RefreshCw, Download } from 'lucide-react';

const ActionButtons = () => {
    return (
        <div className="flex items-center gap-3 mb-8">
            <button className="flex items-center gap-2 px-6 h-11 bg-[#111935] text-white rounded-full font-bold text-sm shadow-md">
                <Play className="w-4 h-4 fill-white" />
                Run Tasks
            </button>

            <button className="flex items-center gap-2 px-5 h-11 bg-white border border-black/5 rounded-full font-bold text-sm text-[#111935] hover:bg-gray-50">
                <Mail className="w-4 h-4 text-blue-500" />
                Send Emails
            </button>

            <button className="flex items-center gap-2 px-5 h-11 bg-white border border-black/5 rounded-full font-bold text-sm text-[#111935] hover:bg-gray-50">
                <MessageCircle className="w-4 h-4 text-green-500" />
                WhatsApp Blast
            </button>

            <button className="flex items-center gap-2 px-5 h-11 bg-white border border-black/5 rounded-full font-bold text-sm text-[#111935] hover:bg-gray-50">
                <Phone className="w-4 h-4 text-purple-500" />
                Voice Campaign
            </button>

            <div className="ml-auto flex items-center gap-2">
                <button className="w-10 h-10 rounded-full border border-black/5 flex items-center justify-center">
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

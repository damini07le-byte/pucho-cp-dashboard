import React from 'react';
import { Play, Mail, MessageCircle, Phone, RefreshCw, Download } from 'lucide-react';

const ActionButtons = ({ onRun }) => {
    return (
        <div className="flex items-center gap-3 mb-8">
            <button
                onClick={() => onRun('All')}
                className="flex items-center gap-3 px-8 h-[48px] bg-[#111935] text-white rounded-full font-black text-[15px] shadow-lg hover:bg-[#1a254d] active:scale-95 transition-all"
            >
                <Play className="w-5 h-5 fill-white" />
                Run Tasks
            </button>

            <button
                onClick={() => onRun('Email')}
                className="flex items-center gap-3 px-6 h-[48px] bg-white border border-black/5 rounded-full font-black text-[15px] text-[#111935] hover:bg-gray-50 active:scale-95 transition-all"
            >
                <Mail className="w-5 h-5 text-blue-500" />
                Send Emails
            </button>

            <button
                onClick={() => onRun('WhatsApp')}
                className="flex items-center gap-3 px-6 h-[48px] bg-white border border-black/5 rounded-full font-black text-[15px] text-[#111935] hover:bg-gray-50 active:scale-95 transition-all"
            >
                <MessageCircle className="w-5 h-5 text-green-500" />
                WhatsApp Blast
            </button>

            <button
                onClick={() => onRun('Voice')}
                className="flex items-center gap-3 px-6 h-[48px] bg-white border border-black/5 rounded-full font-black text-[15px] text-[#111935] hover:bg-gray-50 active:scale-95 transition-all"
            >
                <Phone className="w-5 h-5 text-purple-500" />
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

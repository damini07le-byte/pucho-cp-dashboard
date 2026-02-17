import React from 'react';
import { Mail, MessageCircle, Phone, ThumbsUp } from 'lucide-react';

const ActivityList = ({ tasks = [] }) => {
    // Calculate activity based on today's logs in the sheet
    const todayStr = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY

    let emailCount = 0;
    let whatsappCount = 0;
    let voiceCount = 0;

    tasks.forEach(t => {
        const rowStr = JSON.stringify(t);
        if (rowStr.includes(todayStr)) {
            if (rowStr.includes('WHATSAPP')) whatsappCount++;
            if (rowStr.includes('EMAIL') || rowStr.includes('MAIL')) emailCount++;
            if (rowStr.includes('VOICE') || rowStr.includes('CALL') || rowStr.includes('CHAT_LOG')) voiceCount++;
        }
    });

    const successCount = whatsappCount + emailCount + voiceCount;

    const dynamicActivity = [
        { label: 'Emails Sent', value: emailCount, icon: Mail, color: 'bg-blue-50 text-blue-500' },
        { label: 'WhatsApp Messages', value: whatsappCount, icon: MessageCircle, color: 'bg-green-50 text-green-500' },
        { label: 'Voice Calls', value: voiceCount, icon: Phone, color: 'bg-purple-50 text-purple-500' },
        { label: 'Successful Connects', value: successCount, icon: ThumbsUp, color: 'bg-blue-50 text-blue-500' },
    ];

    return (
        <div className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm h-full">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold">Today's Activity</h2>
                <div className="flex items-center gap-2 text-blue-500 font-bold text-[12px]">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                    LIVE
                </div>
            </div>

            <div className="space-y-3">
                {dynamicActivity.map((activity, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 bg-gray-50/50 rounded-2xl border border-transparent hover:border-blue-400/30 hover:bg-white hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`w-11 h-11 rounded-xl ${activity.color} flex items-center justify-center`}>
                                <activity.icon size={22} />
                            </div>
                            <span className="text-[14px] font-bold text-gray-500">{activity.label}</span>
                        </div>
                        <span className="text-xl font-black">{activity.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityList;

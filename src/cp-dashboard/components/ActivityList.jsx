import React from 'react';
import { Mail, MessageCircle, Phone, ThumbsUp } from 'lucide-react';

const todayActivity = [
    { label: 'Emails Sent', value: 125, icon: Mail, color: 'bg-blue-50 text-blue-500' },
    { label: 'WhatsApp Messages', value: 119, icon: MessageCircle, color: 'bg-green-50 text-green-500' },
    { label: 'Voice Calls', value: 45, icon: Phone, color: 'bg-purple-50 text-purple-500' },
    { label: 'Successful Connects', value: 87, icon: ThumbsUp, color: 'bg-[#A0D296]/10 text-[#A0D296]' },
];

const ActivityList = () => {
    return (
        <div className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Today's Activity</h2>
                <div className="flex items-center gap-1.5 text-green-500 font-bold text-[10px]">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    LIVE
                </div>
            </div>

            <div className="space-y-3">
                {todayActivity.map((activity, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-[#A0D296]/30 hover:bg-white hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl ${activity.color} flex items-center justify-center`}>
                                <activity.icon size={18} />
                            </div>
                            <span className="text-xs font-bold text-gray-500">{activity.label}</span>
                        </div>
                        <span className="text-base font-black">{activity.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityList;

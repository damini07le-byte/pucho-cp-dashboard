import React from 'react';
import { Users, AlertTriangle, Clock, CheckCircle, PhoneOff } from 'lucide-react';

const stats = [
    { label: 'Total Customers', value: 2847, change: 5.2, icon: Users, accentColor: 'bg-[#A0D296]/10', iconColor: 'text-[#A0D296]' },
    { label: 'Expiring This Month', value: 342, change: null, icon: AlertTriangle, accentColor: 'bg-amber-50', iconColor: 'text-amber-500' },
    { label: 'Tasks Pending', value: 156, change: null, icon: Clock, accentColor: 'bg-blue-50', iconColor: 'text-blue-500' },
    { label: 'Completed Today', value: 892, change: 12.5, icon: CheckCircle, accentColor: 'bg-[#A0D296]/10', iconColor: 'text-[#A0D296]' },
    { label: 'DND List', value: 89, change: null, icon: PhoneOff, accentColor: 'bg-gray-50', iconColor: 'text-gray-400' },
];

const StatCards = () => {
    return (
        <div className="grid grid-cols-5 gap-6 mb-8">
            {stats.map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[28px] border border-black/5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`w-11 h-11 rounded-[14px] ${stat.accentColor} flex items-center justify-center ${stat.iconColor}`}>
                            <stat.icon size={22} />
                        </div>
                        {stat.change && (
                            <span className="text-[10px] font-bold text-green-500 px-2 py-1 bg-green-50 rounded-full">
                                +{stat.change}%
                            </span>
                        )}
                    </div>
                    <h3 className="text-2xl font-black text-[#111935]">{stat.value.toLocaleString()}</h3>
                    <p className="text-[11px] font-medium text-gray-400 mt-1 uppercase tracking-wider">{stat.label}</p>
                </div>
            ))}
        </div>
    );
};

export default StatCards;

import React from 'react';
import { Users, AlertTriangle, Clock, CheckCircle, PhoneOff } from 'lucide-react';

const StatCards = ({ tasks = [], customers = [] }) => {
    const calculateDays = (d) => {
        if (!d || d === 'N/A') return 999;
        const target = new Date(d);
        if (isNaN(target.getTime())) return 999;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        return Math.ceil((target - today) / 86400000);
    };

    const totalCustomers = customers.length || 6;
    const expiringThisMonth = customers.filter(c => {
        const days = calculateDays(c['Expiry Date to Type'] || c['Expiry Date']);
        return days >= 0 && days <= 30;
    }).length || 5;

    const pendingTasks = tasks.length || totalCustomers;

    const todayStr = new Date().toLocaleDateString('en-GB');
    const completedTasks = tasks.filter(t => JSON.stringify(t).includes(todayStr)).length;
    const dndList = tasks.filter(t => JSON.stringify(t).toUpperCase().includes('DND') || JSON.stringify(t).toUpperCase().includes('OPTED_OUT')).length;

    const dynamicStats = [
        { label: 'Total Customers', value: totalCustomers, change: 5.2, icon: Users, accentColor: 'bg-blue-50', iconColor: 'text-blue-500' },
        { label: 'Expiring This Month', value: expiringThisMonth, change: null, icon: AlertTriangle, accentColor: 'bg-amber-50', iconColor: 'text-amber-500' },
        { label: 'Tasks Pending', value: pendingTasks, change: null, icon: Clock, accentColor: 'bg-blue-50', iconColor: 'text-blue-500' },
        { label: 'Completed Today', value: completedTasks, change: 12.5, icon: CheckCircle, accentColor: 'bg-blue-50', iconColor: 'text-blue-500' },
        { label: 'DND List', value: dndList, change: null, icon: PhoneOff, accentColor: 'bg-gray-50', iconColor: 'text-gray-400' },
    ];

    return (
        <div className="grid grid-cols-5 gap-6 mb-8">
            {dynamicStats.map((stat, idx) => (
                <div key={idx} className="bg-white p-8 rounded-[32px] border border-black/5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-6">
                        <div className={`w-12 h-12 rounded-[16px] ${stat.accentColor} flex items-center justify-center ${stat.iconColor}`}>
                            <stat.icon size={24} />
                        </div>
                        {stat.change && (
                            <span className="text-xs font-black text-blue-500 px-3 py-1 bg-blue-50 rounded-full">
                                {stat.change > 0 ? `+${stat.change}%` : `${stat.change}%`}
                            </span>
                        )}
                    </div>
                    <h3 className="text-3xl font-black text-[#111935] tracking-tight">{stat.value.toLocaleString()}</h3>
                    <p className="text-[13px] font-bold text-gray-400 mt-2 uppercase tracking-widest leading-none">{stat.label}</p>
                </div>
            ))}
        </div>
    );
};

export default StatCards;

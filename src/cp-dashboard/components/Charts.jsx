import React from 'react';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const outcomeBreakdown = [
    { name: 'Agreed...', value: 234, color: '#10B981' },
    { name: 'Call La...', value: 156, color: '#F59E0B' },
    { name: 'Not Inte...', value: 89, color: '#EF4444' },
    { name: 'DND Re...', value: 34, color: '#6B7280' },
    { name: 'Not Re...', value: 178, color: '#8B5CF6' },
    { name: 'Wrong ...', value: 23, color: '#EC4899' }
];

const hourlyActivity = [
    { hour: '10AM', tasks: 40 },
    { hour: '11AM', tasks: 65 },
    { hour: '12PM', tasks: 55 },
    { hour: '1PM', tasks: 25 },
    { hour: '2PM', tasks: 15 },
    { hour: '3PM', tasks: 20 },
    { hour: '4PM', tasks: 35 },
    { hour: '5PM', tasks: 85 },
    { hour: '6PM', tasks: 75 },
    { hour: '7PM', tasks: 45 },
];

export const OutcomeDistribution = ({ tasks }) => {
    // Dynamically calculate outcomes based on current task statuses
    const counts = tasks.reduce((acc, task) => {
        const s = task.status || 'Pending';
        acc[s] = (acc[s] || 0) + 1;
        return acc;
    }, {});

    const dynamicOutcomeBreakdown = [
        { name: 'Completed', value: counts['Completed'] || 0, color: '#10B981' },
        { name: 'In Progress', value: counts['In Progress'] || 0, color: '#3B82F6' },
        { name: 'Pending', value: counts['Pending'] || 0, color: '#F59E0B' },
        { name: 'Failed', value: counts['Failed'] || 0, color: '#EF4444' },
    ];

    const total = dynamicOutcomeBreakdown.reduce((a, b) => a + b.value, 0);

    return (
        <div className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm h-full font-['Space_Grotesk']">
            <h2 className="text-lg font-bold mb-6">Outcome Distribution</h2>
            <div className="h-[180px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={dynamicOutcomeBreakdown}
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={6}
                            dataKey="value"
                        >
                            {dynamicOutcomeBreakdown.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <span className="text-2xl font-black">{total}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Total</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 px-2">
                {dynamicOutcomeBreakdown.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-[12px] font-bold text-gray-400 truncate">{item.name}</span>
                        <span className="ml-auto text-[12px] font-black">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const HourlyActivity = ({ tasks }) => {
    // Simulate hourly trend based on current tasks count
    // In a real app, this would use timestamps from the sheet
    const baseValue = tasks.length > 0 ? (tasks.length / 10) : 5;

    const dynamicHourlyActivity = [
        { hour: '10AM', tasks: Math.floor(baseValue * 4) },
        { hour: '11AM', tasks: Math.floor(baseValue * 6.5) },
        { hour: '12PM', tasks: Math.floor(baseValue * 5.5) },
        { hour: '1PM', tasks: Math.floor(baseValue * 2.5) },
        { hour: '2PM', tasks: Math.floor(baseValue * 1.5) },
        { hour: '3PM', tasks: Math.floor(baseValue * 2) },
        { hour: '4PM', tasks: Math.floor(baseValue * 3.5) },
        { hour: '5PM', tasks: Math.floor(baseValue * 8.5) },
        { hour: '6PM', tasks: Math.floor(baseValue * 7.5) },
        { hour: '7PM', tasks: Math.floor(baseValue * 4.5) },
    ];

    return (
        <div className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm h-full font-['Space_Grotesk']">
            <h2 className="text-lg font-bold mb-6">Hourly Activity</h2>
            <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dynamicHourlyActivity}>
                        <defs>
                            <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis
                            dataKey="hour"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                            interval={2}
                        />
                        <YAxis hide />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="tasks"
                            stroke="#8b5cf6"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorTasks)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <div className="flex justify-between items-center mt-2 px-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Trend Analysis</span>
                <span className="text-[10px] font-black text-purple-600">Syncing with Sheet</span>
            </div>
        </div>
    );
};

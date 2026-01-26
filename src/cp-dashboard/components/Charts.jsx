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

export const OutcomeDistribution = () => (
    <div className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm h-full">
        <h2 className="text-lg font-bold mb-6">Outcome Distribution</h2>
        <div className="h-[240px] relative">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={outcomeBreakdown}
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={6}
                        dataKey="value"
                    >
                        {outcomeBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-2xl font-black">{outcomeBreakdown.reduce((a, b) => a + b.value, 0)}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Total</span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4 px-2">
            {outcomeBreakdown.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-[10px] font-bold text-gray-400 truncate">{item.name}</span>
                    <span className="ml-auto text-[10px] font-black">{item.value}</span>
                </div>
            ))}
        </div>
    </div>
);

export const HourlyActivity = () => (
    <div className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm h-full">
        <h2 className="text-lg font-bold mb-6">Hourly Activity</h2>
        <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyActivity}>
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
            <span className="text-[10px] font-black text-purple-600">+14% Growth</span>
        </div>
    </div>
);

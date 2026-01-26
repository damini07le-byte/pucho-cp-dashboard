import React from 'react';
import { Mail, MessageCircle, Phone, Clock, CheckCircle, XCircle, MoreVertical } from 'lucide-react';

const tasks = [
    { id: 'TASK001', customer: 'Rajesh Kumar', product: 'Software Subscription', channel: 'Voice', status: 'In Progress', time: '2 min ago', slot: 'Morning' },
    { id: 'TASK002', customer: 'Priya Sharma', product: 'MTS', channel: 'WhatsApp', status: 'Completed', time: '5 min ago', slot: 'Morning' },
    { id: 'TASK003', customer: 'Amit Patel', product: 'Migration', channel: 'Email', status: 'Pending', time: '8 min ago', slot: 'Morning' },
    { id: 'TASK004', customer: 'Sneha Gupta', product: 'Software Subscription', channel: 'Voice', status: 'Failed', time: '12 min ago', slot: 'Morning' },
    { id: 'TASK005', customer: 'Vikram Singh', product: 'MTS', channel: 'WhatsApp', status: 'Completed', time: '15 min ago', slot: 'Morning' },
];

const ChannelIcon = ({ channel }) => {
    switch (channel) {
        case 'Email': return <Mail size={14} className="text-blue-500" />;
        case 'WhatsApp': return <MessageCircle size={14} className="text-green-500" />;
        case 'Voice': return <Phone size={14} className="text-purple-500" />;
        default: return null;
    }
};

const StatusBadge = ({ status }) => {
    const styles = {
        'Pending': 'bg-gray-100 text-gray-600',
        'In Progress': 'bg-blue-100 text-blue-600',
        'Completed': 'bg-green-100 text-green-600',
        'Failed': 'bg-red-100 text-red-600',
    };
    return (
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${styles[status]}`}>
            {status}
        </span>
    );
};

const TaskQueue = () => {
    return (
        <div className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Live Task Queue (Sheet 2)</h2>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400">Total: {tasks.length}</span>
                    <button className="p-1.5 hover:bg-gray-50 rounded-lg">
                        <MoreVertical size={16} className="text-gray-400" />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-wider border-b border-gray-50">
                            <th className="pb-3 pl-2">ID</th>
                            <th className="pb-3">Customer</th>
                            <th className="pb-3">Product</th>
                            <th className="pb-3">Channel</th>
                            <th className="pb-3">Status</th>
                            <th className="pb-3 text-right pr-2">Last Update</th>
                        </tr>
                    </thead>
                    <tbody className="text-[12px]">
                        {tasks.map((task) => (
                            <tr key={task.id} className="group hover:bg-gray-50/50 transition-colors">
                                <td className="py-3 pl-2 font-bold text-gray-400">{task.id}</td>
                                <td className="py-3 font-bold text-[#111935]">{task.customer}</td>
                                <td className="py-3 text-gray-500">{task.product}</td>
                                <td className="py-3">
                                    <div className="flex items-center gap-2">
                                        <ChannelIcon channel={task.channel} />
                                        <span className="font-medium">{task.channel}</span>
                                    </div>
                                </td>
                                <td className="py-3">
                                    <StatusBadge status={task.status} />
                                </td>
                                <td className="py-3 text-right pr-2 text-gray-400 font-medium">{task.time}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TaskQueue;

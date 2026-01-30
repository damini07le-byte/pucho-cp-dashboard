import React, { useState, useMemo } from 'react';
import {
    Mail, MessageCircle, Phone, Clock, CheckCircle, XCircle,
    MoreVertical, ChevronLeft, ChevronRight, Sparkles, MinusCircle,
    Play, Loader2
} from 'lucide-react';

const ChannelIcon = ({ channel }) => {
    switch (channel) {
        case 'Email': return <Mail size={14} className="text-blue-500" />;
        case 'WhatsApp': return <MessageCircle size={14} className="text-green-500" />;
        case 'Voice': return <Phone size={14} className="text-purple-500" />;
        default: return null;
    }
};

const ResponseBadge = ({ response }) => {
    if (!response || response === '-') return <span className="text-gray-300">-</span>;

    const isInterested = response.toLowerCase().includes('interested') && !response.toLowerCase().includes('not');

    if (isInterested) {
        return (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-100 rounded-full text-[11px] font-black text-green-600 animate-in fade-in zoom-in duration-500">
                <Sparkles size={12} className="animate-pulse" />
                <span>INTERESTED</span>
            </div>
        );
    }

    return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full text-[11px] font-black text-amber-600 animate-in fade-in zoom-in duration-500">
            <MinusCircle size={12} />
            <span>NOT INTERESTED</span>
        </div>
    );
};

const StatusBadge = ({ status, onUpdate, id }) => {
    const styles = {
        'Pending': 'bg-gray-100 text-gray-400 border-gray-200',
        'In Progress': 'bg-blue-50 text-blue-600 border-blue-200',
        'Done': 'bg-green-50 text-green-600 border-green-200',
        'Failed': 'bg-red-50 text-red-600 border-red-200',
    };

    const statuses = ['Pending', 'In Progress', 'Done', 'Failed'];

    return (
        <div className="relative inline-block">
            <select
                value={status}
                onChange={(e) => onUpdate(id, e.target.value)}
                className={`px-3 py-1.5 rounded-xl text-[12px] font-black border outline-none appearance-none cursor-pointer transition-all pr-8 ${styles[status] || styles['Pending']}`}
            >
                {statuses.map(s => (
                    <option key={s} value={s} className="bg-white text-gray-700">{s}</option>
                ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                {status === 'In Progress' ? <Loader2 size={12} className="animate-spin" /> : <ChevronRight size={12} className="rotate-90" />}
            </div>
        </div>
    );
};

const TaskQueue = ({ tasks, onUpdateStatus, view = 'tasks', onTriggerCampaign, isCampaignRunning }) => {
    const [filter, setFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const entriesPerPage = 10;

    const filteredTasks = useMemo(() =>
        tasks.filter(task => filter === 'All' || task.channel === filter),
        [tasks, filter]);

    const totalPages = Math.ceil(filteredTasks.length / entriesPerPage);
    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = filteredTasks.slice(indexOfFirstEntry, indexOfLastEntry);

    const internalKeys = ['id', 'status', 'time', 'channel', 'customer', 'product', 'mobile', 'email', 'contact', 'type', 'response'];
    const standardAliases = [
        'serial number', 's.no', 'sr no', 'sno', 'number', 'sl no',
        'org name', 'organization', 'customer name', 'name', 'company', 'brand', 'party',
        'phone', 'mobile number', 'phone number', 'whatsapp', 'mobile_no',
        'contact person', 'contact_person', 'representative', 'customer response', 'response', 'analysis'
    ];

    const dynamicHeaders = view === 'customers' && filteredTasks.length > 0
        ? Object.keys(filteredTasks[0]).filter(key => {
            const k = key.toLowerCase().trim();
            return !internalKeys.includes(k) && !standardAliases.includes(k);
        })
        : [];

    return (
        <div className="bg-white p-5 rounded-[28px] border border-black/5 shadow-sm overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-black text-[#111935]">
                        {view === 'customers' ? 'Customer Database' : 'Real-time Task Queue'}
                    </h2>
                    <div className="flex bg-gray-50/80 p-1 rounded-xl border border-black/5">
                        {['All', 'Voice', 'WhatsApp', 'Email'].map(f => (
                            <button
                                key={f}
                                onClick={() => { setFilter(f); setCurrentPage(1); }}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all ${filter === f ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg border border-black/5">Count: {filteredTasks.length}</span>
                </div>
            </div>

            <div className="overflow-x-auto min-h-[350px] custom-scrollbar border border-black/5 rounded-xl">
                <table className="w-full text-left min-w-max border-collapse">
                    <thead>
                        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50">
                            <th className="py-3 px-4 border-b border-gray-100">ID</th>
                            <th className="py-3 px-4 border-b border-gray-100">{view === 'customers' ? 'Organization' : 'Customer'}</th>
                            {view === 'customers' ? (
                                <>
                                    <th className="py-3 px-4 border-b border-gray-100">Contact</th>
                                    <th className="py-3 px-4 border-b border-gray-100">Mobile</th>
                                    {dynamicHeaders.map(header => (
                                        <th key={header} className="py-3 px-4 border-b border-gray-100 capitalize">{header}</th>
                                    ))}
                                    <th className="py-3 px-4 border-b border-gray-100 text-purple-600">AI Response</th>
                                </>
                            ) : (
                                <>
                                    <th className="py-3 px-4 border-b border-gray-100">Product</th>
                                    <th className="py-3 px-4 border-b border-gray-100">Channel</th>
                                </>
                            )}
                            <th className="py-3 px-4 border-b border-gray-100">Status</th>
                            {view !== 'customers' && <th className="py-3 px-4 text-right border-b border-gray-100">Update</th>}
                        </tr>
                    </thead>
                    <tbody className="text-[12px]">
                        {currentEntries.length > 0 ? currentEntries.map((task) => (
                            <tr key={task.id} className={`group transition-all border-b border-gray-50 hover:bg-gray-50/50 ${task.status === 'In Progress' ? 'bg-blue-50/30' : ''}`}>
                                <td className="py-3.5 px-4 font-bold text-gray-400">{task.id}</td>
                                <td className="py-3.5 px-4 font-black text-[#111935] whitespace-nowrap min-w-[180px]">{task.customer}</td>
                                {view === 'customers' ? (
                                    <>
                                        <td className="py-3.5 px-4 text-gray-600 font-bold whitespace-nowrap">{task.contact || '-'}</td>
                                        <td className="py-3.5 px-4 font-black text-[#111935] whitespace-nowrap">{task.mobile || '-'}</td>
                                        {dynamicHeaders.map(header => (
                                            <td key={header} className="py-3.5 px-4 text-gray-500 font-medium whitespace-nowrap">
                                                {task[header] || '-'}
                                            </td>
                                        ))}
                                        <td className="py-3.5 px-4 min-w-[130px]">
                                            <ResponseBadge response={task.response} />
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="py-3.5 px-4 text-gray-600 font-bold">{task.product}</td>
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-2">
                                                <ChannelIcon channel={task.channel} />
                                                <span className="font-black text-[#111935]">{task.channel}</span>
                                            </div>
                                        </td>
                                    </>
                                )}
                                <td className="py-3.5 px-4">
                                    <StatusBadge status={task.status} onUpdate={onUpdateStatus} id={task.id} />
                                </td>
                                {view !== 'customers' && (
                                    <td className="py-3.5 px-4 text-right">
                                        <span className="font-bold text-gray-400 text-[11px]">{task.time}</span>
                                    </td>
                                )}
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={view === 'customers' ? (7 + dynamicHeaders.length) : 6} className="py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">No records found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 px-2">
                    <p className="text-xs font-bold text-gray-400">
                        Showing {indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, filteredTasks.length)} of {filteredTasks.length} entries
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="p-2 border border-black/5 rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-[12px] font-black transition-all ${currentPage === i + 1 ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="p-2 border border-black/5 rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskQueue;

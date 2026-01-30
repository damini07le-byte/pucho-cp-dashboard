import React from 'react';
import { Zap, Clock, CheckCircle, RefreshCw, AlertCircle, PlayCircle } from 'lucide-react';

const workflows = [
    { id: 'WF1', name: 'Data Sync (Excel → GSheets)', status: 'Idle', lastRun: '2025-01-01 08:00', frequency: 'Monthly' },
    { id: 'WF2', name: 'Task Generator', status: 'Completed', lastRun: '2025-01-24 08:00', frequency: 'Daily 8:00 AM' },
    { id: 'WF3', name: 'Task Scheduler', status: 'Completed', lastRun: '2025-01-24 08:30', frequency: 'Daily 8:30 AM' },
    { id: 'WF4', name: 'Email Sender', status: 'Running', lastRun: '2025-01-24 09:00', frequency: '9 AM & 5 PM' },
    { id: 'WF5', name: 'WhatsApp Sender', status: 'Queued', lastRun: '2025-01-24 09:15', frequency: '9 AM & 5 PM' },
    { id: 'WF6', name: 'Voice Caller', status: 'Scheduled', lastRun: '2025-01-23 17:00', frequency: '9 AM & 5 PM' },
    { id: 'WF7', name: 'Outcome Processor', status: 'Running', lastRun: 'Continuous', frequency: 'Real-time' },
    { id: 'WF8', name: 'Follow-up Scheduler', status: 'Idle', lastRun: 'On-demand', frequency: 'As needed' },
    { id: 'WF9', name: 'DND Manager', status: 'Idle', lastRun: 'On-demand', frequency: 'Real-time' },
    { id: 'WF10', name: 'Data Quality Reporter', status: 'Scheduled', lastRun: '2025-01-20 08:00', frequency: 'Weekly' },
];

const StatusBadge = ({ status }) => {
    const styles = {
        'Running': 'bg-green-100 text-green-700 border-green-200',
        'Completed': 'bg-blue-100 text-blue-700 border-blue-200',
        'Queued': 'bg-amber-100 text-amber-700 border-amber-200',
        'Scheduled': 'bg-purple-100 text-purple-700 border-purple-200',
        'Idle': 'bg-gray-100 text-gray-500 border-gray-200',
        'Failed': 'bg-red-100 text-red-700 border-red-200',
    };

    return (
        <span className={`px-4 py-1.5 rounded-full text-[12px] font-black border ${styles[status]}`}>
            {status.toUpperCase()}
        </span>
    );
};

const WorkflowMonitor = () => {
    const [wfStates, setWfStates] = React.useState(workflows);

    const handleRunWf = (id) => {
        setWfStates(prev => prev.map(wf =>
            wf.id === id ? { ...wf, status: 'Running' } : wf
        ));

        // Simulate completion after 5 seconds
        setTimeout(() => {
            setWfStates(prev => prev.map(wf =>
                wf.id === id ? { ...wf, status: 'Completed', lastRun: 'Just now' } : wf
            ));
        }, 5000);
    };

    return (
        <div className="bg-white p-6 rounded-[32px] border border-black/5 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                        <Zap size={20} fill="currentColor" />
                    </div>
                    <h2 className="text-lg font-bold">Pucho AI Studio Workflows</h2>
                </div>
                <button
                    onClick={() => setWfStates(workflows)}
                    className="text-sm font-black text-purple-600 hover:underline flex items-center gap-2"
                >
                    <RefreshCw size={14} />
                    Reset All
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wfStates.map((wf) => (
                    <div key={wf.id} className="p-6 rounded-[28px] bg-gray-50/50 border border-transparent hover:border-purple-200 hover:bg-white hover:shadow-lg transition-all group relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[12px] font-black text-gray-300 group-hover:text-purple-400">{wf.id}</span>
                            <div className="flex items-center gap-3">
                                <StatusBadge status={wf.status} />
                                {wf.status !== 'Running' && (
                                    <button
                                        onClick={() => handleRunWf(wf.id)}
                                        className="p-2 rounded-full hover:bg-purple-50 text-gray-300 hover:text-purple-600 transition-colors"
                                    >
                                        <PlayCircle size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <h3 className="text-[15px] font-black text-[#111935] mb-2">{wf.name}</h3>
                        <div className="flex items-center justify-between text-[12px] font-bold text-gray-400">
                            <div className="flex items-center gap-2">
                                <Clock size={12} />
                                {wf.frequency}
                            </div>
                            <span>Last: {wf.lastRun}</span>
                        </div>
                        {wf.status === 'Running' && (
                            <div className="absolute bottom-0 left-0 h-1 bg-purple-600 animate-[loading_5s_linear_infinite]" style={{ width: '100%' }}></div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WorkflowMonitor;

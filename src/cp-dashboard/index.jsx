import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ActionButtons from './components/ActionButtons';
import StatCards from './components/StatCards';
import ActivityList from './components/ActivityList';
import WorkflowMonitor from './components/WorkflowMonitor';
import TaskQueue from './components/TaskQueue';
import { OutcomeDistribution, HourlyActivity } from './components/Charts';
import BrandDNADashboard from './components/BrandDNADashboard';
import DailyLedger from './components/DailyLedger';
import StockPosition from './components/StockPosition';
import PendingDues from './components/PendingDues';
import { getInitialTasks, fetchTasksFromSheet, convertToCsvUrl } from './utils/dataService';

const CPDashboard = () => {
    const [activeSection, setActiveSection] = useState('Overview');
    const [customers, setCustomers] = useState([]);
    const [tasks, setTasks] = useState(getInitialTasks());
    const [isSyncing, setIsSyncing] = useState(false);
    const [isCampaignRunning, setIsCampaignRunning] = useState(false);

    // Default URLs (Published CSVs for Netlify compatibility)
    const CUSTOMER_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRJn480F_uTcZeXSQBSAh1A1tKpnAjk_9RNS31SdlK4PCfTyL6LFaRbPvCXCzqwh8v-m5DwKxZzGAzF/pub?gid=0&single=true&output=csv';
    const TASK_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRJn480F_uTcZeXSQBSAh1A1tKpnAjk_9RNS31SdlK4PCfTyL6LFaRbPvCXCzqwh8v-m5DwKxZzGAzF/pub?gid=113319197&single=true&output=csv';

    const [sheetUrl, setSheetUrl] = useState(localStorage.getItem('pucho_sheet_url') || TASK_SHEET_URL);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Initial sync and setup polling
    React.useEffect(() => {
        const initialSync = async () => {
            await handleSyncData(CUSTOMER_SHEET_URL, true, 'customers');
            await handleSyncData(TASK_SHEET_URL, true, 'tasks');
        };
        initialSync();

        const interval = setInterval(() => {
            if (!isSyncing) {
                console.log('Auto-syncing both sheets...');
                handleSyncData(CUSTOMER_SHEET_URL, true, 'customers');
                handleSyncData(TASK_SHEET_URL, true, 'tasks');
            }
        }, 10000); // Poll every 10 seconds

        return () => clearInterval(interval);
    }, []);

    const handleSyncData = async (url, silent = false, type = 'tasks') => {
        const targetUrl = url || sheetUrl;
        if (!silent) setIsSyncing(true);

        try {
            const newData = await fetchTasksFromSheet(targetUrl);
            if (newData && newData.length > 0) {
                if (type === 'customers') {
                    setCustomers(newData);
                } else {
                    setTasks(newData);
                    if (!silent && url) {
                        localStorage.setItem('pucho_sheet_url', url);
                        setSheetUrl(url);
                    }
                }
            }
        } catch (error) {
            console.error(`Error syncing ${type}:`, error);
        }

        if (!silent) setIsSyncing(false);
    };

    const handleUpdateTaskStatus = (taskId, newStatus) => {
        setTasks(prev => prev.map(task =>
            task.id === taskId ? { ...task, status: newStatus, time: 'Just now' } : task
        ));
    };

    const handleTriggerCampaign = async () => {
        if (isCampaignRunning) return;
        setIsCampaignRunning(true);
        setTasks(prev => prev.map(task =>
            task.status === 'Pending' ? { ...task, status: 'In Progress', time: 'Starting now...' } : task
        ));
        setIsCampaignRunning(false);
    };

    const handleRunCampaign = (channel) => {
        setTasks(prev => prev.map(task =>
            (channel === 'All' || task.channel === channel) && task.status === 'Pending'
                ? { ...task, status: 'In Progress', time: 'Starting now...' }
                : task
        ));
        setTimeout(() => {
            setTasks(prev => prev.map(task =>
                (channel === 'All' || task.channel === channel) && task.status === 'In Progress'
                    ? { ...task, status: 'Done', time: 'Just now' }
                    : task
            ));
        }, 3000);
    };

    const getFilteredData = (data) => {
        const search = searchTerm.toLowerCase();
        return data.filter(item =>
            item.customer?.toLowerCase().includes(search) ||
            item.org?.toLowerCase().includes(search) ||
            item.organization?.toLowerCase().includes(search) ||
            item.name?.toLowerCase().includes(search) ||
            item.id?.toString().toLowerCase().includes(search) ||
            item.mobile?.toLowerCase().includes(search)
        );
    };

    return (
        <div className="flex min-h-screen bg-[#f8f9fc] font-['Space_Grotesk'] text-[#111935] overflow-x-hidden">
            {/* Sidebar remains fixed */}
            <Sidebar
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className={`flex-1 transition-all duration-300 min-w-0 ${isSidebarOpen ? 'lg:ml-[260px]' : 'lg:ml-[260px]'} p-4 md:p-8`}>
                {/* Header at the top */}
                <Header
                    onSync={handleSyncData}
                    isSyncing={isSyncing}
                    initialUrl={sheetUrl}
                    onSearch={(term) => setSearchTerm(term)}
                    onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                />

                {/* Quick Actions */}
                <ActionButtons onRun={handleRunCampaign} />

                {/* Primary Stats Dashboard */}
                {activeSection === 'Overview' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <StatCards tasks={tasks} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <OutcomeDistribution tasks={tasks} />
                            <ActivityList tasks={tasks} />
                        </div>
                    </div>
                )}

                {activeSection === 'Tasks' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <TaskQueue
                            tasks={getFilteredData(tasks)}
                            onUpdateStatus={handleUpdateTaskStatus}
                            onTriggerCampaign={handleTriggerCampaign}
                            isCampaignRunning={isCampaignRunning}
                            view="tasks"
                        />
                    </div>
                )}

                {activeSection === 'Customers' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <TaskQueue
                            tasks={getFilteredData(customers)}
                            onUpdateStatus={handleUpdateTaskStatus}
                            view="customers"
                            onTriggerCampaign={handleTriggerCampaign}
                            isCampaignRunning={isCampaignRunning}
                        />
                    </div>
                )}

                {activeSection === 'Workflows' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <WorkflowMonitor />
                    </div>
                )}

                {activeSection === 'Reports' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <OutcomeDistribution tasks={tasks} />
                        <ActivityList tasks={tasks} />
                    </div>
                )}

                {activeSection === 'Ledger' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <DailyLedger />
                    </div>
                )}

                {activeSection === 'Stock' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <StockPosition />
                    </div>
                )}

                {activeSection === 'Dues' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <PendingDues />
                    </div>
                )}

                {activeSection === 'BrandDNA' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <BrandDNADashboard />
                    </div>
                )}
            </main>
        </div>
    );
};

export default CPDashboard;

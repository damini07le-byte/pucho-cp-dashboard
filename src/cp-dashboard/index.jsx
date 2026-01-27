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

const CPDashboard = () => {
    const [activeSection, setActiveSection] = useState('Overview');

    return (
        <div className="flex min-h-screen bg-[#f8f9fc] font-['Space_Grotesk'] text-[#111935]">
            {/* Sidebar remains fixed */}
            <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

            <main className="flex-1 ml-[240px] p-8">
                {/* Header at the top */}
                <Header />

                {/* Quick Actions */}
                <ActionButtons />

                {/* Primary Stats Dashboard */}
                {activeSection === 'Overview' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <StatCards />

                        <div className="grid grid-cols-12 gap-8">
                            {/* Left Column: Automation & Monitoring */}
                            <div className="col-span-12 lg:col-span-7 space-y-8">
                                <WorkflowMonitor />
                                <TaskQueue />
                            </div>

                            {/* Right Column: Visual Insights & Logs */}
                            <div className="col-span-12 lg:col-span-5 space-y-8">
                                <OutcomeDistribution />
                                <ActivityList />
                                <HourlyActivity />
                            </div>
                        </div>
                    </div>
                )}

                {activeSection === 'Tasks' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <TaskQueue />
                    </div>
                )}

                {activeSection === 'Workflows' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <WorkflowMonitor />
                    </div>
                )}

                {activeSection === 'BrandDNA' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <BrandDNADashboard />
                    </div>
                )}

                {/* Other sections can be added here */}
                {['Customers', 'Reports'].includes(activeSection) && (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400 bg-white rounded-[40px] border border-dashed border-gray-200">
                        <p className="font-bold">Module "{activeSection}" is currently being automated.</p>
                        <p className="text-sm">Refer to the Pucho AI Studio roadmap for sync status.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CPDashboard;

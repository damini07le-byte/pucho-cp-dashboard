import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../../assets/pucho_logo_sidebar_v2.png';
import HomeIcon from '../../assets/icons/home.svg';
import AgentsIcon from '../../assets/icons/agents.svg';
import FlowsIcon from '../../assets/icons/flows.svg';
import ActivityIcon from '../../assets/icons/activity.svg';
import McpIcon from '../../assets/icons/mcp.svg';
import LogoutIcon from '../../assets/icons/logout.svg';

const Sidebar = ({ activeSection, setActiveSection }) => {
    const menuItems = [
        { name: 'Overview', icon: HomeIcon, id: 'Overview' },
        { name: 'Tasks', icon: ActivityIcon, id: 'Tasks' },
        { name: 'Customers', icon: AgentsIcon, id: 'Customers' },
        { name: 'Workflows', icon: FlowsIcon, id: 'Workflows' },
        { name: 'Reports', icon: McpIcon, id: 'Reports' },
    ];

    return (
        <aside className="w-[240px] h-screen bg-white border-r border-gray-100 flex flex-col fixed inset-y-0 left-0 z-30 shadow-sm">
            <div className="pl-3 pt-3 pb-2">
                <div className="flex items-center gap-2">
                    <img src={logo} alt="Pucho" className="h-[34px] w-auto" />
                </div>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center gap-[10px] px-[12px] h-[40px] rounded-[22px] text-[14px] font-medium transition-all border ${activeSection === item.id
                            ? 'bg-[rgba(160,210,150,0.1)] border-transparent text-black'
                            : 'bg-transparent border-transparent text-black hover:border-[rgba(160,210,150,0.3)]'
                            }`}
                    >
                        <img src={item.icon} alt={item.name} className="w-5 h-5 opacity-100" />
                        <span className="truncate">{item.name}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-100 space-y-2">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-3xl text-[14px] font-medium text-red-600 hover:bg-red-50 transition-all">
                    <img src={LogoutIcon} alt="Logout" className="w-5 h-5 opacity-80" />
                    <span>Log out</span>
                </button>

                <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-gray-50 cursor-pointer">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="User" className="w-8 h-8 rounded-full bg-gray-100" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                        <p className="text-xs text-gray-500 truncate">admin@pucho.ai</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;

import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../../assets/logo.png';
import avatarsGrid from '../../assets/avatars_grid.png';
import HomeIcon from '../../assets/icons/home.svg';
import AgentsIcon from '../../assets/icons/agents.svg';
import FlowsIcon from '../../assets/icons/flows.svg';
import ActivityIcon from '../../assets/icons/activity.svg';
import McpIcon from '../../assets/icons/mcp.svg';
import LogoutIcon from '../../assets/icons/logout.svg';

const Sidebar = ({ activeSection, setActiveSection, isOpen, onClose }) => {
    const menuItems = [
        { name: 'Overview', icon: HomeIcon, id: 'Overview' },
        { name: 'Tasks', icon: ActivityIcon, id: 'Tasks' },
        {
            name: 'Daily Ledger',
            id: 'Ledger',
            customIcon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
            )
        },
        {
            name: 'Stock Position',
            id: 'Stock',
            customIcon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                    <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
                </svg>
            )
        },
        {
            name: 'Pending Dues',
            id: 'Dues',
            customIcon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
            )
        },
        {
            name: 'Brand DNA',
            id: 'BrandDNA',
            customIcon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3c.5 0 2.5 2 2.5 4s-2 4-2.5 4-2.5-2-2.5-4 2-4 2.5-4z" />
                    <path d="M16 21c-.5 0-2.5-2-2.5-4s2-4 2.5-4 2.5 2 2.5 4-2 4-2.5 4z" />
                    <path d="M4.5 6.5c.5-.5 3-1 3.5 0" />
                    <path d="M16 17.5c.5-.5 3-1 3.5 0" />
                    <circle cx="12" cy="12" r="10" />
                </svg>
            )
        },
        { name: 'Customers', icon: AgentsIcon, id: 'Customers' },
        {
            name: 'Workflows',
            id: 'Workflows',
            customIcon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" cy="11" width="4" height="4" rx="1" />
                    <rect x="17" cy="11" width="4" height="4" rx="1" />
                    <rect x="10" cy="3" width="4" height="4" rx="1" />
                    <rect x="10" cy="17" width="4" height="4" rx="1" />
                    <path d="M7 13h3m4 0h3m-5-6v4m0 4v4" />
                </svg>
            )
        },
        {
            name: 'Reports',
            id: 'Reports',
            customIcon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                    <path d="M22 12A10 10 0 0 0 12 2v10z" />
                </svg>
            )
        },
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`w-[260px] h-screen bg-white border-r border-gray-100 flex flex-col fixed inset-y-0 left-0 z-50 shadow-xl lg:shadow-sm transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="pl-6 pt-6 pb-4">
                    <div className="flex items-center justify-between pr-4">
                        <img src={logo} alt="Pucho" className="h-[38px] w-auto" />
                        <button onClick={onClose} className="lg:hidden p-2 text-gray-400 hover:text-black">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveSection(item.id);
                                if (window.innerWidth < 1024) onClose();
                            }}
                            className={`w-full flex items-center gap-[12px] px-[16px] h-[48px] rounded-[24px] text-[15px] font-semibold transition-all border ${activeSection === item.id
                                ? 'bg-[#A0D296]/10 border-transparent text-[#5a8052]'
                                : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-50 hover:text-black'
                                }`}
                        >
                            <div className={`transition-colors flex-shrink-0 ${activeSection === item.id ? 'text-[#5a8052]' : 'text-gray-400'}`}>
                                {item.customIcon ? (
                                    item.customIcon
                                ) : (
                                    <img src={item.icon} alt={item.name} className={`w-5 h-5 ${activeSection === item.id ? 'brightness-0' : 'opacity-70'}`} />
                                )}
                            </div>
                            <span className="truncate">{item.name}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-gray-100 space-y-3">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-3xl text-[15px] font-bold text-red-500 hover:bg-red-50 transition-all">
                        <img src={LogoutIcon} alt="Logout" className="w-5 h-5 opacity-80" />
                        <span>Log out</span>
                    </button>

                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50/50 hover:bg-gray-50 cursor-pointer transition-colors border border-black/5">
                        <div
                            className="w-10 h-10 rounded-full bg-gray-100 border border-black/5 flex-shrink-0"
                            style={{
                                backgroundImage: `url(${avatarsGrid})`,
                                backgroundSize: '900%',
                                backgroundPosition: '37.5% 0%',
                                backgroundRepeat: 'no-repeat'
                            }}
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#111935] truncate">Admin User</p>
                            <p className="text-xs text-gray-400 font-medium truncate">admin@pucho.ai</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;

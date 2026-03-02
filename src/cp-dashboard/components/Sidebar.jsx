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

    const menuGroups = [
        {
            group: 'Main Menu',
            items: [
                { name: 'Overview', icon: HomeIcon, id: 'Overview' },
                {
                    name: 'Clients',
                    id: 'Clients',
                    customIcon: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    )
                },
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
                { name: 'License Renewal', icon: AgentsIcon, id: 'Customers' },
                {
                    name: 'Tally Hub',
                    id: 'TallyHub',
                    customIcon: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v20" /><path d="m17 5-5-3-5 3" /><path d="m17 19-5 3-5-3" /><path d="M2 12h20" /><path d="m5 7-3 5 3 5" /><path d="m19 7 3 5-3 5" />
                        </svg>
                    )
                },
                {
                    name: 'User Management',
                    id: 'UserManagement',
                    customIcon: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
                        </svg>
                    )
                }
            ]
        },
        {
            group: 'Settings',
            items: [
                {
                    name: 'Workspace Settings',
                    id: 'WorkspaceSettings',
                    customIcon: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                    )
                },
                {
                    name: 'Integrations',
                    id: 'Integrations',
                    customIcon: (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" />
                        </svg>
                    )
                }
            ]
        }

        < nav className = "flex-1 px-4 py-4 space-y-6 overflow-y-auto custom-scrollbar" >
        {
            menuGroups.map((group, groupIdx) => (
                <div key={groupIdx}>
                    {group.group !== 'Main Menu' && (
                        <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 ml-1">
                            {group.group}
                        </h3>
                    )}
                    <div className="space-y-1.5">
                        {group.items.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveSection(item.id);
                                    if (window.innerWidth < 1024) onClose();
                                }}
                                className={`w-full flex items-center gap-[12px] px-[16px] h-[48px] rounded-[24px] text-[14px] font-bold transition-all border ${activeSection === item.id
                                    ? 'bg-blue-50 border-transparent text-blue-600 shadow-sm'
                                    : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-50 hover:text-black'
                                    }`}
                            >
                                <div className={`transition-colors flex-shrink-0 ${activeSection === item.id ? 'text-blue-600' : 'text-gray-400'}`}>
                                    {item.customIcon ? (
                                        item.customIcon
                                    ) : (
                                        <img src={item.icon} alt={item.name} className={`w-5 h-5 ${activeSection === item.id ? 'brightness-0' : 'opacity-70'}`} />
                                    )}
                                </div>
                                <span className="truncate">{item.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ))
        }
                </nav >

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
            </aside >
        </>
    );
};

export default Sidebar;

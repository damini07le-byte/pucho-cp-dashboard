import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import SearchIcon from '../../assets/icons/search.svg';
import BellIcon from '../../assets/icons/bell.png';

const Header = () => {
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    return (
        <header className="flex items-center justify-between mb-8">
            <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-[#111935] mb-1">Dashboard Overview</h1>
                <p className="text-sm text-gray-400 font-medium">Real-time communication metrics and insights</p>
            </div>

            <div className="flex items-center gap-4">
                <div className={`flex items-center h-[44px] w-[320px] bg-white rounded-full border transition-all ${isSearchFocused ? 'border-[#B56FFF] shadow-[0px_0px_0px_3px_#DBD4FB]' : 'border-black/5 hover:border-[#B56FFF]'
                    }`}>
                    <div className="flex items-center justify-center w-9 h-9 ml-1 bg-[#A0D296]/10 rounded-full">
                        <img src={SearchIcon} alt="Search" className="w-4 h-4" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search customers, tasks..."
                        className="flex-1 bg-transparent px-2 outline-none text-sm text-[#111935]"
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                    />
                </div>

                <button className="w-11 h-11 bg-white rounded-full border border-black/5 flex items-center justify-center relative">
                    <img src={BellIcon} alt="Notifications" className="w-5 h-5 opacity-70" />
                    <span className="absolute top-3.5 right-3.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                </button>

                <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                    <div className="text-right">
                        <p className="text-xs font-bold leading-tight">Customer Communication</p>
                        <p className="text-[10px] font-medium text-gray-400">Hub</p>
                    </div>
                    <div className="w-9 h-9 rounded-[10px] bg-purple-50 flex items-center justify-center text-purple-600">
                        <Activity className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

import React, { useState } from 'react';
import { Activity, Menu } from 'lucide-react';
import SearchIcon from '../../assets/icons/search.svg';
import BellIcon from '../../assets/icons/bell.png';

const Header = ({ onSync, isSyncing, initialUrl, onSearch, onMenuToggle }) => {
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [sheetUrl, setSheetUrl] = useState(initialUrl || '');

    // Sync input when prop changes (e.g. from localStorage)
    React.useEffect(() => {
        if (initialUrl) setSheetUrl(initialUrl);
    }, [initialUrl]);

    return (
        <header className="flex flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4 shrink-0">
                <button
                    onClick={onMenuToggle}
                    className="lg:hidden p-2 bg-white rounded-xl border border-black/5 text-[#111935] hover:bg-gray-50"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-[#111935] whitespace-nowrap">Dashboard Overview</h1>
                    {initialUrl && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 border border-green-100 rounded-full animate-pulse">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                            <span className="text-[10px] font-bold text-green-600 uppercase tracking-tighter whitespace-nowrap">Live</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4 min-w-0 flex-1 justify-end">
                {/* Google Sheet Sync Input */}
                <div className="flex items-center h-[48px] bg-white rounded-full border border-black/5 p-1 gap-2 shrink-0">
                    <input
                        type="text"
                        placeholder="Paste Google Sheet URL here..."
                        value={sheetUrl}
                        onChange={(e) => setSheetUrl(e.target.value)}
                        className="bg-transparent px-6 outline-none text-[13px] w-48 xl:w-64 font-bold text-[#111935]"
                    />
                    <button
                        onClick={() => onSync(sheetUrl)}
                        disabled={isSyncing}
                        className={`h-full px-6 rounded-full text-[12px] font-black text-white transition-all shadow-sm ${isSyncing ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 active:scale-95'
                            }`}
                    >
                        {isSyncing ? 'Syncing...' : 'Sync Sheet'}
                    </button>
                </div>

                <div
                    className={`flex items-center h-[48px] bg-white rounded-full border transition-all duration-300 ${isSearchFocused ? 'border-purple-400 shadow-lg flex-1 max-w-[400px]' : 'border-black/5 w-[200px] xl:w-[320px]'
                        }`}
                >
                    <div className="flex items-center justify-center w-8 h-8 ml-1 bg-[#A0D296]/10 rounded-full shrink-0">
                        <img src={SearchIcon} alt=" search" className="w-4 h-4 opacity-70" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="flex-1 bg-transparent px-3 outline-none text-[13px] font-bold text-[#111935] min-w-0"
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        onChange={(e) => onSearch && onSearch(e.target.value)}
                    />
                </div>
            </div>
        </header>
    );
};

export default Header;

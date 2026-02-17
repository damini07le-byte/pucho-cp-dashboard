import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, RefreshCw, User, X, MessageSquare, Mail,
    PhoneCall, ArrowUpRight, Clock, CheckCircle2, BellOff,
    ChevronRight, Calendar, ShieldCheck, AlertCircle
} from 'lucide-react';

const MASTER_DATA_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRJn480F_uTcZeXSQBSAh1A1tKpnAjk_9RNS31SdlK4PCfTyL6LFaRbPvCXCzqwh8v-m5DwKxZzGAzF/pub?gid=0&single=true&output=csv';
const RENEWAL_ENGINE_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRJn480F_uTcZeXSQBSAh1A1tKpnAjk_9RNS31SdlK4PCfTyL6LFaRbPvCXCzqwh8v-m5DwKxZzGAzF/pub?gid=693626076&single=true&output=csv';

const LicenseRenewal = () => {
    const [masterData, setMasterData] = useState([]);
    const [renewalEngineData, setRenewalEngineData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const parseCSVResponse = (csvText) => {
        const rows = [];
        let currentRow = [];
        let currentField = '';
        let inQuotes = false;
        for (let i = 0; i < csvText.length; i++) {
            const char = csvText[i];
            if (char === '"') {
                if (inQuotes && csvText[i + 1] === '"') { currentField += '"'; i++; }
                else inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                currentRow.push(currentField.trim());
                currentField = '';
            } else if (char === '\r' || char === '\n') {
                if (inQuotes) currentField += char;
                else if (currentRow.length > 0 || currentField.length > 0) {
                    currentRow.push(currentField.trim());
                    rows.push(currentRow);
                    currentRow = [];
                    currentField = '';
                    if (char === '\r' && csvText[i + 1] === '\n') i++;
                }
            } else currentField += char;
        }
        if (currentRow.length > 0 || currentField.length > 0) {
            currentRow.push(currentField.trim());
            rows.push(currentRow);
        }
        const headers = (rows[0] || []).map(h => h.trim());
        return rows.slice(1).map(row => {
            const obj = {};
            headers.forEach((h, i) => obj[h] = row[i]?.trim() || '');
            return obj;
        });
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [mRes, rRes] = await Promise.all([
                fetch(MASTER_DATA_URL).then(r => r.text()),
                fetch(RENEWAL_ENGINE_URL).then(r => r.text())
            ]);
            setMasterData(parseCSVResponse(mRes).filter(r => r['Org Name'] && r['Org Name'].length > 2));
            setRenewalEngineData(parseCSVResponse(rRes));
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchData();
        // AUTO-POLLING: Fetch fresh data every 10 seconds
        const interval = setInterval(() => {
            fetchData();
        }, 10000);

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    // FUTURE-PROOF ROBUST PARSER
    const parseMultipleLogs = (logStr) => {
        if (!logStr || logStr === 'N/A' || logStr === 'NA' || typeof logStr !== 'string') return [];
        let cleaned = logStr.replace(/\[?object Object\]?/g, '').trim();
        if (!cleaned || cleaned.length < 5) return [];

        // Universal Splitter: Handles timestamps [DD/MM/YYYY] or any variations
        const pieces = cleaned.split(/(?=\[?\d{2}[/\-]\d{2}[/\-]\d{4},?)/).map(e => e.trim()).filter(e => e.length > 5);

        return pieces.map(piece => {
            const dateMatch = piece.match(/\[(\d{2}\/\d{2}\/\d{4},?\s?\d{2}:\d{2}\s?[ap]m)\]/i);
            const ts = dateMatch ? dateMatch[1] : 'Update';
            let content = piece.replace(/\[\d{2}\/\d{2}\/\d{4},?\s?\d{2}:\d{2}\s?[ap]m\]/i, '').trim();

            // Check for Voice Conversation
            if (/CHAT_LOG|CALL RECORD|VOICE/i.test(content)) {
                let [header, chat] = content.split(/CHAT_LOG:/i);

                // Extract structured indicators
                const st = header.match(/STATUS:\s*([^|\n]*)/i)?.[1]?.trim();
                const snt = header.match(/SENTIMENT:\s*([^|\n]*)/i)?.[1]?.trim();
                const int = header.match(/INTENT:\s*([^|\n]*)/i)?.[1]?.trim();
                const sum = header.match(/SUMMARY:\s*([^|\n]*)/i)?.[1]?.trim() || header.replace(/CALL RECORD|STATUS:|SENTIMENT:|INTENT:|SUMMARY:|[-|_|=]/gi, '').trim();

                const conversation = [];
                if (chat) {
                    // Split into Agent/Customer turns reliably
                    const turns = chat.split(/(CUSTOMER|AI AGENT|AGENT|AI|USER):/i).slice(1);
                    for (let i = 0; i < turns.length; i += 2) {
                        const roleLabel = turns[i]?.toUpperCase() || 'AGENT';
                        let text = turns[i + 1]?.replace(/[👤🤖🤡\u2500-\u257F]|[-|_|=]{3,}/g, '').trim();
                        if (text) conversation.push({
                            role: roleLabel.includes('CUSTOMER') || roleLabel.includes('USER') ? 'CUSTOMER' : 'AGENT',
                            text
                        });
                    }
                }
                return { ts, type: 'voice', summary: sum, status: st, sentiment: snt, intent: int, conversation: conversation.length > 0 ? conversation : null, content: content.replace(/CHAT_LOG:/gi, '').trim() };
            }

            // Combo Parsing (WA + EM)
            const hasWA = /WHATSAPP/i.test(content);
            const hasEM = /EMAIL|MAIL/i.test(content);

            if (hasWA || hasEM) {
                let waPart = '', emPart = '';
                if (hasWA && hasEM) {
                    const splitIdx = content.search(/📧|EMAIL|MAIL/i);
                    waPart = content.substring(0, splitIdx);
                    emPart = content.substring(splitIdx);
                } else if (hasWA) { waPart = content; } else { emPart = content; }

                const cleanWA = waPart.replace(/^.*?WHATSAPP.*?(SENT:|MESSAGE:|:)/si, '').replace(/✅|SENT|📲|[\u2500-\u257F]|[-|_|=]{3,}/g, '').trim();

                let subject = 'Renewal Update', body = '';
                let emClean = emPart.replace(/^.*?EMAIL.*?(SENT:|:)/si, '').replace(/✅|SENT|📧|[\u2500-\u257F]|[-|_|=]{3,}/g, '').trim();

                if (emClean.includes('|')) {
                    const parts = emClean.split('|');
                    subject = parts[0].replace(/SUB:|SUBJECT:|Sub:|TITLE:/gi, '').trim();
                    body = parts.slice(1).join('|').replace(/BODY:|Body:/gi, '').trim();
                } else {
                    body = emClean;
                }
                return { ts, isCombo: true, wa: cleanWA ? { message: cleanWA } : null, em: body ? { subject, body } : null };
            }

            return { ts, isCombo: false, content: content.replace(/[\u2500-\u257F]|[-|_|=]{3,}/g, '').trim() };
        });
    };

    const calculateDays = (d) => {
        if (!d || d === 'N/A') return 'N/A';
        const target = new Date(d);
        if (isNaN(target.getTime())) return 'N/A';
        const today = new Date(); today.setHours(0, 0, 0, 0);
        return Math.ceil((target - today) / 86400000);
    };

    const filtered = masterData.filter(c =>
        (c['Org Name'] || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c['Serial Number'] || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white p-6 rounded-[32px] space-y-6">
            <div className="flex justify-between items-center bg-gray-50/50 p-4 rounded-3xl border border-gray-100/50">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#1e293b] text-white flex items-center justify-center shadow-md"><Calendar size={20} /></div>
                    <div>
                        <h2 className="text-lg font-black text-[#1e293b] tracking-tight uppercase">Renewal Dashboard</h2>
                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1"><span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" /> Live Sheet Linked</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input type="text" placeholder="Search Customer..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl focus:ring-1 focus:ring-blue-500 font-bold text-xs shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <button onClick={fetchData} className="p-2.5 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 shadow-sm"><RefreshCw size={16} className={`${loading ? 'animate-spin' : ''} text-[#1e293b]`} /></button>
                </div>
            </div>

            <div className="space-y-4">
                {filtered.map(customer => {
                    const days = calculateDays(customer['Expiry Date to Type'] || customer['Expiry Date']);
                    return (
                        <motion.div key={customer['Serial Number']} className="bg-white rounded-[28px] p-5 border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-xl transition-all group flex items-center justify-between cursor-pointer" onClick={() => {
                            const logs = renewalEngineData.find(r => String(r['Serial Number']).trim() === String(customer['Serial Number']).trim());
                            setSelectedCustomer({ ...customer, renewalLogs: logs });
                        }}>
                            <div className="flex items-center gap-6 flex-1">
                                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:bg-blue-600 transition-all duration-300"><User size={26} className="text-gray-400 group-hover:text-white" /></div>
                                <div className="space-y-1">
                                    <h3 className="text-base font-black text-[#1e293b] group-hover:text-blue-700">{customer['Org Name']}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-[10px] bg-gray-50 px-2 py-0.5 rounded border font-bold text-gray-400">SN: {customer['Serial Number']}</span>
                                        <span className="text-[10px] bg-purple-50 px-2 py-0.5 rounded border border-purple-100 font-bold text-purple-600 uppercase tracking-tighter">{customer['Product']}</span>
                                        {(customer['Mobile'] || customer['Mobile Number']) && (
                                            <span className="text-[10px] bg-green-50 px-2 py-0.5 rounded border border-green-100 font-bold text-green-600 flex items-center gap-1">
                                                <PhoneCall size={10} /> {customer['Mobile'] || customer['Mobile Number']}
                                            </span>
                                        )}
                                        {(customer['Email'] || customer['Email ID']) && (
                                            <span className="text-[10px] bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-bold text-blue-600 flex items-center gap-1">
                                                <Mail size={10} /> {customer['Email'] || customer['Email ID']}
                                            </span>
                                        )}
                                        <span className="text-[10px] bg-amber-50 px-2 py-0.5 rounded border border-amber-100 font-bold text-amber-600 flex items-center gap-1">
                                            <Calendar size={10} /> {customer['Expiry Date to Type'] || customer['Expiry Date']}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right px-10 border-x border-gray-50 min-w-[170px]"><p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Expires in</p><p className={`text-2xl font-black ${days <= 15 ? 'text-red-500' : 'text-green-600'}`}>{days} Days</p></div>
                            <div className="pl-10"><button className="px-6 py-3 bg-gray-50 text-[#1e293b] rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all font-black text-[10px] uppercase tracking-widest border border-gray-100 shadow-sm">Journal</button></div>
                        </motion.div>
                    );
                })}
            </div>

            <AnimatePresence>
                {selectedCustomer && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-hidden" onClick={() => setSelectedCustomer(null)}>
                        <motion.div initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 30 }} className="bg-white rounded-[40px] max-w-4xl w-full max-h-[88vh] overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                            <div className="bg-[#1e293b] text-white p-7 shrink-0 flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-[24px] bg-white/10 flex items-center justify-center border border-white/20"><User size={32} /></div>
                                    <div>
                                        <h3 className="text-2xl font-black uppercase leading-tight">{selectedCustomer['Org Name']}</h3>
                                        <div className="flex flex-wrap gap-3 mt-1.5 font-black uppercase text-[10px] tracking-widest opacity-60">
                                            <span>SN: {selectedCustomer['Serial Number']}</span>
                                            <span className="w-1 h-1 bg-white rounded-full mt-1.5 opacity-30" />
                                            <span>{selectedCustomer['Product']}</span>
                                            {(selectedCustomer['Mobile'] || selectedCustomer['Mobile Number']) && (
                                                <>
                                                    <span className="w-1 h-1 bg-white rounded-full mt-1.5 opacity-30" />
                                                    <span className="flex items-center gap-1"><PhoneCall size={10} /> {selectedCustomer['Mobile'] || selectedCustomer['Mobile Number']}</span>
                                                </>
                                            )}
                                            {(selectedCustomer['Email'] || selectedCustomer['Email ID']) && (
                                                <>
                                                    <span className="w-1 h-1 bg-white rounded-full mt-1.5 opacity-30" />
                                                    <span className="flex items-center gap-1"><Mail size={10} /> {selectedCustomer['Email'] || selectedCustomer['Email ID']}</span>
                                                </>
                                            )}
                                            <span className="w-1 h-1 bg-white rounded-full mt-1.5 opacity-30" />
                                            <span className="flex items-center gap-1 text-amber-400"><Calendar size={10} /> {selectedCustomer['Expiry Date to Type'] || selectedCustomer['Expiry Date']} ({calculateDays(selectedCustomer['Expiry Date to Type'] || selectedCustomer['Expiry Date'])} Days Left)</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
                            </div>
                            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/30">
                                <div className="space-y-12">
                                    {[
                                        { id: 'COMBO', title: 'First Reminder', med: 'WhatsApp + Email Outreach', col: 'blue', icon: <div className="flex -space-x-1"><MessageSquare size={12} className="text-green-600" /><Mail size={12} className="text-blue-600" /></div> },
                                        { id: 'FOLLOW_UP', title: 'Second Reminder', med: 'WhatsApp Follow-up', col: 'indigo', icon: <MessageSquare size={14} className="text-indigo-500" /> },
                                        { id: 'VOICE_CALL', title: 'Voice Agent Call', med: 'AI Assistant Conversation', col: 'red', icon: <PhoneCall size={14} className="text-red-500" /> },
                                        { id: 'ESCALATION', title: 'Third Reminder', med: 'Final Administrative Notice', col: 'orange', icon: <AlertCircle size={14} className="text-orange-500" /> },
                                        { id: 'OVERDUE', title: 'Service Expired', med: 'Restoration & Grace Period', col: 'red', icon: <ShieldCheck size={14} className="text-red-600" /> }
                                    ].map(s => {
                                        const logs = selectedCustomer.renewalLogs ? parseMultipleLogs(selectedCustomer.renewalLogs[s.id]) : [];
                                        if (logs.length === 0) return null;
                                        return (
                                            <div key={s.id} className="space-y-6">
                                                <div className="flex items-center gap-3 ml-2 opacity-30"><div className="w-1.5 h-1.5 rounded-full bg-gray-400" /><span className="text-[9px] font-black uppercase tracking-widest">{s.title}</span><div className="h-[1px] flex-1 bg-gray-200" /></div>
                                                {logs.map((l, i) => <CompactStage key={i} title={s.title} log={l} icon={s.icon} medium={s.med} color={s.col} />)}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="p-6 bg-white border-t border-gray-100 flex justify-between items-center"><div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest"><Clock size={14} /> Sequence Data Matched via Sync Engine</div><button onClick={() => setSelectedCustomer(null)} className="px-10 py-3 bg-gray-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">Dismiss</button></div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const CompactStage = ({ title, log, icon, medium, color }) => {
    const bg = { blue: 'bg-blue-50', indigo: 'bg-indigo-50', orange: 'bg-orange-50', red: 'bg-red-50' }[color] || 'bg-gray-50';
    const text = { blue: 'text-blue-600', indigo: 'text-indigo-600', orange: 'text-orange-600', red: 'text-red-600' }[color] || 'text-gray-600';
    return (
        <div className="p-7 bg-white rounded-[40px] border border-gray-100 shadow-sm space-y-5 hover:shadow-lg transition-all border-l-[6px] border-l-blue-500/10">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-3xl ${bg} flex items-center justify-center shadow-inner`}>{icon}</div>
                    <div>
                        <h5 className="font-black text-[#1e293b] text-[12px] uppercase tracking-tight leading-none">{title}</h5>
                        <p className={`text-[10px] font-black ${text} uppercase tracking-widest mt-1 opacity-70`}>{medium}</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[9px] font-black text-green-500 uppercase flex items-center gap-1.5 justify-end tracking-[0.2em]"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> RECORD SYNCED</span>
                    <p className="text-[10px] font-bold text-gray-300 uppercase mt-1.5 tracking-tighter tabular-nums">{log.ts}</p>
                </div>
            </div>

            {log.type === 'voice' ? (
                <div className="bg-[#1e293b] rounded-[32px] overflow-hidden shadow-2xl border border-white/5">
                    <div className="bg-white/5 p-4 px-6 border-b border-white/10 flex justify-between items-center">
                        <div className="flex gap-4">
                            {log.status && <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Status: <span className="text-blue-400">{log.status}</span></span>}
                            {log.sentiment && <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Sentiment: <span className="text-green-400">{log.sentiment}</span></span>}
                        </div>
                        <ShieldCheck size={14} className="text-white/20" />
                    </div>
                    <div className="p-7 space-y-6">
                        {log.summary && <div className="text-blue-200 text-[11px] font-bold italic leading-relaxed bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">Summary: {log.summary}</div>}
                        <div className="space-y-5">
                            {log.conversation ? log.conversation.map((turn, i) => (
                                <div key={i} className={`flex flex-col ${turn.role === 'AGENT' ? 'items-start' : 'items-end'}`}>
                                    <span className={`text-[8px] font-black uppercase mb-1.5 tracking-[0.2em] ${turn.role === 'AGENT' ? 'text-white/30 ml-3' : 'text-blue-400/50 mr-3'}`}>{turn.role === 'AGENT' ? 'AI ASSISTANT' : 'CUSTOMER'}</span>
                                    <div className={`px-6 py-4 rounded-3xl text-[12px] max-w-[88%] leading-relaxed shadow-xl ${turn.role === 'AGENT' ? 'bg-white/10 text-white border border-white/10 rounded-tl-none font-medium' : 'bg-blue-600/10 text-blue-100 border border-blue-600/30 rounded-tr-none italic'}`}>
                                        {turn.role === 'AGENT' ? '🤖 ' : '👤 '}{turn.text}
                                    </div>
                                </div>
                            )) : <div className="text-[11px] text-white/60 italic p-4">"{log.content}"</div>}
                        </div>
                    </div>
                </div>
            ) : log.isCombo ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {log.wa?.message && (
                        <div className="bg-green-50/30 p-6 rounded-[32px] border border-green-100/50 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-100 transition-opacity"><MessageSquare size={16} className="text-green-600" /></div>
                            <p className="text-[11.5px] text-gray-600 leading-relaxed font-medium italic relative z-10">"{log.wa.message}"</p>
                            <div className="mt-3 text-[8px] font-black text-green-600/40 uppercase tracking-widest">WhatsApp Message Payload</div>
                        </div>
                    )}
                    {log.em && (
                        <div className="bg-blue-50/20 rounded-[32px] border border-blue-100/40 overflow-hidden shadow-sm group">
                            <div className="bg-blue-600/90 px-5 py-2.5 text-white text-[10px] font-black truncate tracking-wide flex justify-between items-center">
                                <span>{log.em.subject}</span>
                                <Mail size={12} className="opacity-50" />
                            </div>
                            <div className="p-6 text-[11px] text-gray-500 leading-relaxed italic font-medium bg-white/50">{log.em.body}</div>
                        </div>
                    )}
                </div>
            ) : <div className="bg-gray-50/50 p-6 rounded-[32px] border border-gray-100 text-[12px] text-gray-600 italic font-medium leading-relaxed shadow-inner">"{log.content}"</div>}
        </div>
    );
};

export default LicenseRenewal;

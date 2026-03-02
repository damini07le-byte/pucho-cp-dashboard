import React, { useState } from 'react';
import { Settings, Save, Upload, Clock, Mail, Phone, CheckCircle2, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const WorkspaceSettings = () => {
    const [formData, setFormData] = useState({
        workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        startTime: '09:00',
        endTime: '18:00',
        email: 'admin@pucho.ai',
        phoneCode: '+91',
        phoneNumber: '9876543210',
        logoPreview: null
    });

    const [showToast, setShowToast] = useState(false);

    const handleDayToggle = (day) => {
        setFormData(prev => ({
            ...prev,
            workingDays: prev.workingDays.includes(day)
                ? prev.workingDays.filter(d => d !== day)
                : [...prev.workingDays, day]
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, logoPreview: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        // Here you would typically make an API call
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    return (
        <div className="bg-transparent p-2 space-y-6 max-w-5xl mx-auto w-full">

            {/* Header */}
            <div className="flex items-center gap-3 mb-8 px-2">
                <div className="w-12 h-12 rounded-2xl bg-[#111935] text-white flex items-center justify-center shadow-lg">
                    <Settings size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-[#111935] tracking-tight">Workspace Settings</h1>
                    <p className="text-sm font-semibold text-gray-400 mt-1">Configure your organization's core preferences</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Form Sections */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Business Hours Card */}
                    <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                            <Clock size={120} />
                        </div>

                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <Clock size={20} />
                            </div>
                            <h2 className="text-lg font-black text-[#111935]">Business Hours</h2>
                        </div>

                        <div className="space-y-8 relative z-10">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Working Days</label>
                                <div className="flex flex-wrap gap-2">
                                    {DAYS.map(day => (
                                        <button
                                            key={day}
                                            onClick={() => handleDayToggle(day)}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${formData.workingDays.includes(day)
                                                    ? 'bg-[#111935] text-white shadow-md'
                                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-[#111935] border border-gray-200'
                                                }`}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Opening Time</label>
                                    <input
                                        type="time"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-bold text-[#111935]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Closing Time</label>
                                    <input
                                        type="time"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#111935] outline-none transition-all text-sm font-bold text-[#111935]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information Card */}
                    <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                <MapPin size={20} />
                            </div>
                            <h2 className="text-lg font-black text-[#111935]">Contact Configuration</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Mail size={14} /> Notification Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="alerts@company.com"
                                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm font-bold text-[#111935]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Phone size={14} /> WhatsApp Number
                                </label>
                                <div className="flex gap-3">
                                    <select
                                        name="phoneCode"
                                        value={formData.phoneCode}
                                        onChange={handleInputChange}
                                        className="w-28 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm font-bold text-[#111935] appearance-none cursor-pointer"
                                    >
                                        <option value="+1">+1 (US)</option>
                                        <option value="+44">+44 (UK)</option>
                                        <option value="+91">+91 (IN)</option>
                                        <option value="+61">+61 (AU)</option>
                                    </select>
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        placeholder="Enter number"
                                        className="flex-1 px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all text-sm font-bold text-[#111935]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column: Logo & Actions */}
                <div className="space-y-6">

                    {/* Brand Logo Card */}
                    <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                                <Upload size={20} />
                            </div>
                            <h2 className="text-lg font-black text-[#111935]">Brand Logo</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="relative group">
                                <div className={`w-full aspect-square rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-6 transition-all ${formData.logoPreview ? 'border-transparent bg-gray-50' : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100 hover:border-gray-300'
                                    }`}>
                                    {formData.logoPreview ? (
                                        <div className="w-full h-full relative flex items-center justify-center">
                                            <img src={formData.logoPreview} alt="Logo Preview" className="max-w-full max-h-full object-contain drop-shadow-md rounded-xl" />
                                            <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                <span className="text-white text-xs font-bold bg-black/50 px-4 py-2 rounded-lg">Change Logo</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center space-y-3">
                                            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm text-gray-400 group-hover:text-[#111935] transition-colors">
                                                <Upload size={24} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-[#111935]">Upload Logo</p>
                                                <p className="text-xs font-semibold text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                                            </div>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept=".png,.jpg,.jpeg"
                                        onChange={handleLogoUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Card */}
                    <div className="bg-[#111935] rounded-[32px] p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[80px] opacity-20 transform translate-x-10 -translate-y-10" />

                        <div className="relative z-10 space-y-4">
                            <div>
                                <h3 className="text-white font-black text-lg">Ready to apply?</h3>
                                <p className="text-blue-200/60 text-xs font-medium mt-1">Changes take effect immediately across your workspace.</p>
                            </div>
                            <button
                                onClick={handleSave}
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-0.5"
                            >
                                <Save size={18} />
                                Save Configuration
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Success Toast */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 bg-gray-900 text-white rounded-2xl shadow-2xl border border-gray-800"
                    >
                        <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                            <CheckCircle2 size={18} />
                        </div>
                        <span className="text-sm font-bold tracking-wide">Workspace settings updated successfully</span>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default WorkspaceSettings;

import React, { useState, useRef, useEffect } from 'react';
import { Lightbulb, Palette, Image as ImageIcon, Upload, ChevronRight, Sparkles, Wand2, CheckCircle2, AlertCircle, Loader2, Download } from 'lucide-react';

// Webhook URLs - Update these from Pucho Studio for each flow
// --- Pucho Studio Webhooks (Synchronous) ---
// Note: /sync is required to get the return response body immediately.
const IDEAS_WEBHOOK = "https://studio.pucho.ai/api/v1/webhooks/6UYa63HjtO1gdN00bfSAH/sync";
const LAB_WEBHOOK = "https://studio.pucho.ai/api/v1/webhooks/QaKggyfSvb8ErEVSnYHQH/sync"; // Concept Lab
const CUSTOM_WEBHOOK = "https://studio.pucho.ai/api/v1/webhooks/WyQ1drLKJn5zEJFXicuOe/sync"; // Creative Studio

const BrandDNADashboard = () => {
    const [activeTab, setActiveTab] = useState('ideas');

    const [brandDNA, setBrandDNA] = useState({
        name: '',
        tagline: '',
        url: '',
        logo: '',
        shortDescription: '',
        longDescription: '',
        values: '',
        aesthetics: '',
        tone: '',
        campaignContext: ''
    });

    const [generatedIdeas, setGeneratedIdeas] = useState([]);
    const [selectedIdea, setSelectedIdea] = useState(null);
    const [brandLibrary, setBrandLibrary] = useState([]);
    const [selectedConcept, setSelectedConcept] = useState(null);

    const saveToLibrary = () => {
        if (!brandDNA.name) return;
        setBrandLibrary(prev => {
            const exists = prev.find(b => b.name === brandDNA.name);
            if (exists) {
                return prev.map(b => b.name === brandDNA.name ? brandDNA : b);
            }
            return [...prev, brandDNA];
        });
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setBrandDNA(prev => ({ ...prev, logo: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDownload = async (imgUrl, filename = 'pucho-concept.png') => {
        if (!imgUrl) return;
        try {
            const response = await fetch(imgUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback for CORS issues
            window.open(imgUrl, '_blank');
        }
    };

    const extractImages = (data) => {
        if (!data) return [];
        const images = [];
        const seen = new Set();

        // Regex to find potential image URLs in any string
        const urlRegex = /(https?:\/\/[^\s"'<>]+?\.(?:jpeg|jpg|gif|png|webp|svg)(?:\?[^\s"'<>]*)?|data:image\/[a-z]+;base64,[^\s"'<>]+|https?:\/\/pucho\.ai\/[^\s"'<>]+|https?:\/\/[^\s"'<>]*googleusercontent[^\s"'<>]*|https?:\/\/[^\s"'<>]*firebasestorage[^\s"'<>]*)/gi;

        const findImg = (obj) => {
            if (!obj) return;

            if (typeof obj === 'string') {
                const cleanStr = obj.trim();

                // 1. Check if the string itself is a URL (Permissive)
                const isLikelyUrl = (cleanStr.startsWith('http') || cleanStr.startsWith('data:image')) &&
                    (cleanStr.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) ||
                        cleanStr.includes('googleusercontent') ||
                        cleanStr.includes('pucho') ||
                        cleanStr.includes('blob:') ||
                        cleanStr.includes('firebasestorage') ||
                        cleanStr.includes('s3.amazonaws.com'));

                if (isLikelyUrl) {
                    if (!seen.has(cleanStr)) {
                        images.push(cleanStr);
                        seen.add(cleanStr);
                        return;
                    }
                }

                // 2. Search for URLs INSIDE the string (Regex)
                let match;
                while ((match = urlRegex.exec(cleanStr)) !== null) {
                    const foundUrl = match[0];
                    if (!seen.has(foundUrl)) {
                        images.push(foundUrl);
                        seen.add(foundUrl);
                    }
                }
            } else if (Array.isArray(obj)) {
                obj.forEach(findImg);
            } else if (typeof obj === 'object') {
                Object.values(obj).forEach(findImg);
            }
        };

        findImg(data);
        console.log("📸 [IMAGE EXTRACTOR] Total Unique Images Found:", images.length);
        return images;
    };


    const tabs = [
        { id: 'ideas', label: 'Idea Strategy', icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-50' },
        { id: 'lab', label: 'Concept Lab', icon: Palette, color: 'text-pucho-purple', bg: 'bg-purple-50' },
        { id: 'studio', label: 'Creative Studio', icon: ImageIcon, color: 'text-pucho-green', bg: 'bg-green-50' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#111935]">Brand DNA Creative Engine</h2>
                    <p className="text-gray-500 mt-1 text-sm md:text-base">Transforming brand identity into high-conversion marketing assets.</p>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm self-start">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${activeTab === tab.id
                                    ? `${tab.bg} ${tab.color} shadow-sm ring-1 ring-black/5`
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                    }`}
                            >
                                <Icon size={18} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {activeTab === 'ideas' && (
                    <IdeaStrategyView
                        brandDNA={brandDNA}
                        setBrandDNA={setBrandDNA}
                        generatedIdeas={generatedIdeas}
                        setGeneratedIdeas={setGeneratedIdeas}
                        selectedIdea={selectedIdea}
                        setSelectedIdea={(idea) => {
                            setSelectedIdea(idea);
                            setActiveTab('lab');
                        }}
                        brandLibrary={brandLibrary}
                        saveToLibrary={saveToLibrary}
                        onLogoUpload={handleLogoUpload}
                    />
                )}
                {activeTab === 'lab' && <ConceptLabView brandDNA={brandDNA} selectedIdea={selectedIdea} onDownload={handleDownload} extractImages={extractImages} onLogoUpload={handleLogoUpload} activeImage={selectedConcept} setActiveImage={setSelectedConcept} />}
                {activeTab === 'studio' && <CreativeStudioView brandDNA={brandDNA} selectedIdea={selectedIdea} onDownload={handleDownload} extractImages={extractImages} onLogoUpload={handleLogoUpload} selectedConcept={selectedConcept} />}
            </div>
        </div>
    );
};

// --- Step 1: Idea Strategy View ---
const IdeaStrategyView = ({
    brandDNA,
    setBrandDNA,
    generatedIdeas,
    setGeneratedIdeas,
    selectedIdea,
    setSelectedIdea,
    brandLibrary = [],
    saveToLibrary,
    onLogoUpload
}) => {
    const [status, setStatus] = useState('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [debugData, setDebugData] = useState(null);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setBrandDNA(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerateIdeas = async () => {
        console.log("🚀 [IDEA STRATEGY] Generate Button Clicked!");
        if (!brandDNA.name || brandDNA.name.trim() === '') {
            setStatus('error');
            setErrorMsg("Please enter a Brand Name (e.g. LuxeBrew) before starting.");
            return;
        }
        setStatus('loading');
        setErrorMsg('');
        setDebugData(null);

        // Exact payload keys derived from JSON flow prompt:
        // {{trigger['body']['brandName']}}
        // {{trigger['body']['brandDNA']['tagline']}}
        // {{trigger['body']['campaignContext']}}
        const payload = {
            brandName: brandDNA.name,
            brandDNA: {
                tagline: brandDNA.tagline,
                url: brandDNA.url,
                shortDescription: brandDNA.shortDescription,
                longDescription: brandDNA.longDescription,
                values: brandDNA.values,
                aesthetics: brandDNA.aesthetics,
                tone: brandDNA.tone,
                logo: brandDNA.logo
            },
            campaignContext: brandDNA.campaignContext || "General brand awareness campaign",
            requestId: `REQ_${Date.now()}` // Extra field for tracking
        };


        try {
            console.log("📡 [IDEA STRATEGY] Sending Request to:", IDEAS_WEBHOOK);
            console.log("📦 [IDEA STRATEGY] Payload:", payload);

            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 15000); // 15s timeout

            const response = await fetch(IDEAS_WEBHOOK, {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(id);

            console.log("⏱️ [IDEA STRATEGY] Fetch completed. Status:", response.status);


            if (response.ok) {
                const rawText = await response.text();
                console.log("📥 [IDEA STRATEGY] Raw Text Received:", rawText);

                let data;
                try {
                    // Try direct parse first
                    data = JSON.parse(rawText);
                } catch (e) {
                    console.warn("⚠️ [IDEA STRATEGY] Direct JSON parse failed, scavenging for blocks...");
                    // Scavenge for anything that looks like JSON array or object
                    const jsonMatch = rawText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
                    if (jsonMatch) {
                        try {
                            const cleanJson = jsonMatch[0].replace(/```json|```/g, '').trim();
                            data = JSON.parse(cleanJson);
                            console.log("✅ [IDEA STRATEGY] Scavenged JSON successfully");
                        } catch (innerE) {
                            console.error("❌ [IDEA STRATEGY] Scavenge failed:", innerE);
                            data = { body: rawText };
                        }
                    } else {
                        data = { body: rawText };
                    }
                }

                setDebugData(data); // Store for diagnostic display

                // --- Super Robust Parsing Logic ---
                let parsedData = data;

                // Studio often wraps the response in fields.body, data, or just body
                const possiblePaths = [
                    data.fields?.body,
                    data.data,
                    data.body,
                    data.output,
                    data.result,
                    data
                ];

                for (const path of possiblePaths) {
                    if (!path) continue;

                    // If it's a string, try to parse it (it might be a JSON string or Markdown block)
                    if (typeof path === 'string' && (path.includes('{') || path.includes('['))) {
                        try {
                            const cleanJson = path.replace(/```json|```/g, '').trim();
                            parsedData = JSON.parse(cleanJson);
                            console.log("🎯 [IDEA STRATEGY] Found valid JSON in path");
                            break;
                        } catch (e) { }
                    }

                    // If it's an array of objects, this is usually our ideas list
                    if (Array.isArray(path) && path.length > 0) {
                        parsedData = path;
                        break;
                    }

                    // If it's an object with keys we want, use it
                    if (typeof path === 'object' && path !== null && (path.campaign_ideas || path.idea_1 || path.ideas)) {
                        parsedData = path;
                        break;
                    }
                }

                console.log("🔍 [IDEA STRATEGY] Best Guessed Data:", parsedData);

                // --- Hyper-Resilient Normalization ---
                const normalizeIdea = (item) => {
                    if (typeof item === 'string') {
                        const clean = item.replace(/["{}\[\]]/g, "").trim(); // Clean JSON artifacts
                        if (clean.length < 10) return null; // Ignore short noise strings
                        return {
                            idea_name: "Strategic Insight",
                            one_liner: clean.length > 500 ? clean.substring(0, 500) + "..." : clean,
                            primary_channels: ["Direct Message"]
                        };
                    }
                    if (typeof item !== 'object' || item === null) return null;

                    // Comprehensive key mapping
                    const name = item.idea_name || item.title || item.name || item.concept || item.campaign_name || item.header || item.heading || "Recommended Strategy";
                    const desc = item.one_liner || item.description || item.summary || item.text || item.content || item.body || item.bio || item.message || "Detailed strategy outlined in Pucho Studio.";

                    // Validation: Must have at least one recognized content field to be a valid idea
                    const hasValidContent = item.idea_name || item.title || item.name || item.concept || item.campaign_name ||
                        item.one_liner || item.description || item.summary || item.text || item.content || item.body || item.bio;

                    if (!hasValidContent) return null;

                    let channels = item.primary_channels || item.channels || item.platforms || item.media || ["Multi-Channel"];
                    if (!Array.isArray(channels)) channels = [String(channels)];

                    return {
                        idea_name: String(name),
                        one_liner: String(desc),
                        primary_channels: channels.map(String)
                    };
                };

                const extractIdeas = (obj) => {
                    if (!obj) return [];

                    // Priority 1: Direct Array
                    if (Array.isArray(obj)) {
                        const normalized = obj.map(normalizeIdea).filter(Boolean);
                        if (normalized.length > 0) return normalized;
                    }

                    // Priority 2: Structured keys (campaign_ideas, ideas, etc.)
                    const arrayKeys = ['campaign_ideas', 'ideas', 'body', 'output', 'results', 'data', 'suggestions'];
                    for (const key of arrayKeys) {
                        if (obj[key] && Array.isArray(obj[key])) {
                            const normalized = obj[key].map(normalizeIdea).filter(Boolean);
                            if (normalized.length > 0) return normalized;
                        }
                    }

                    // Priority 3: "Dictionary as Array" (Flatten Object Values)
                    // If the object contains values that are themselves idea objects (e.g. { "1": {idea}, "2": {idea} })
                    if (typeof obj === 'object') {
                        const values = Object.values(obj);
                        const potentialIdeas = values.filter(v => v && typeof v === 'object' && !Array.isArray(v));
                        if (potentialIdeas.length > 0) {
                            const normalized = potentialIdeas.map(normalizeIdea).filter(Boolean);
                            // To be safe, only return if we found MULTIPLE ideas or a very confident single idea
                            // This avoids treating a wrapper object as a single list item
                            if (normalized.length > 0) return normalized;
                        }
                    }

                    // Priority 4: Recursive Search
                    // If we haven't found a list yet, dig deeper.
                    for (let key in obj) {
                        if (typeof obj[key] === 'object' && obj[key] !== null) {
                            const deep = extractIdeas(obj[key]);
                            if (deep.length > 0) return deep;
                        }
                    }

                    return [];
                };

                let ideas = extractIdeas(parsedData);

                // Final Safeguard: Only use valid raw text
                const isValidRawText = rawText && rawText.replace(/[\s"{}\[\]]/g, '').length > 15;
                if (ideas.length === 0 && isValidRawText) {
                    console.log("🛠️ [IDEA STRATEGY] Using strict raw fallback card.");
                    ideas = [{
                        idea_name: "AI Direct Response",
                        one_liner: rawText.length > 600 ? rawText.substring(0, 600) + "..." : rawText,
                        primary_channels: ["AI Output"],
                        isRaw: true
                    }];
                }

                console.log("💡 [IDEA STRATEGY] Final Extracted Ideas:", ideas);

                if (ideas.length > 0) {
                    setGeneratedIdeas(ideas);
                    setStatus('success');
                } else {
                    setStatus('error');
                    // Check if the response looks like an echo of the trigger (Step 1)
                    const isEcho = parsedData.brandName || (parsedData.brandDNA && parsedData.brandDNA.tagline);
                    if (isEcho) {
                        setErrorMsg("Studio is sending back your input (Step 1). Switch the mapping to Node 3 (Code) or Node 2 (LLM).");
                    } else {
                        setErrorMsg("Received empty response. Ensure 'Return Response' body contains {{step_3}} or {{step_2}}");
                    }
                }
            } else {
                const text = await response.text();
                setStatus('error');
                setErrorMsg(`Server Error: ${response.status}`);
            }
        } catch (e) {
            console.error("⛔ [IDEA STRATEGY] Network Error Object:", e);
            setStatus('error');
            if (e.name === 'AbortError') {
                setErrorMsg("Request Timed Out (15s). Pucho Studio might be slow or the webhook is inactive.");
            } else {
                setErrorMsg(`Network/CORS Error: ${e.message || "Signal blocked by browser (Check Console for CORS errors)."}`);
            }
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-subtle">
                    <div className="flex items-center justify-between gap-3 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-500">
                                <Lightbulb size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Brand DNA & Context</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mt-1">Define your brand identity for the AI strategist</p>
                            </div>
                        </div>

                        {/* Library & Test Controls */}
                        <div className="flex items-center gap-2">
                            <div className="flex bg-purple-50 rounded-lg p-0.5 border border-purple-100">
                                <button
                                    onClick={() => {
                                        setBrandDNA({
                                            name: 'LuxeBrew Coffee',
                                            tagline: 'Elevating Every Drop',
                                            url: 'https://luxebrew.coffee',
                                            logo: 'https://pucho.ai/wp-content/uploads/2023/12/logo-pucho-blue.png',
                                            shortDescription: 'A premium coffee roastery sourcing the finest beans globally.',
                                            longDescription: 'LuxeBrew is more than just coffee; it\'s a sensory experience. We specialize in ethically sourced, small-batch roasted beans delivered fresh to your door.',
                                            values: 'Quality, Sustainability, Community',
                                            aesthetics: 'Minimalist, Dark Mode, Gold Accents',
                                            tone: 'Sophisticated, Warm, Bold',
                                            campaignContext: 'Busy urban professionals in Mumbai looking for a premium morning ritual.'
                                        });
                                    }}
                                    className="text-[10px] hover:bg-white px-3 py-1.5 text-pucho-purple font-bold rounded-md transition-all"
                                >
                                    LuxeBrew
                                </button>
                                <button
                                    onClick={() => {
                                        setBrandDNA({
                                            name: 'FitFuel Smoothies',
                                            tagline: 'Power Your Potential',
                                            url: 'https://fitfuel.in',
                                            logo: 'https://pucho.ai/wp-content/uploads/2023/12/logo-pucho-blue.png',
                                            shortDescription: 'Fresh, protein-packed smoothies for the fitness-conscious.',
                                            longDescription: 'FitFuel provides ready-to-drink meal replacement smoothies made with organic fruits and premium whey. Designed for post-workout recovery and healthy living.',
                                            values: 'Health, Energy, Vitality',
                                            aesthetics: 'Vibrant, Clean, Energizing',
                                            tone: 'Motivating, Fresh, Energetic',
                                            campaignContext: 'Gym-goers and athletes in Bangalore needing a quick protein fix post-workout.'
                                        });
                                    }}
                                    className="text-[10px] hover:bg-white px-3 py-1.5 text-pucho-purple font-bold rounded-md transition-all"
                                >
                                    FitFuel
                                </button>
                                <button
                                    onClick={() => {
                                        setBrandDNA({
                                            name: 'GlowSkin Organics',
                                            tagline: 'Radiance from Within',
                                            url: 'https://glowskin.in',
                                            logo: 'https://pucho.ai/wp-content/uploads/2023/12/logo-pucho-blue.png',
                                            shortDescription: '100% organic, cruelty-free skincare for sensitive skin.',
                                            longDescription: 'GlowSkin Organics combines ancient Ayurvedic principles with modern dermatology. Our products are handcrafted in small batches using premium cold-pressed oils.',
                                            values: 'Pure, Ethical, Transparent',
                                            aesthetics: 'Pastel, Soft, Airy',
                                            tone: 'Gentle, Trustworthy, Inspiring',
                                            campaignContext: 'Eco-conscious women aged 25-45 looking for sustainable beauty solutions.'
                                        });
                                    }}
                                    className="text-[10px] hover:bg-white px-3 py-1.5 text-pucho-purple font-bold rounded-md transition-all"
                                >
                                    GlowSkin
                                </button>
                            </div>
                            {brandLibrary.length > 0 && (
                                <select
                                    className="text-[10px] bg-gray-50 border-none rounded-lg px-3 py-2 text-gray-500 font-bold focus:ring-1 focus:ring-[#A0D296] cursor-pointer"
                                    onChange={(e) => {
                                        const selected = brandLibrary.find(b => b.name === e.target.value);
                                        if (selected) setBrandDNA(selected);
                                    }}
                                    value={brandDNA.name}
                                >
                                    <option value="">Load Profile...</option>
                                    {brandLibrary.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                                </select>
                            )}
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Section 1: Core Identity */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                                Brand Identity
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Brand Name</label>
                                    <input name="name" value={brandDNA.name} onChange={handleChange} type="text" placeholder="e.g. LuxeBrew" className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#A0D296] transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Official Website</label>
                                    <input name="url" value={brandDNA.url} onChange={handleChange} type="text" placeholder="https://example.com" className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#A0D296] transition-all" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Tagline</label>
                                    <input name="tagline" value={brandDNA.tagline} onChange={handleChange} type="text" placeholder="Your brand catchphrase" className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#A0D296] transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-sm font-semibold text-gray-700">Brand Logo</label>
                                        <label className="text-[10px] font-bold text-pucho-purple cursor-pointer hover:underline flex items-center gap-1">
                                            <Upload size={10} />
                                            Upload File
                                            <input type="file" className="hidden" accept="image/*" onChange={onLogoUpload} />
                                        </label>
                                    </div>
                                    <input name="logo" value={brandDNA.logo} onChange={handleChange} type="text" placeholder="https://example.com/logo.png" className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#A0D296] transition-all" />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Brand Voice & Vibe */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                                Brand Voice & Vibe
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Values</label>
                                    <input name="values" value={brandDNA.values} onChange={handleChange} type="text" placeholder="e.g. Quality, Eco-friendly" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-[#A0D296] transition-all text-sm" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Aesthetics</label>
                                    <input name="aesthetics" value={brandDNA.aesthetics} onChange={handleChange} type="text" placeholder="e.g. Minimal, Pastel" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-[#A0D296] transition-all text-sm" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Tone</label>
                                    <input name="tone" value={brandDNA.tone} onChange={handleChange} type="text" placeholder="e.g. Playful, Bold" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-[#A0D296] transition-all text-sm" />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Descriptions */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                                Messaging Depth
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Short Description</label>
                                    <textarea name="shortDescription" value={brandDNA.shortDescription} onChange={handleChange} rows="2" placeholder="Brief elevator pitch..." className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#A0D296] transition-all resize-none text-sm"></textarea>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Long Description</label>
                                    <textarea name="longDescription" value={brandDNA.longDescription} onChange={handleChange} rows="2" placeholder="Tell the full story..." className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#A0D296] transition-all resize-none text-sm"></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Campaign Context */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                                Active Campaign Target
                            </h4>
                            <div className="space-y-2">
                                <textarea
                                    name="campaignContext"
                                    value={brandDNA.campaignContext}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Who is this campaign for? (e.g. Busy moms in Bangalore needing quick meals)"
                                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#A0D296] transition-all resize-none font-medium"
                                ></textarea>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handleGenerateIdeas}
                                disabled={status === 'loading'}
                                className={`flex-1 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${status === 'loading' ? 'bg-gray-200 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800 shadow-black/10'
                                    }`}
                            >
                                {status === 'loading' ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
                                {status === 'loading' ? 'Analyzing DNA...' : 'Generate Campaign Ideas'}
                            </button>

                            <button
                                onClick={saveToLibrary}
                                className="px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50 text-gray-400 hover:text-[#A0D296] hover:border-[#A0D296] transition-all group"
                                title="Save Brand DNA to Library"
                            >
                                <Upload size={20} className="group-hover:scale-110 transition-transform" />
                            </button>
                        </div>

                        {status === 'success' && (
                            <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3 text-green-700 animate-in fade-in slide-in-from-top-2 mt-4">
                                <CheckCircle2 size={20} />
                                <p className="text-sm font-medium">Strategy ideas generated! Check Pucho Studio runs.</p>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="space-y-4 mt-4">
                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle size={20} />
                                    <p className="text-sm font-medium">{errorMsg || 'Connection failed. Please try again.'}</p>
                                </div>
                                {debugData && (
                                    <div className="p-4 bg-gray-900 rounded-2xl overflow-hidden">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Raw Studio Response</span>
                                            <button onClick={() => setDebugData(null)} className="text-gray-500 hover:text-white text-[10px]">Clear</button>
                                        </div>
                                        <pre className="text-[10px] text-pucho-green font-mono overflow-auto max-h-40 whitespace-pre-wrap">
                                            {JSON.stringify(debugData, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-gradient-to-br from-[#111935] to-[#1e293b] p-8 rounded-[32px] text-white overflow-hidden relative group h-full min-h-[400px]">
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-2">Campaign Ideas 💡</h3>
                        <p className="text-gray-400 text-sm mb-6">Generated ideas will appear here for your selection.</p>

                        <div className="space-y-4">
                            {generatedIdeas.length > 0 ? (
                                generatedIdeas.map((idea, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setSelectedIdea(idea)}
                                        className={`p-5 rounded-2xl cursor-pointer transition-all border ${selectedIdea?.idea_name === idea.idea_name
                                            ? 'bg-[#A0D296] border-[#A0D296] text-black shadow-lg scale-[1.02]'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-sm leading-tight">{idea.idea_name}</h4>
                                            {selectedIdea?.idea_name === idea.idea_name && <CheckCircle2 size={14} />}
                                        </div>
                                        <p className={`text-[11px] leading-relaxed mb-3 ${selectedIdea?.idea_name === idea.idea_name ? 'text-black/70' : 'text-gray-400'}`}>
                                            {idea.one_liner}
                                        </p>
                                        <div className="flex gap-2">
                                            {idea.primary_channels?.map((ch, i) => (
                                                <span key={i} className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wider ${selectedIdea?.idea_name === idea.idea_name ? 'bg-black/10 text-black' : 'bg-white/10 text-white/60'
                                                    }`}>
                                                    {ch}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                [1, 2, 3].map((i) => (
                                    <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center h-24 text-gray-500 italic text-sm border-dashed">
                                        {status === 'loading' ? <Loader2 className="animate-spin text-gray-700" size={20} /> : `Idea ${i}`}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <div className="absolute top-[-10%] right-[-10%] w-40 h-40 bg-[#A0D296]/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
                </div>
            </div>
        </div>
    );
};

// --- Step 2: Concept Lab View ---
const ConceptLabView = ({ brandDNA, selectedIdea, onDownload, extractImages, onLogoUpload, activeImage, setActiveImage }) => {
    const [status, setStatus] = useState('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [debugData, setDebugData] = useState(null);

    const handleVisualize = async () => {
        if (!selectedIdea) return;
        setStatus('loading');
        setErrorMsg('');
        setDebugData(null);
        setActiveImage(null);

        const payload = {
            brand_name: brandDNA?.name || "Mock Brand",
            brand_url: brandDNA?.url || "https://example.com",
            brand_dna: JSON.stringify({
                tagline: brandDNA?.tagline,
                values: brandDNA?.values || "Quality",
                aesthetics: brandDNA?.aesthetics || "Modern",
                tone: brandDNA?.tone || "Professional",
                bio: brandDNA?.shortDescription,
                campaign_target: brandDNA?.campaignContext
            }),
            one_liner: selectedIdea?.one_liner || "",
            logo_url: brandDNA?.logo || "",
            requestId: `LAB_${Date.now()}`
        };

        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 240000);

            const response = await fetch(LAB_WEBHOOK, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(id);

            if (response.ok) {
                const rawText = await response.text();
                console.log("📥 [CONCEPT LAB] Raw Text Received:", rawText);

                let data;
                try {
                    data = JSON.parse(rawText);
                } catch (e) {
                    const jsonMatch = rawText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
                    if (jsonMatch) {
                        try {
                            data = JSON.parse(jsonMatch[0].replace(/```json|```/g, '').trim());
                        } catch (innerE) {
                            data = { body: rawText };
                        }
                    } else {
                        data = { body: rawText };
                    }
                }

                setDebugData(data);
                setStatus('success');
                const imgs = extractImages(data);
                console.log("✨ [CONCEPT LAB] Extracted Images:", imgs);
                if (imgs.length > 0) setActiveImage(imgs[0]);
                else {
                    console.warn("⚠️ [CONCEPT LAB] No images found in response");
                    if (rawText.length > 50) {
                        // If no images but we got text, maybe it's an error message or different format
                        setErrorMsg("Sync response received but no image URLs found. Check Studio flow output.");
                    }
                }
            } else {
                const errText = await response.text();
                console.error("❌ [CONCEPT LAB] Request failed:", response.status, errText);
                setStatus('error');
                setErrorMsg(`Server Error: ${response.status}`);
            }
        } catch (e) {
            console.error("⛔ [CONCEPT LAB] Fetch Error:", e);
            setStatus('error');
            setErrorMsg(e.name === 'AbortError' ? "Request Timed Out (4 mins). Pucho Studio did not respond in time." : (e.message || "Network Error"));
        }
    };

    const visuals = status === 'success' ? extractImages(debugData) : [];

    if (!selectedIdea) {
        return (
            <div className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-subtle min-h-[500px] flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center text-pucho-purple mb-6">
                    <Palette size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Concept Lab Ready</h3>
                <p className="text-gray-500 max-w-sm mt-2">Please select a campaign idea in Step 1 to begin visualization.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
            {/* Left Column */}
            <div className="space-y-6">
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-subtle flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-pucho-purple">
                            <Palette size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Concept Blueprint</h3>
                            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mt-1">Transform Strategy into Vision</p>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 mb-6">
                        <span className="text-[10px] font-bold text-pucho-purple uppercase tracking-wider mb-2 block">Selected Direction</span>
                        <h2 className="text-xl font-black text-gray-900 mb-2">{selectedIdea?.idea_name}</h2>
                        <p className="text-gray-600 italic text-sm leading-relaxed">"{selectedIdea?.one_liner}"</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-gray-50 rounded-2xl">
                            <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Aesthetic</span>
                            <span className="text-xs font-semibold text-gray-700">{brandDNA?.aesthetics || 'Standard'}</span>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl relative group/logo">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-bold text-gray-400 uppercase block">Ref. Logo</span>
                                <label className="text-[8px] font-bold text-pucho-purple cursor-pointer hover:underline opacity-0 group-hover/logo:opacity-100 transition-opacity">
                                    Change
                                    <input type="file" className="hidden" accept="image/*" onChange={onLogoUpload} />
                                </label>
                            </div>
                            {brandDNA?.logo ? (
                                <div className="flex items-center gap-2 mt-1">
                                    <img src={brandDNA.logo} alt="Logo" className="w-5 h-5 object-contain" />
                                    <span className="text-[10px] text-gray-500 font-medium">Active</span>
                                </div>
                            ) : <span className="text-[10px] text-gray-400 italic">None</span>}
                        </div>
                    </div>

                    <button
                        onClick={handleVisualize}
                        disabled={status === 'loading'}
                        className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-xl ${status === 'loading' ? 'bg-gray-100 pointer-events-none text-gray-400' : 'bg-pucho-purple text-white hover:bg-purple-700'}`}
                    >
                        {status === 'loading' ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                        <div className="flex flex-col items-center">
                            <span>{status === 'loading' ? 'Synthesizing...' : 'Visualize with AI'}</span>
                            {status === 'loading' && <span className="text-[10px] opacity-70 font-normal">Est. 1-2 minutes</span>}
                        </div>
                    </button>

                    {status === 'success' && visuals.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <h4 className="font-bold text-gray-800 text-[10px] uppercase tracking-widest mb-4">Generated Variants</h4>
                            <div className="grid grid-cols-3 gap-3">
                                {visuals.map((img, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setActiveImage(img)}
                                        className={`aspect-square rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-105 border-2 ${activeImage === img ? 'border-pucho-purple shadow-lg' : 'border-gray-100'}`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-bold flex flex-col gap-2 border border-red-100">
                            <div className="flex items-center gap-2">
                                <AlertCircle size={14} /> {errorMsg}
                            </div>
                            {debugData && (
                                <div className="mt-2 bg-gray-900 p-3 rounded-xl overflow-auto max-h-40 text-pucho-green font-mono">
                                    <pre>{JSON.stringify(debugData, null, 2)}</pre>
                                </div>
                            )}
                        </div>
                    )}

                    {status === 'success' && visuals.length === 0 && (
                        <div className="mt-4 p-4 bg-amber-50 text-amber-700 rounded-2xl text-[10px] font-bold border border-amber-100">
                            <p className="flex items-center gap-2 mb-2"><AlertCircle size={14} /> Pucho Studio responded but no images were found.</p>
                            <div className="bg-gray-900 p-3 rounded-xl overflow-auto max-h-40 text-amber-400 font-mono">
                                <span className="text-[8px] text-gray-500 uppercase block mb-1">Raw Response Body</span>
                                <pre>{JSON.stringify(debugData, null, 2)}</pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column */}
            <div className={`bg-gray-900 rounded-[32px] overflow-hidden relative min-h-[500px] flex items-center justify-center border border-white/5 shadow-2xl transition-all ${status === 'loading' ? 'grayscale opacity-80' : ''}`}>
                {activeImage ? (
                    <>
                        <img src={activeImage} alt="Main Concept" className="w-full h-full object-contain absolute inset-0 p-8 animate-in zoom-in-95 duration-500" />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-6 flex justify-between items-end">
                            <span className="px-2 py-0.5 bg-pucho-purple text-[10px] font-black uppercase rounded text-white tracking-widest">Master Draft</span>
                            <button
                                onClick={() => onDownload(activeImage, `${selectedIdea?.idea_name}-concept.png`)}
                                className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20"
                            >
                                <Download size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center p-8">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white/10 mx-auto mb-4 border border-white/10">
                            {status === 'loading' ? <Loader2 className="animate-spin text-white" size={32} /> : <Sparkles size={32} />}
                        </div>
                        <h4 className="text-white font-bold opacity-30 uppercase tracking-widest text-xs">Awaiting Magic</h4>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Step 3: Creative Studio View ---
const CreativeStudioView = ({ brandDNA, selectedIdea, onDownload, extractImages, onLogoUpload, selectedConcept }) => {
    const [status, setStatus] = useState('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [debugData, setDebugData] = useState(null);
    const [activeImage, setActiveImage] = useState(null);
    const [referenceSource, setReferenceSource] = useState('concept'); // 'logo', 'concept', 'custom'
    const [customReference, setCustomReference] = useState(null);

    const [formData, setFormData] = useState({
        inputLine: '',
        imageSelected: '',
        aspectSelected: '1:1',
        header: '',
        description: '',
        cta: ''
    });

    useEffect(() => {
        if (selectedIdea) {
            setFormData(prev => ({
                ...prev,
                inputLine: selectedIdea.one_liner || "",
                header: selectedIdea.idea_name || ""
            }));
        }
    }, [selectedIdea]);

    // Handle Custom Reference Upload
    const handleReferenceUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCustomReference(reader.result);
                setReferenceSource('custom');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!formData.inputLine) {
            alert("Please enter a creative prompt.");
            return;
        }

        setStatus('loading');
        setErrorMsg('');
        setDebugData(null);
        setActiveImage(null);

        // Determine which image to send as reference
        let refImage = brandDNA?.logo || "";
        if (referenceSource === 'concept') refImage = selectedConcept || brandDNA?.logo || "";
        if (referenceSource === 'custom') refImage = customReference || "";

        const payload = {
            requestId: `STUDIO_${Date.now()}`,
            brand_dna: brandDNA || {},
            input_line: formData.inputLine,
            reference_source: referenceSource,
            image_selected: refImage,
            aspect_selected: formData.aspectSelected,
            text_options_selected: [
                formData.header || "",
                formData.description || "",
                formData.cta || ""
            ],
            spreadsheet_config: {
                custom_creatives_id: 1,
                spreadsheet_id: "SHEET_ID_HERE"
            }
        };

        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 240000);

            const response = await fetch(CUSTOM_WEBHOOK, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            clearTimeout(id);

            if (response.ok) {
                const rawText = await response.text();
                console.log("📥 [CREATIVE STUDIO] Raw Text Received:", rawText);

                let data;
                try {
                    data = JSON.parse(rawText);
                } catch (e) {
                    const jsonMatch = rawText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
                    if (jsonMatch) {
                        try {
                            data = JSON.parse(jsonMatch[0].replace(/```json|```/g, '').trim());
                        } catch (innerE) {
                            data = { body: rawText };
                        }
                    } else {
                        data = { body: rawText };
                    }
                }

                setDebugData(data);
                setStatus('success');
                const imgs = extractImages(data);
                console.log("✨ [CREATIVE STUDIO] Extracted Images:", imgs);
                if (imgs.length > 0) setActiveImage(imgs[0]);
                else {
                    console.warn("⚠️ [CREATIVE STUDIO] No images found in response");
                    setErrorMsg("Studio finished but no high-quality image URL was found in the response.");
                }
            } else {
                const errText = await response.text();
                console.error("❌ [CREATIVE STUDIO] Request failed:", response.status, errText);
                setStatus('error');
                setErrorMsg(`Server Error: ${response.status}`);
            }
        } catch (e) {
            console.error("⛔ [CREATIVE STUDIO] Fetch Error:", e);
            setStatus('error');
            setErrorMsg(e.name === 'AbortError' ? "Timeout (4 mins)." : (e.message || "Network Error"));
        }
    };

    const visuals = status === 'success' ? extractImages(debugData) : [];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
            <div className="lg:col-span-12">
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-subtle">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold">Custom Creative Studio</h3>
                                    <p className="text-sm text-gray-500 mt-1">Refine and produce high-fidelity brand assets.</p>
                                </div>
                            </div>

                            {/* Reference Image Selector */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-bold text-gray-700 block">Base Reference Source</label>
                                    <p className="text-[10px] text-gray-400 mt-1">Select the starting image for your final production asset.</p>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        onClick={() => setReferenceSource('logo')}
                                        className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all group ${referenceSource === 'logo' ? 'border-pucho-purple bg-purple-50 ring-2 ring-purple-100' : 'border-gray-100 hover:bg-gray-50'}`}
                                    >
                                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm flex items-center justify-center">
                                            {brandDNA?.logo ? <img src={brandDNA.logo} className="w-full h-full object-contain" alt="" /> : <ImageIcon className="w-full h-full p-2 text-gray-300" />}
                                        </div>
                                        <div className="text-center">
                                            <span className={`text-[10px] font-bold block ${referenceSource === 'logo' ? 'text-pucho-purple' : 'text-gray-700'}`}>Official Logo</span>
                                            <span className="text-[8px] text-gray-400 font-medium">From Step 1</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setReferenceSource('concept')}
                                        className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all group ${referenceSource === 'concept' ? 'border-pucho-purple bg-purple-50 ring-2 ring-purple-100' : 'border-gray-100 hover:bg-gray-50'}`}
                                    >
                                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm flex items-center justify-center">
                                            {selectedConcept ? <img src={selectedConcept} className="w-full h-full object-cover" alt="" /> : <Sparkles className="text-gray-300" size={20} />}
                                        </div>
                                        <div className="text-center">
                                            <span className={`text-[10px] font-bold block ${referenceSource === 'concept' ? 'text-pucho-purple' : 'text-gray-700'}`}>Lab Visual</span>
                                            <span className="text-[8px] text-gray-400 font-medium">From Step 2</span>
                                        </div>
                                    </button>

                                    <label className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer group ${referenceSource === 'custom' ? 'border-pucho-purple bg-purple-50 ring-2 ring-purple-100' : 'border-gray-100 hover:bg-gray-50'}`}>
                                        <input type="file" className="hidden" onChange={handleReferenceUpload} />
                                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm flex items-center justify-center">
                                            {customReference ? <img src={customReference} className="w-full h-full object-cover" alt="" /> : <Upload size={20} className="text-gray-400" />}
                                        </div>
                                        <div className="text-center">
                                            <span className={`text-[10px] font-bold block ${referenceSource === 'custom' ? 'text-pucho-purple' : 'text-gray-700'}`}>Gallery Photo</span>
                                            <span className="text-[8px] text-gray-400 font-medium">Your Upload</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Refinement Prompt</label>
                                    <textarea
                                        rows="4"
                                        value={formData.inputLine}
                                        onChange={(e) => setFormData({ ...formData, inputLine: e.target.value })}
                                        placeholder="Add specific instructions for this creative..."
                                        className="w-full px-5 py-4 rounded-xl bg-gray-50 border-none focus:ring-1 focus:ring-pucho-green text-sm resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    {['1:1', '16:9', '4:5'].map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setFormData({ ...formData, aspectSelected: size })}
                                            className={`p-3 rounded-lg text-xs font-bold transition-all ${formData.aspectSelected === size ? 'bg-black text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    disabled={status === 'loading'}
                                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all ${status === 'loading' ? 'bg-gray-100 text-gray-400' : 'bg-black text-white hover:bg-gray-800 shadow-xl'}`}
                                >
                                    {status === 'loading' ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                                    <div className="flex flex-col items-center">
                                        <span>{status === 'loading' ? 'Regenerating...' : 'Produce Final Asset'}</span>
                                        {status === 'loading' && <span className="text-[10px] opacity-70 font-normal underline">Est. 1-2 minutes</span>}
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Right Preview */}
                        <div className="bg-gray-900 rounded-[32px] min-h-[500px] relative overflow-hidden flex items-center justify-center border border-white/5 shadow-inner">
                            {activeImage ? (
                                <>
                                    <img src={activeImage} className="w-full h-full object-contain p-8 animate-in zoom-in-95 duration-500" alt="" />
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex justify-between items-end">
                                        <span className="px-2 py-0.5 bg-pucho-green text-[10px] font-black uppercase rounded text-black tracking-widest">Final HQ</span>
                                        <button
                                            onClick={() => onDownload(activeImage, `hq-creative-${Date.now()}.png`)}
                                            className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20"
                                        >
                                            <Download size={18} />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white/10 mx-auto mb-4 border border-white/10">
                                        {status === 'loading' ? <Loader2 className="animate-spin" size={32} /> : <Sparkles size={32} />}
                                    </div>
                                    <p className="text-white/30 text-xs font-bold uppercase tracking-widest animate-pulse">
                                        {status === 'loading' ? 'Studio Rendering...' : 'Awaiting Studio Output'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandDNADashboard;

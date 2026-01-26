import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import { User, Lock, ArrowRight, Moon, Sparkles, Circle } from 'lucide-react';

// Assets (Assuming these exist in the common assets folder copied over)
import mascot1 from '../assets/mascot_1.png';
import mascot3 from '../assets/mascot_3.png';
import mascot4 from '../assets/mascot_4.png';
import mascot5 from '../assets/mascot_5.png';
import logo from '../assets/pucho_logo_login.png';

const Mascot = ({ imageSrc, delay, x, y, size = "w-16 h-16", cursorColor = "text-blue-500", cursorRotation = "0deg" }) => (
    <div
        className={`absolute ${x} ${y} z-20 animate-float transition-all duration-300 hover:scale-110 hover:rotate-6 cursor-pointer pointer-events-auto`}
        style={{ animationDelay: `${delay}s` }}
    >
        <div className={`${size} rounded-full overflow-hidden shadow-lg relative bg-white/50 backdrop-blur-sm border border-white/40`}>
            <img src={imageSrc} alt="User" className="w-full h-full object-cover" />
        </div>
        <div className={`absolute -bottom-3 -right-3 ${cursorColor} drop-shadow-md`} style={{ transform: `rotate(${cursorRotation})` }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.5 3.5L10.5 20.5L13.5 13.5L20.5 10.5L3.5 3.5Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
            </svg>
        </div>
    </div>
);

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const result = await login(email, password);
        if (result.success) {
            navigate('/cp-dashboard'); // Redirect to the new CP Dashboard
        } else {
            setError(result.message || 'Invalid credentials');
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full bg-[#FAFAFF] relative flex items-center justify-center p-4 lg:p-8 overflow-hidden font-['Space_Grotesk']">
            {/* Background Grid */}
            <div className="absolute inset-0 z-0 opacity-100 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)`,
                    backgroundSize: '64px 64px',
                    maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0) 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0) 100%)'
                }}
            />

            {/* Spotlight Glow */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-50"
                style={{ background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(139, 92, 246, 0.15), transparent 40%)` }}
            />

            {/* Ambient Blobs */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none translate-x-1/2 translate-y-1/2" />

            {/* Floating Mascots */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden h-full w-full">
                <Mascot imageSrc={mascot1} x="top-[15%] left-[5%]" delay={0} cursorColor="text-blue-500" cursorRotation="-10deg" />
                <Mascot imageSrc={mascot5} x="top-[10%] right-[8%]" delay={1.5} cursorColor="text-purple-500" cursorRotation="15deg" />
                <Mascot imageSrc={mascot3} x="bottom-[12%] left-[10%]" delay={0.8} cursorColor="text-yellow-500" cursorRotation="-5deg" />
                <Mascot imageSrc={mascot4} x="bottom-[15%] right-[5%]" delay={2.2} cursorColor="text-green-500" cursorRotation="10deg" />
            </div>

            <div className="w-full max-w-7xl mx-auto grid md:grid-cols-2 gap-12 relative z-10 items-center">
                {/* Left: Branding */}
                <div className="hidden md:block space-y-8 pl-12">
                    <img src={logo} alt="Pucho" className="h-12" />
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <p className="font-bold text-[#111834] text-lg">Pucho.ai's Customer Dashboard</p>
                            <p className="text-[10px] font-black text-purple-600 tracking-widest uppercase">POWERED BY AI AGENTS</p>
                        </div>
                        <h1 className="text-6xl font-black text-[#111834] leading-[0.95] tracking-tight">
                            Build.<br />
                            <span className="text-purple-500/80">Automate.</span><br />
                            Scale.
                        </h1>
                        <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
                            From data to working intelligence. Access your command center to manage automated customer communication flows.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full text-xs font-bold text-purple-700 border border-purple-100">
                            <Sparkles size={14} /> AI-Powered
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full text-xs font-bold text-green-700 border border-green-100">
                            <Circle size={8} fill="currentColor" /> System Live
                        </div>
                    </div>
                </div>

                {/* Right: Login Card */}
                <div className="flex items-center justify-center">
                    <div className="bg-white/80 backdrop-blur-2xl p-10 rounded-[40px] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.08)] border border-white w-full max-w-md">
                        <div className="mb-8">
                            <h2 className="text-3xl font-black text-[#111834] mb-2">Welcome Back</h2>
                            <p className="text-gray-400 font-medium">Log in to manage your automated flows.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <Input
                                label="Username"
                                type="text"
                                icon={User}
                                placeholder="admin_pucho"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Input
                                label="Password"
                                type="password"
                                icon={Lock}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            {error && <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl">{error}</p>}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-[#3A10CE] text-white rounded-full font-bold text-lg shadow-xl shadow-blue-200 hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group overflow-hidden relative"
                            >
                                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                                <span>{loading ? 'Entering...' : 'Log In Now'}</span>
                                <ArrowRight className="w-5 h-5 -rotate-45 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

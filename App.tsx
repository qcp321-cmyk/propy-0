import React, { useEffect, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  ArrowUpRight, 
  X, 
  Sparkles, 
  Menu, 
  BrainCircuit, 
  ShieldAlert,
  Lock,
  Globe,
  Share2,
  Cpu,
  ShieldCheck,
  Zap,
  Bot,
  User,
  ChevronRight,
  MessageCircle
} from 'lucide-react';
import ThreeBackground from './components/ThreeBackground';
import ScenarioGenerator from './components/ScenarioGenerator';
import EngineOcean from './components/EngineOcean';
import AdminDashboard from './components/AdminDashboard';
import RegistrationModal from './components/RegistrationModal';
import ProductCapabilities from './components/ProductCapabilities';
import ReferralOverlay from './components/ReferralOverlay';
import ImpactSection from './components/ImpactSection';
import GlobalChat from './components/GlobalChat';
import VisionModal from './components/VisionModal';
import { mockBackend } from './services/mockBackend';
import { UserProfile } from './types';

gsap.registerPlugin(ScrollTrigger);

const SharedViewer = ({ payload, onClose }: { payload: any, onClose: () => void }) => {
    const isMission = payload.type === 'MISSION_SYNTHESIS';
    const isVault = new URLSearchParams(window.location.search).get('vault') === 'true';

    return (
        <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center p-3 sm:p-6 md:p-10 animate-in fade-in duration-500" data-lenis-prevent>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            
            <div className="relative w-full max-w-5xl bg-[#050505] border border-white/10 rounded-[2rem] sm:rounded-[3rem] md:rounded-[4rem] overflow-hidden flex flex-col shadow-2xl h-full max-h-[90vh] md:max-h-none">
                <div className="p-5 sm:p-8 md:p-12 border-b border-white/5 bg-black/40 flex justify-between items-center relative overflow-hidden shrink-0">
                    <div className={`absolute top-0 left-0 w-full h-1 ${isVault ? 'bg-purple-600' : 'bg-cyan-600'}`}></div>
                    <div className="flex items-center gap-3 sm:gap-6">
                        <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${isVault ? 'bg-purple-600/20 text-purple-400' : 'bg-cyan-600/20 text-cyan-400'} border border-white/5`}>
                            {isMission ? <BrainCircuit className="w-6 h-6 sm:w-8 h-8" /> : <Globe className="w-6 h-6 sm:w-8 h-8" />}
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-2xl md:text-3xl font-black italic uppercase tracking-tighter leading-none">Neural Link <span className={isVault ? 'text-purple-400' : 'text-cyan-400'}>Received</span></h2>
                            <p className="text-[7px] sm:text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] sm:tracking-[0.4em] mt-1 sm:mt-2">
                                {isVault ? 'Security Protocol: Encrypted Vault Access' : 'Protocol: Public Uplink Authorization'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 sm:p-4 bg-white/5 hover:bg-white/10 rounded-full transition-all group active:scale-90">
                        <X className="w-5 h-5 sm:w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 sm:p-8 md:p-14 custom-scrollbar bg-black/20">
                    <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
                        {isMission ? (
                            <>
                                <div className="space-y-4 sm:space-y-6">
                                    <div className="flex items-center gap-2 text-[8px] sm:text-[10px] font-black uppercase text-cyan-400 tracking-widest bg-cyan-400/10 w-fit px-3 py-1.5 rounded-lg border border-cyan-400/20">
                                        <User className="w-3 h-3" /> Identity Module
                                    </div>
                                    <h3 className="text-2xl sm:text-4xl md:text-5xl font-black text-white italic leading-tight">{payload.role}</h3>
                                    <div className="prose prose-invert prose-sm sm:prose-lg max-w-none text-gray-300 font-light leading-relaxed border-l-2 sm:border-l-4 border-cyan-500/30 pl-5 sm:pl-8">
                                        {payload.explanation}
                                    </div>
                                    {payload.steps && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-8 sm:mt-12">
                                            {payload.steps.map((step: string, i: number) => (
                                                <div key={i} className="p-4 sm:p-6 bg-white/5 rounded-xl sm:rounded-2xl border border-white/5 text-[10px] sm:text-xs text-gray-400 leading-relaxed italic">
                                                    <span className="text-cyan-500 font-black mr-2">{i+1}.</span> {step}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {payload.quote && (
                                    <div className="p-5 sm:p-8 bg-cyan-500/5 border border-cyan-500/10 rounded-[1.5rem] sm:rounded-[2.5rem] text-center italic text-cyan-400/80 text-xs sm:text-base">
                                        "{payload.quote}"
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="space-y-4 sm:space-y-6">
                                    <div className="flex items-center gap-2 text-[8px] sm:text-[10px] font-black uppercase text-cyan-400 tracking-widest bg-cyan-400/10 w-fit px-3 py-1.5 rounded-lg border border-cyan-400/20">
                                        <Bot className="w-3 h-3" /> Resolution Stream
                                    </div>
                                    <h3 className="text-xl sm:text-3xl md:text-4xl font-black text-white italic leading-tight">{payload.query}</h3>
                                    <div className="prose prose-invert prose-sm sm:prose-lg max-w-none text-gray-300 font-light leading-relaxed bg-white/5 p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem]">
                                        {payload.humanized?.split('\n').map((p: string, i: number) => <p key={i} className="mb-3 sm:mb-4">{p}</p>)}
                                    </div>
                                </div>
                                {payload.summary && (
                                    <div className="space-y-3 sm:space-y-4">
                                        <div className="flex items-center gap-2 text-[8px] sm:text-[10px] font-black uppercase text-purple-400 tracking-widest bg-purple-400/10 w-fit px-3 py-1.5 rounded-lg border border-purple-400/20">
                                            <Cpu className="w-3 h-3" /> AI Engine View
                                        </div>
                                        <div className="p-5 sm:p-8 bg-purple-500/5 border border-purple-500/10 rounded-[1.5rem] sm:rounded-[2rem] text-[10px] sm:text-sm text-gray-500 italic">
                                            {payload.summary}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        <div className="pt-8 sm:pt-12 border-t border-white/5 text-center shrink-0">
                            <button onClick={onClose} className={`w-full sm:w-auto px-10 md:px-12 py-4 md:py-5 rounded-full font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] transition-all shadow-2xl active:scale-95 ${isVault ? 'bg-purple-600 text-white' : 'bg-cyan-600 text-white'}`}>
                                Synchronize With Experience
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(mockBackend.getCurrentUser());
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [isVisionOpen, setIsVisionOpen] = useState(false);
  const [engineMode, setEngineMode] = useState<'SCENARIO' | 'BEYOU' | 'OCEAN'>('SCENARIO');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [sharedPayload, setSharedPayload] = useState<any>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const mission = searchParams.get('mission');
    const ocean = searchParams.get('ocean');
    
    if (mission || ocean) {
      try {
        const raw = mission || ocean;
        const decoded = decodeURIComponent(atob(raw!).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        setSharedPayload(JSON.parse(decoded));
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error("Shared payload corrupted", e);
      }
    }

    const checkStatus = () => {
      const blocked = mockBackend.isAccessRevoked();
      setIsBlocked(blocked);
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);

    mockBackend.trackEvent(currentUser?.id || null, 'PAGE_VIEW', 'Cluster Uplink: Entry Authorized');

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2, // Faster touch scrolling
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    const handleStorage = () => {
        setCurrentUser(mockBackend.getCurrentUser());
        checkStatus();
    };
    window.addEventListener('storage', handleStorage);
    
    return () => {
      lenis.destroy();
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, [currentUser?.id]);

  if (isBlocked) {
    return (
      <div className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center text-center p-6 sm:p-10 font-mono">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
          <ShieldAlert className="w-20 h-20 sm:w-32 sm:h-32 text-red-600 mb-6 sm:mb-8 animate-pulse" />
          <h1 className="text-2xl sm:text-4xl font-black text-white mb-4 tracking-tighter uppercase italic">Terminal Access Revoked</h1>
          <div className="w-48 sm:w-64 h-1 bg-red-600/30 rounded-full mb-8 relative overflow-hidden">
             <div className="absolute inset-0 bg-red-600 animate-[progress_2s_infinite_linear]"></div>
          </div>
          <p className="text-gray-500 max-w-md text-[10px] sm:text-sm leading-relaxed uppercase tracking-[0.2em]">
            This node identity has been flagged for security protocols. Uplink severed by master administrator.
          </p>
          <div className="mt-8 sm:mt-12 p-4 sm:p-6 border border-red-900/30 bg-red-900/10 rounded-2xl sm:rounded-3xl">
             <p className="text-[8px] sm:text-[10px] text-red-500 font-bold uppercase tracking-widest">Error code: ERR_NODE_BLACKLISTED</p>
          </div>
          <style>{`@keyframes progress { 0% { left: -100%; } 100% { left: 100%; } }`}</style>
      </div>
    );
  }

  const handleRegistrationSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsRegistrationOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const top = element.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    setIsNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-cyan-500/30 overflow-x-hidden">
      <ThreeBackground mode={engineMode === 'BEYOU' ? 'SOOTHING' : 'OFF'} />

      {sharedPayload && <SharedViewer payload={sharedPayload} onClose={() => setSharedPayload(null)} />}

      <nav className="fixed top-0 left-0 w-full z-[100] px-4 sm:px-12 py-4 sm:py-8 md:py-10 flex justify-between items-center transition-all duration-300 bg-gradient-to-b from-black/90 via-black/60 to-transparent backdrop-blur-[4px]">
        <div className="flex items-center gap-3 sm:gap-4 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-9 h-9 sm:w-12 sm:h-12 bg-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl shadow-cyan-900/40 group-hover:scale-110 transition-transform">
            <BrainCircuit className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
          </div>
          <h1 className="text-lg sm:text-2xl font-black tracking-tighter uppercase italic">Curious<span className="text-cyan-500">Minds</span></h1>
        </div>

        <div className="hidden md:flex items-center gap-8 lg:gap-12">
          <button onClick={() => scrollToSection('mission')} className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 hover:text-white transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-cyan-500 hover:after:w-full after:transition-all">Mission</button>
          <button onClick={() => setIsProductOpen(true)} className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 hover:text-white transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-cyan-500 hover:after:w-full after:transition-all">Products</button>
          <button onClick={() => scrollToSection('ocean')} className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 hover:text-white transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-cyan-500 hover:after:w-full after:transition-all">Engine Ocean</button>
          <button onClick={() => setIsReferralOpen(true)} className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 hover:text-white transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-cyan-500 hover:after:w-full after:transition-all">Network</button>
        </div>

        <div className="flex items-center gap-2 sm:gap-6">
          {!currentUser && (
            <button onClick={() => setIsRegistrationOpen(true)} className="bg-white text-black px-4 sm:px-8 py-2.5 sm:py-3 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] hover:bg-cyan-400 transition-all active:scale-95 shadow-2xl shrink-0">
              Uplink
            </button>
          )}
          <button onClick={() => setIsNavOpen(true)} className="p-2 sm:p-3 md:hidden text-gray-400 hover:text-white transition-colors bg-white/5 rounded-xl border border-white/10">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {isNavOpen && (
        <div className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-3xl flex flex-col items-center justify-center p-8 animate-in fade-in slide-in-from-top-4 duration-300 md:hidden">
            <button onClick={() => setIsNavOpen(false)} className="absolute top-6 right-6 p-4 bg-white/5 rounded-full text-white active:scale-90"><X className="w-7 h-7" /></button>
            <div className="flex flex-col items-center gap-10 text-center w-full max-w-xs">
                <button onClick={() => scrollToSection('mission')} className="text-3xl font-black uppercase tracking-widest text-white italic hover:text-cyan-400 transition-colors">Mission</button>
                <button onClick={() => { setIsNavOpen(false); setIsProductOpen(true); }} className="text-3xl font-black uppercase tracking-widest text-white italic hover:text-cyan-400 transition-colors">Products</button>
                <button onClick={() => scrollToSection('ocean')} className="text-3xl font-black uppercase tracking-widest text-white italic hover:text-cyan-400 transition-colors">Engine Ocean</button>
                <button onClick={() => { setIsNavOpen(false); setIsReferralOpen(true); }} className="text-3xl font-black uppercase tracking-widest text-white italic hover:text-cyan-400 transition-colors">Network</button>
                <div className="w-16 h-1 bg-cyan-600/30 rounded-full my-4"></div>
                <button onClick={() => { setIsNavOpen(false); setIsVisionOpen(true); }} className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500 hover:text-white transition-colors">Manifesto</button>
            </div>
        </div>
      )}

      <section className="relative pt-32 sm:pt-48 md:pt-64 pb-16 sm:pb-32 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-white/5 border border-white/10 rounded-full mb-8 sm:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-[7px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-cyan-400">Phase 3 Deployment active</span>
          </div>
          
          <h2 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[1.1] sm:leading-[0.8] mb-8 sm:mb-16 italic uppercase px-2">
            UNLEASH YOUR <br className="hidden sm:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">CURIOSITY.</span>
          </h2>
          
          <p className="text-gray-400 max-w-3xl mx-auto text-sm sm:text-lg md:text-2xl lg:text-3xl font-light leading-relaxed mb-10 sm:mb-16 px-4 italic animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Legacy education is dead. CuriousMinds is the neural catalyst for those who refuse to just memorize. Transform raw inquiry into world-defining expertise.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 px-4 w-full max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <button onClick={() => scrollToSection('demo')} className="w-full sm:w-auto px-10 sm:px-16 py-4 sm:py-6 bg-cyan-600 rounded-full font-black text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] hover:bg-cyan-500 transition-all shadow-[0_0_50px_rgba(8,145,178,0.3)] active:scale-95 group">
              Activate Engine <ChevronRight className="inline w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => setIsVisionOpen(true)} className="w-full sm:w-auto px-10 sm:px-16 py-4 sm:py-6 bg-white/5 border border-white/10 rounded-full font-black text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] hover:bg-white/10 transition-all flex items-center justify-center gap-4 active:scale-95 backdrop-blur-xl">
              Manifesto <ArrowUpRight className="w-4 h-4 sm:w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      <div className="relative z-20">
        <section id="demo" className="py-12 sm:py-24 md:py-32 bg-transparent px-4">
          <ScenarioGenerator 
            currentUser={currentUser} 
            onRequireAuth={() => setIsRegistrationOpen(true)} 
            externalMode={engineMode as 'SCENARIO' | 'BEYOU'}
            onModeChange={(mode) => setEngineMode(mode)}
          />
        </section>

        <section id="mission" className="bg-transparent px-4">
          <ImpactSection onRegister={() => setIsRegistrationOpen(true)} />
        </section>

        <section id="ocean" className="bg-transparent px-4">
          <EngineOcean />
        </section>
      </div>

      <footer className="py-16 sm:py-24 md:py-32 border-t border-white/5 bg-black/90 relative z-[100] backdrop-blur-2xl px-4">
        <div className="max-w-7xl mx-auto px-2 sm:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-16 lg:gap-32">
          <div className="sm:col-span-2 space-y-8 sm:space-y-12">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-3xl shadow-cyan-900/40">
                <BrainCircuit className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h1 className="text-xl sm:text-3xl font-black tracking-tighter uppercase italic">Curious<span className="text-cyan-500">Minds</span></h1>
            </div>
            <p className="text-gray-500 text-sm sm:text-lg max-w-md leading-relaxed italic">
              Proprietary cognitive architecture for the next era of human intelligence. Shift or be obsolete.
            </p>
            <div className="p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] bg-white/[0.03] border border-white/10 inline-flex flex-col gap-3 w-fit">
               <p className="text-[8px] sm:text-[10px] text-gray-600 uppercase font-black tracking-[0.3em] sm:tracking-[0.4em]">Master Uplink Synchronized</p>
               <p className="text-[10px] sm:text-sm text-green-500 font-mono flex items-center gap-3 sm:gap-4">
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                 CLUSTER_MUMBAI_ACTIVE // 001
               </p>
            </div>
          </div>
          <div>
            <h4 className="text-[9px] sm:text-[11px] font-black text-gray-600 uppercase tracking-[0.4em] sm:tracking-[0.6em] mb-8 sm:mb-12">Internal Systems</h4>
            <div className="flex flex-col gap-4 sm:gap-6 text-[10px] sm:text-xs font-black text-gray-500 uppercase tracking-widest">
              {currentUser?.role === 'ADMIN' && (
                <button onClick={() => setIsAdminOpen(true)} className="text-left text-cyan-500 hover:text-white transition-all flex items-center gap-3 group">
                   Master Cockpit <span className="text-[7px] bg-red-600/10 text-red-500 px-1.5 py-0.5 rounded font-black tracking-widest group-hover:bg-red-500 group-hover:text-white transition-all">Authorized</span>
                </button>
              )}
              <button onClick={() => setIsVisionOpen(true)} className="text-left hover:text-white transition-colors">Manifesto</button>
              <button onClick={() => setIsProductOpen(true)} className="text-left hover:text-white transition-colors">Products</button>
              <button onClick={() => scrollToSection('demo')} className="text-left hover:text-white transition-colors">Simulator</button>
            </div>
          </div>
          <div>
            <h4 className="text-[9px] sm:text-[11px] font-black text-gray-600 uppercase tracking-[0.4em] sm:tracking-[0.6em] mb-8 sm:mb-12">External Nodes</h4>
            <div className="flex flex-col gap-4 sm:gap-6 text-[10px] sm:text-xs font-black text-gray-500 uppercase tracking-widest">
              <a href="https://www.linkedin.com/company/9curiousminds/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-all flex items-center gap-3 group">LINKEDIN <ArrowUpRight className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" /></a>
              <a href="https://wa.me/917970750727" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-all flex items-center gap-3 group">WHATSAPP <MessageCircle className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" /></a>
              <a href="#" className="hover:text-cyan-400 transition-all flex items-center gap-3 group">X / GLOBAL <ArrowUpRight className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" /></a>
              <a href="#" className="hover:text-cyan-400 transition-all flex items-center gap-3 group">DISCORD <ArrowUpRight className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" /></a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-2 sm:px-10 mt-16 sm:mt-32 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <p className="text-[8px] sm:text-[10px] text-gray-700 font-mono leading-relaxed uppercase tracking-[0.2em]">
            © 2025 CURIOUSMINDS INC. // COGNITIVE DEPLOYMENT // PHASE 2.7
          </p>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-12 text-[8px] sm:text-[10px] text-gray-800 font-mono">
             <span className="uppercase tracking-[0.3em]">Privacy_Protocol</span>
             <span className="uppercase tracking-[0.3em]">Neural_Security</span>
          </div>
        </div>
      </footer>

      {isRegistrationOpen && <RegistrationModal onSuccess={handleRegistrationSuccess} onClose={() => setIsRegistrationOpen(false)} />}
      {isAdminOpen && <AdminDashboard onClose={() => setIsAdminOpen(false)} />}
      {isProductOpen && <ProductCapabilities onClose={() => setIsProductOpen(false)} onExplore={(id) => { setIsProductOpen(false); scrollToSection(id === 'ocean' ? 'ocean' : 'demo'); setEngineMode(id === 'beyou' ? 'BEYOU' : id === 'ocean' ? 'OCEAN' : 'SCENARIO'); }} />}
      {isReferralOpen && <ReferralOverlay currentUser={currentUser} onClose={() => setIsReferralOpen(false)} onRegister={() => setIsRegistrationOpen(true)} />}
      {isVisionOpen && <VisionModal onClose={() => setIsVisionOpen(false)} onAction={() => { setIsVisionOpen(false); scrollToSection('demo'); }} />}
      <GlobalChat currentUser={currentUser} />
    </div>
  );
};

export default App;

import React from 'react';
import { X, Quote, ArrowRight, Zap, Target, BrainCircuit, Sparkles, UserCheck, ShieldCheck, Globe } from 'lucide-react';

interface VisionModalProps {
  onClose: () => void;
  onAction: () => void;
}

const VisionModal: React.FC<VisionModalProps> = ({ onClose, onAction }) => {
  return (
    <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4 animate-in fade-in duration-500" onClick={onClose}>
        <div 
          className="bg-[#050505] border border-white/10 w-full max-w-6xl max-h-[95vh] rounded-[4rem] shadow-[0_0_120px_rgba(34,211,238,0.1)] relative overflow-hidden flex flex-col lg:flex-row"
          onClick={e => e.stopPropagation()}
        >
            <button onClick={onClose} className="absolute top-8 right-8 z-50 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white transition-all group backdrop-blur-md">
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
            </button>

            {/* Side Branding & Portrait Placeholder */}
            <div className="lg:w-[40%] bg-gradient-to-b from-[#0a0a0a] to-black border-b lg:border-b-0 lg:border-r border-white/5 p-12 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.02] bg-[size:30px_30px]"></div>
                
                <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center">
                    <div className="w-48 h-48 rounded-[3rem] bg-gradient-to-tr from-gray-800 to-gray-900 border border-white/10 mb-8 overflow-hidden flex items-center justify-center shadow-2xl relative">
                        <UserCheck className="w-20 h-20 text-cyan-500/50" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tighter mb-2">Aman Kumar Singh</h2>
                    <p className="text-[10px] font-mono tracking-[0.5em] uppercase text-cyan-500 mb-8">Architect of the Shift</p>
                    
                    <div className="space-y-4 w-full max-w-[280px]">
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <ShieldCheck className="w-5 h-5 text-green-500" />
                            <div className="text-left"><p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Status</p><p className="text-xs text-white">Active Deployment</p></div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <Globe className="w-5 h-5 text-blue-500" />
                            <div className="text-left"><p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Reach</p><p className="text-xs text-white">Global Scalability</p></div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 pt-8 border-t border-white/5 text-center">
                    <p className="text-[8px] font-mono tracking-widest text-gray-700 uppercase">Proprietary Founder Vision // Node CM-001</p>
                </div>
            </div>

            {/* Manifest Content Area */}
            <div className="flex-1 p-8 md:p-20 overflow-y-auto custom-scrollbar bg-black/40" data-lenis-prevent>
                <div className="max-w-3xl">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="h-[1px] flex-1 bg-white/10"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-gray-500">The Manifest</span>
                        <div className="h-[1px] flex-1 bg-white/10"></div>
                    </div>

                    <Quote className="w-16 h-16 text-cyan-500/10 mb-8" />
                    <h3 className="text-3xl md:text-6xl font-black text-white mb-12 tracking-tight leading-none italic">
                        Ending the factory model <br/> <span className="text-gray-500">once and for all.</span>
                    </h3>
                    
                    <div className="space-y-8 text-gray-400 text-lg md:text-xl leading-relaxed">
                        <p className="drop-shadow-sm">
                            Legacy education is a relic. It was designed for a world that no longer exists—a world of repetition and obedience. Today, the only currency that matters is <span className="text-white font-bold underline decoration-cyan-500 underline-offset-8">Synthesis</span>.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-10">
                            <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 group hover:border-cyan-500/40 transition-all">
                                <BrainCircuit className="w-8 h-8 text-cyan-500 mb-6 group-hover:scale-110 transition-transform" />
                                <h4 className="text-white font-black text-xl mb-3 tracking-tight">The Neural Promise</h4>
                                <p className="text-sm leading-relaxed text-gray-500">We don't teach you what to think. We build simulations that force your brain to evolve through actual resolution.</p>
                            </div>
                            <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 group hover:border-purple-500/40 transition-all">
                                <Sparkles className="w-8 h-8 text-purple-500 mb-6 group-hover:scale-110 transition-transform" />
                                <h4 className="text-white font-black text-xl mb-3 tracking-tight">Predictive Destiny</h4>
                                <p className="text-sm leading-relaxed text-gray-500">Using beYOU behavior models, we map your trajectory to success before you even graduate. Data-driven career clarity.</p>
                            </div>
                        </div>

                        <p className="font-medium text-gray-300">
                            "CuriousMinds is not just a platform; it's a cognitive upgrade. Our very first cohort is seeing a <span className="text-cyan-400 font-black italic">100% change in 3 weeks</span> because we've stopped pretending theory is enough."
                        </p>

                        <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-10 pb-10">
                            <div className="flex flex-col">
                                <p className="text-white font-black text-2xl tracking-tighter">Aman Kumar Singh</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Founder & Vision Lead, CuriousMinds</p>
                            </div>
                            <button 
                                onClick={onAction}
                                className="w-full md:w-auto px-12 py-6 bg-white text-black font-black rounded-full text-xs uppercase tracking-[0.2em] hover:bg-cyan-500 transition-all flex items-center justify-center gap-3 group shadow-2xl"
                            >
                                Secure My Future <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 5px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #111; border-radius: 20px; }
        `}</style>
    </div>
  );
};

export default VisionModal;


import React, { useState } from 'react';
import { Gift, X, Copy, CheckCircle2, ArrowRight, ShieldCheck, Ticket } from 'lucide-react';
import { UserProfile } from '../types';

interface ReferralOverlayProps {
  onClose: () => void;
  currentUser: UserProfile | null;
  onRegister: () => void;
}

const ReferralOverlay: React.FC<ReferralOverlayProps> = ({ onClose, currentUser, onRegister }) => {
  const [redeemCode, setRedeemCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const referralCode = currentUser?.referralCode || "---";

  const handleCopy = () => {
     if (currentUser && currentUser.referralCode && currentUser.referralCode !== "---") {
        navigator.clipboard.writeText(currentUser.referralCode);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
     } else if (!currentUser) {
        alert("Please register to get your unique referral code.");
     }
  };

  const handleRedeem = (e: React.FormEvent) => {
      e.preventDefault();
      if (!redeemCode.trim()) return;
      alert(`Validating code: ${redeemCode.toUpperCase()}... Verification successful. Credits will be applied to your next session.`);
      setRedeemCode('');
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-in fade-in duration-300">
       <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-20 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all active:scale-90"
       >
          <X className="w-6 h-6" />
       </button>

       <div className="w-full max-w-4xl bg-gradient-to-br from-green-600 to-emerald-900 rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col items-center justify-center text-center p-8 md:p-16 border border-white/10">
          
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 mix-blend-overlay pointer-events-none"></div>
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-yellow-400/20 rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-400/20 rounded-full blur-[100px]"></div>

          <div className="relative z-10 flex flex-col items-center w-full">
             <div className="mb-6 animate-bounce">
                <Gift className="w-20 h-20 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]" />
             </div>

             <h2 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter uppercase italic">
                Education Chain Reaction
             </h2>
             <p className="text-lg md:text-xl text-emerald-100 mb-12 font-medium opacity-80">
                Earn when YOUR network grows THE network.
             </p>

             {/* Tiers */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full max-w-3xl">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 transform hover:scale-105 transition-all duration-300">
                    <div className="text-5xl font-black text-white mb-2 drop-shadow-md">$10</div>
                    <div className="text-emerald-200 font-black uppercase tracking-widest text-[10px]">1st Degree</div>
                    <p className="text-[10px] text-white/50 mt-2">Direct Referral</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 transform hover:scale-105 transition-all duration-300 delay-100">
                    <div className="text-5xl font-black text-yellow-300 mb-2 drop-shadow-md">+$5</div>
                    <div className="text-emerald-200 font-black uppercase tracking-widest text-[10px]">2nd Degree</div>
                    <p className="text-[10px] text-white/50 mt-2">Friends of Friends</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 transform hover:scale-105 transition-all duration-300 delay-200">
                    <div className="text-5xl font-black text-cyan-300 mb-2 drop-shadow-md">+$2</div>
                    <div className="text-emerald-200 font-black uppercase tracking-widest text-[10px]">3rd Degree</div>
                    <p className="text-[10px] text-white/50 mt-2">Network Effect</p>
                </div>
             </div>

             {/* Split Display: Your Code & Validate Others */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                {/* YOUR CODE */}
                <div className="bg-black/30 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 flex flex-col justify-between">
                   <div>
                      <p className="text-emerald-200 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
                         <ShieldCheck className="w-4 h-4" /> Your Referral Code
                      </p>
                      <div className="flex items-center gap-3">
                         <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-5 text-2xl font-mono text-white tracking-[0.3em] text-center shadow-inner">
                            {referralCode}
                         </div>
                         <button 
                            onClick={handleCopy} 
                            className={`p-5 rounded-2xl transition-all active:scale-90 ${isCopied ? 'bg-green-500 text-white' : 'bg-white text-emerald-900 hover:bg-emerald-100'}`}
                         >
                            {isCopied ? <CheckCircle2 className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                         </button>
                      </div>
                   </div>
                   <p className="text-[9px] text-white/40 mt-6 leading-relaxed uppercase tracking-widest">
                      Share this node signature with peers. Rewards credited to your CuriousMinds wallet automatically.
                   </p>
                </div>

                {/* VALIDATE OTHERS */}
                <div className="bg-black/30 backdrop-blur-md p-8 rounded-[2rem] border border-white/10">
                   <p className="text-emerald-200 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
                      <Ticket className="w-4 h-4" /> Redeem Referral Code
                   </p>
                   <form onSubmit={handleRedeem} className="flex flex-col gap-3">
                      <input 
                         value={redeemCode}
                         onChange={e => setRedeemCode(e.target.value)}
                         placeholder="Enter signature..." 
                         className="bg-black/40 border border-white/10 rounded-2xl p-5 text-lg font-mono text-white tracking-widest text-center uppercase outline-none focus:border-emerald-500/50 transition-all placeholder:text-gray-700"
                      />
                      <button 
                        type="submit"
                        disabled={!redeemCode.trim()}
                        className="py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg"
                      >
                         Validate Signature
                      </button>
                   </form>
                   {!currentUser && (
                      <button 
                        onClick={() => { onClose(); onRegister(); }}
                        className="mt-4 w-full text-[9px] font-black uppercase text-emerald-400 hover:text-white transition-colors tracking-widest"
                      >
                        Don't have an account? Register Now
                      </button>
                   )}
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

export default ReferralOverlay;

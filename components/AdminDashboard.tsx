import React, { useState, useEffect, useMemo } from 'react';
import { mockBackend } from '../services/mockBackend';
import { UserProfile, SystemMetric, InteractionEvent, UserRole, LeadCapsule } from '../types';
import { Shield, Users, Activity, Unlock, LogOut, History, MapPin, Ban, Terminal, Globe, Search, X, Clock, RefreshCcw, Cpu, Database, Network, Radar, Zap, Check, Key, Settings, UserCog, Waves, Filter, Calendar, ExternalLink, ShieldCheck, Monitor, Smartphone, Monitor as DesktopIcon, Tablet as TabletIcon, HardDrive, Inbox, UserPlus } from 'lucide-react';
import LiveGlobe from './LiveGlobe';

interface AdminDashboardProps {
  onClose: () => void;
}

const DeviceIcon = ({ type }: { type: string }) => {
    if (type.includes('Phone')) return <Smartphone className="w-3 h-3" />;
    if (type.includes('Tablet')) return <TabletIcon className="w-3 h-3" />;
    return <DesktopIcon className="w-3 h-3" />;
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'USERS' | 'LEADS' | 'RBAC' | 'LOGS' | 'SETTINGS'>('OVERVIEW');
  const [selectedUserLogs, setSelectedUserLogs] = useState<{name: string, id: string, logs: InteractionEvent[]} | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [leads, setLeads] = useState<LeadCapsule[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric | null>(null);
  const [logs, setLogs] = useState<InteractionEvent[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState<number>(30); // minutes
  const [newAdminPass, setNewAdminPass] = useState('');

  const currentSessionId = useMemo(() => mockBackend.getCurrentSessionId(), []);

  const fetchData = () => {
    setSystemMetrics(mockBackend.getSystemMetrics());
    setLogs(mockBackend.getTrafficLogs(timeFilter));
    setUsers(mockBackend.getAllUsers());
    setLeads(mockBackend.getLeads());
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchData(); 
    const interval = setInterval(fetchData, 4000); 
    return () => clearInterval(interval);
  }, [isAuthenticated, timeFilter]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (mockBackend.authenticateAdmin(username, password)) setIsAuthenticated(true);
    else alert("Neural signature mismatch.");
  };

  const handleRoleUpdate = (userId: string, role: UserRole) => {
      mockBackend.updateUserRole(userId, role);
      fetchData();
  };

  const handlePasswordChange = (e: React.FormEvent) => {
      e.preventDefault();
      if (newAdminPass.length < 6) { alert("Invalid length."); return; }
      mockBackend.updateAdminPassword(newAdminPass);
      setNewAdminPass('');
      alert("Key rotated.");
  };

  const viewUserHistory = (user: UserProfile) => {
      const userLogs = mockBackend.getUserNavigationLogs(user.id);
      setSelectedUserLogs({ name: user.name, id: user.id, logs: userLogs });
  };

  const handleToggleBlock = (userId: string) => {
      mockBackend.toggleBlockUser(userId);
      fetchData(); 
  };

  const filteredUsers = users.filter(u => 
      u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.ip.includes(userSearch)
  );

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/98 backdrop-blur-3xl p-4">
        <div className="bg-[#0a0a0a] border border-white/10 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] w-full max-w-sm shadow-2xl relative overflow-hidden text-center animate-in zoom-in-95 duration-300">
           <div className="absolute top-0 left-0 w-full h-1 bg-cyan-600"></div>
           <div className="flex flex-col items-center mb-6 sm:mb-8">
              <div className="p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 mb-4">
                 <Shield className="w-8 h-8 text-cyan-500" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tighter uppercase italic">Cockpit</h2>
              <p className="text-[9px] text-gray-600 uppercase tracking-widest mt-1">Node Verification Required</p>
           </div>
           <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white outline-none focus:border-cyan-500/50 transition-all text-xs" placeholder="Node Identity" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-white outline-none focus:border-cyan-500/50 transition-all text-xs" placeholder="Security Key" />
              <button type="submit" className="w-full bg-white text-black font-black py-4 rounded-xl transition-all active:scale-95 shadow-xl hover:bg-cyan-500 uppercase tracking-widest text-[10px]">Authorize</button>
              <button type="button" onClick={onClose} className="w-full py-2 text-gray-500 font-bold hover:text-white transition-colors uppercase tracking-widest text-[9px]">Abort</button>
           </form>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-[250] bg-black/50 backdrop-blur-3xl text-white flex flex-col animate-in fade-in duration-300 overflow-hidden font-mono"
      data-lenis-prevent
    >
      <div className="h-16 sm:h-20 border-b border-white/5 flex justify-between items-center px-4 sm:px-10 bg-black/80 shrink-0">
         <div className="flex items-center gap-3 sm:gap-6">
            <Radar className="w-5 h-5 sm:w-7 h-7 text-cyan-500 animate-pulse" />
            <div>
               <h2 className="font-black tracking-tighter text-sm sm:text-xl uppercase italic leading-none">Cockpit <span className="text-cyan-500">v2.7</span></h2>
               <div className="flex items-center gap-2 text-[7px] text-gray-500 tracking-[0.2em] uppercase mt-1">
                  <div className="w-1 h-1 rounded-full bg-green-500 animate-ping"></div>
                  LINK: ACTIVE
               </div>
            </div>
         </div>
         <button onClick={onClose} className="p-2.5 sm:p-3 bg-red-600/10 border border-red-500/20 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all group active:scale-90">
            <LogOut className="w-4 h-4 sm:w-5 h-5" />
         </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
         <div className="w-14 sm:w-24 bg-black border-r border-white/5 flex flex-col items-center py-6 sm:py-8 space-y-4 sm:space-y-8 shrink-0">
            {[
              {id:'OVERVIEW', icon: Activity}, 
              {id:'USERS', icon: Users}, 
              {id:'LEADS', icon: UserPlus},
              {id:'RBAC', icon: UserCog},
              {id:'LOGS', icon: Terminal},
              {id:'SETTINGS', icon: Settings}
            ].map(tab => (
               <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`group relative p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all ${activeTab === tab.id ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20' : 'text-gray-700 hover:text-white'}`}>
                  <tab.icon className="w-4 h-4 sm:w-6 h-6" />
                  {activeTab === tab.id && <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 sm:h-10 bg-cyan-500 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.7)]"></div>}
               </button>
            ))}
         </div>

         <div className="flex-1 h-full overflow-y-auto p-4 sm:p-10 custom-scrollbar bg-transparent" data-lenis-prevent>
            
            {activeTab === 'OVERVIEW' && systemMetrics && (
                <div className="space-y-6 animate-in fade-in max-w-6xl mx-auto pb-20">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-black/60 border border-white/5 p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] relative overflow-hidden">
                           <p className="text-[7px] sm:text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 sm:mb-4">Active Nodes</p>
                           <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tighter">{systemMetrics.activeConnections}</h3>
                        </div>
                        <div className="bg-black/60 border border-white/5 p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] relative overflow-hidden">
                           <p className="text-[7px] sm:text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 sm:mb-4">Lead Capsules</p>
                           <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tighter">{leads.length}</h3>
                        </div>
                        <div className="bg-black/60 border border-white/5 p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] relative overflow-hidden">
                           <p className="text-[7px] sm:text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 sm:mb-4">Latency</p>
                           <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tighter">{systemMetrics.latency}ms</h3>
                        </div>
                    </div>
                    <div className="aspect-video sm:h-[500px] border border-white/5 rounded-[1.5rem] sm:rounded-[3rem] overflow-hidden relative bg-black/40">
                        <LiveGlobe activeUsers={users} />
                    </div>
                </div>
            )}

            {activeTab === 'LEADS' && (
                <div className="space-y-6 animate-in fade-in max-w-5xl mx-auto pb-20">
                    <h3 className="text-lg sm:text-3xl font-black text-white tracking-tighter flex items-center gap-3 uppercase italic"><Inbox className="w-8 h-8 text-cyan-500" /> Archive</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {leads.length === 0 ? (
                            <div className="text-center py-20 opacity-20 text-gray-600 uppercase tracking-widest text-xs">Zero signatures detected</div>
                        ) : leads.map(lead => (
                            <div key={lead.id} className="bg-black/60 border border-white/5 p-5 sm:p-8 rounded-[1.2rem] sm:rounded-[2.5rem] flex flex-col md:flex-row gap-6">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-lg">{lead.location.flag}</div>
                                        <div>
                                            <p className="font-black text-white text-sm uppercase italic">{lead.name}</p>
                                            <p className="text-[8px] text-gray-500 uppercase">{lead.email}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5">
                                        <p className="text-[7px] font-black text-cyan-500 uppercase tracking-widest mb-1">Intent</p>
                                        <p className="text-[10px] sm:text-xs text-gray-300 italic">"{lead.firstQuery}"</p>
                                    </div>
                                </div>
                                <div className="md:w-48 text-[9px] text-gray-500 flex flex-col justify-center space-y-1.5 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6">
                                    <div className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {lead.location.city}</div>
                                    <div className="flex items-center gap-2"><DeviceIcon type={lead.device} /> {lead.device.split(' ')[0]}</div>
                                    <div className="flex items-center gap-2"><Clock className="w-3 h-3 text-cyan-500" /> {new Date(lead.timestamp).toLocaleTimeString()}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'USERS' && (
                <div className="space-y-6 animate-in fade-in max-w-6xl mx-auto pb-20">
                    <div className="relative mb-6">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
                        <input type="text" placeholder="Identity Node Search..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-xl sm:rounded-2xl px-12 py-3.5 sm:py-4 outline-none focus:border-cyan-500/50 text-xs sm:text-sm" />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                        {filteredUsers.map(user => (
                            <div key={user.id} className={`bg-black/60 border p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] flex flex-col gap-6 ${user.id === currentSessionId ? 'border-cyan-500/30 bg-cyan-500/[0.03]' : 'border-white/5'} ${user.isBlocked ? 'opacity-40 grayscale border-red-500/30' : ''}`}>
                                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-2xl shrink-0">
                                            {user.id === currentSessionId ? '👑' : user.location?.flag}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h4 className="font-black text-sm sm:text-lg text-white truncate uppercase italic">{user.name}</h4>
                                                <span className="text-[7px] px-2 py-0.5 bg-white/10 text-gray-500 rounded-full font-black uppercase tracking-widest">{user.role}</span>
                                            </div>
                                            <p className="text-[8px] text-gray-500 mt-0.5 font-mono truncate">ID: {user.id}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
                                        <button onClick={() => viewUserHistory(user)} className="flex-1 lg:flex-none p-3.5 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/10 flex items-center justify-center gap-2">
                                           <History className="w-3.5 h-3.5" /> Audit
                                        </button>
                                        {user.id !== currentSessionId && (
                                          <button onClick={() => handleToggleBlock(user.id)} className={`p-3.5 rounded-xl border transition-all ${user.isBlocked ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                             {user.isBlocked ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                          </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Tabs like RBAC, LOGS, SETTINGS would follow similar minimal responsive tweaks */}
         </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
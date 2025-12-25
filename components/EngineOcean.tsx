
import React, { useState, useRef, useEffect } from 'react';
import { Search, Waves, Volume2, Loader2, Sparkles, BookOpen, GraduationCap, Target, ExternalLink, FileDown, Globe, Play, Square, User, Bot, Microscope, Activity, Zap, ChevronRight, Gauge, Headphones, X, CheckCircle2 } from 'lucide-react';
import { engineOceanQuery, generateSpeech, deepDiveQuery } from '../services/geminiService';
import { jsPDF } from 'jspdf';
import { mockBackend } from '../services/mockBackend';

const LANGUAGES = [
  { name: 'English', code: 'en' },
  { name: 'Hindi', code: 'hi' },
  { name: 'Spanish', code: 'es' },
  { name: 'French', code: 'fr' },
  { name: 'German', code: 'de' },
  { name: 'Japanese', code: 'ja' }
];

const DIFFICULTIES = ['Standard', 'Adaptive', 'Specialized', 'Hardcore'];
const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

type AudioStatus = 'IDLE' | 'LOADING' | 'PLAYING';
type AudioChoice = 'HUMANIZED' | 'DEEP_DIVE' | 'BOTH';

const AudioVisualizer = () => (
  <div className="flex items-end gap-[2px] h-3 w-4">
    <div className="w-[2px] bg-cyan-400 animate-[sound-wave_0.8s_ease-in-out_infinite] h-1"></div>
    <div className="w-[2px] bg-cyan-400 animate-[sound-wave_1.1s_ease-in-out_infinite_0.1s] h-2"></div>
    <div className="w-[2px] bg-cyan-400 animate-[sound-wave_0.9s_ease-in-out_infinite_0.2s] h-1.5"></div>
  </div>
);

const EngineOcean: React.FC = () => {
  const [query, setQuery] = useState('');
  const [grade, setGrade] = useState('10');
  const [marks, setMarks] = useState('5');
  const [difficulty, setDifficulty] = useState('Standard');
  const [loading, setLoading] = useState(false);
  const [deepDiveLoading, setDeepDiveLoading] = useState(false);
  const [result, setResult] = useState<{ humanized: string, summary: string, grounding: any[], deepDive?: string } | null>(null);
  const [audioStatus, setAudioStatus] = useState<AudioStatus>('IDLE');
  const [isExporting, setIsExporting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showAudioSelector, setShowAudioSelector] = useState(false);
  
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => stopAudio();
  }, []);

  const stopAudio = () => {
    if (audioSourceRef.current) {
      try { audioSourceRef.current.stop(); } catch(e){}
      audioSourceRef.current = null;
    }
    setAudioStatus('IDLE');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const currentUser = mockBackend.getCurrentUser();
    const userId = currentUser?.id || mockBackend.getCurrentSessionId();
    if (!mockBackend.checkUsageLimit(userId, 'OCEAN')) { alert("Daily quota reached."); return; }

    setLoading(true);
    setResult(null);
    stopAudio();
    try {
      const data = await engineOceanQuery(query, grade, marks, difficulty);
      setResult(data);
      mockBackend.incrementUsage(userId, 'OCEAN');
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 200);
    } catch (e) { alert("Resolution failed."); } finally { setLoading(false); }
  };

  const handleDeepDive = async () => {
    if (!result || deepDiveLoading) return;
    setDeepDiveLoading(true);
    try {
      const dd = await deepDiveQuery(query, result.humanized);
      setResult(prev => prev ? { ...prev, deepDive: dd } : null);
    } catch (e) { alert("Neural expansion failed."); } finally { setDeepDiveLoading(false); }
  };

  const initiateAudioSelection = () => {
    if (!result) return;
    if (audioStatus === 'PLAYING') {
      stopAudio();
      return;
    }
    setShowAudioSelector(true);
  };

  const handleSpeak = async (choice: AudioChoice) => {
    if (!result) return;
    setShowAudioSelector(false);
    setAudioStatus('LOADING');
    
    // FAST TRACK: Pre-initialize and resume AudioContext immediately on user interaction
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    }
    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }
    
    try {
      let textToRead = "";
      if (choice === 'HUMANIZED') {
        textToRead = `Briefing: ${result.humanized}`;
      } else if (choice === 'DEEP_DIVE') {
        textToRead = result.deepDive ? `Nexus Deep Dive Analysis: ${result.deepDive}` : `Nexus Deep Dive analysis is not yet generated. Synthesis complete.`;
      } else if (choice === 'BOTH') {
        textToRead = `Briefing: ${result.humanized}. ${result.deepDive ? `Nexus Deep Dive Analysis: ${result.deepDive}` : ''} AI Synthesis Summary: ${result.summary}`;
      }

      const buffer = await generateSpeech(textToRead, selectedLanguage);
      if (buffer) {
        const source = audioCtxRef.current.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = playbackSpeed;
        source.connect(audioCtxRef.current.destination);
        source.start(0);
        audioSourceRef.current = source;
        setAudioStatus('PLAYING');
        source.onended = () => setAudioStatus('IDLE');
      } else {
        setAudioStatus('IDLE');
      }
    } catch (e) {
      setAudioStatus('IDLE');
    }
  };

  const cleanText = (text: string) => {
    return text
      .replace(/[*#_~`>]/g, '') // Remove common markdown and special characters
      .replace(/\s+/g, ' ') // Normalize whitespace to single spaces
      .trim();
  };

  const handleExportPDF = async () => {
    if (!result) return;
    setIsExporting(true);
    
    try {
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let currentY = 0;

      const checkNewPage = (neededHeight: number) => {
        if (currentY + neededHeight > pageHeight - margin) {
          doc.addPage();
          currentY = margin;
          drawHeader();
          return true;
        }
        return false;
      };

      const drawHeader = () => {
        // Top dark bar
        doc.setFillColor(8, 10, 15);
        doc.rect(0, 0, pageWidth, 45, 'F');
        
        // Brand Name
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(26);
        doc.text('CuriousMinds', margin, 20);
        
        // Product Subtitle
        doc.setTextColor(34, 211, 238); // Cyan-400
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('SYNTHESIS ENGINE // ENGINE OCEAN UPLINK', margin, 27);

        // Metadata Badge
        doc.setFillColor(255, 255, 255, 0.05);
        doc.roundedRect(pageWidth - margin - 45, 13, 45, 18, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text(`DATE: ${new Date().toLocaleDateString()}`, pageWidth - margin - 42, 19);
        doc.text(`GRADE: ${grade}`, pageWidth - margin - 42, 25);
        
        currentY = 60;
      };

      const drawFooter = () => {
        const pageCount = (doc.internal as any).getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
          doc.text('© 2025 CURIOUSMINDS INC. // PROPRIETARY COGNITIVE SYNTHESIS', margin, pageHeight - 10);
        }
      };

      drawHeader();

      // Title Section
      doc.setTextColor(20, 20, 20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      const titleLines = doc.splitTextToSize(query.toUpperCase(), contentWidth);
      doc.text(titleLines, margin, currentY);
      currentY += (titleLines.length * 8) + 12;

      // Section: Humanized Briefing
      doc.setTextColor(34, 211, 238);
      doc.setFontSize(11);
      doc.text('01. HUMANIZED BRIEFING', margin, currentY);
      currentY += 6;
      doc.setDrawColor(34, 211, 238);
      doc.setLineWidth(0.5);
      doc.line(margin, currentY, margin + 40, currentY);
      currentY += 10;

      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      const briefingText = cleanText(result.humanized);
      const briefingLines = doc.splitTextToSize(briefingText, contentWidth);
      
      briefingLines.forEach((line: string) => {
        checkNewPage(6);
        doc.text(line, margin, currentY);
        currentY += 6;
      });

      // Section: Deep Dive (if exists)
      if (result.deepDive) {
        currentY += 15;
        checkNewPage(40);
        
        doc.setTextColor(147, 51, 234); // Purple-600
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('02. NEXUS DEEP DIVE ANALYSIS', margin, currentY);
        currentY += 6;
        doc.setDrawColor(147, 51, 234);
        doc.line(margin, currentY, margin + 55, currentY);
        currentY += 10;

        doc.setTextColor(80, 80, 80);
        doc.setFont('helvetica', 'italic');
        const deepDiveText = cleanText(result.deepDive);
        const deepDiveLines = doc.splitTextToSize(deepDiveText, contentWidth);
        
        deepDiveLines.forEach((line: string) => {
          checkNewPage(6);
          doc.text(line, margin, currentY);
          currentY += 6;
        });
      }

      // Section: AI Engine Perspective
      currentY += 15;
      checkNewPage(40);
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('03. ENGINE PERSPECTIVE', margin, currentY);
      currentY += 10;
      
      doc.setFillColor(248, 250, 252); // Light Slate background
      const summaryText = cleanText(result.summary);
      const summaryLines = doc.splitTextToSize(summaryText, contentWidth - 10);
      doc.roundedRect(margin - 2, currentY - 5, contentWidth + 4, (summaryLines.length * 5) + 10, 2, 2, 'F');
      
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      summaryLines.forEach((line: string) => {
        checkNewPage(5);
        doc.text(line, margin + 2, currentY);
        currentY += 5;
      });

      drawFooter();
      
      doc.save(`CuriousMinds_Ocean_Report_${query.replace(/\s+/g, '_').substring(0, 20)}.pdf`);
    } catch (e) {
      console.error(e);
      alert("High-fidelity PDF generation failed. Network node error.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section id="ocean" className="py-12 sm:py-32 px-1 sm:px-4 bg-gradient-to-b from-black to-[#050505] relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
      
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-4 sm:mb-6">
            <Waves className="w-4 h-4 text-cyan-400" />
            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Adaptive Intelligence Hub</span>
          </div>
          <h2 className="text-3xl sm:text-6xl font-black text-white mb-4 sm:mb-6 tracking-tight italic uppercase">Engine <span className="text-cyan-500">Ocean</span></h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-xs sm:text-lg px-4">Structural resolution engine for high-stakes inquiry. Calibrated for speed and precision.</p>
        </div>

        <div className="glass-panel p-5 sm:p-12 rounded-[1.5rem] sm:rounded-[3rem] border border-white/10 shadow-3xl">
          <form onSubmit={handleSearch} className="space-y-6 sm:space-y-8">
            <div className="relative group">
              <Search className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 h-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
              <input 
                value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Topic for resolution..."
                className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl px-12 sm:px-16 py-4 sm:py-5 text-white outline-none focus:border-cyan-500/50 transition-all text-xs sm:text-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="text-[8px] sm:text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Academic Node</label>
                <select value={grade} onChange={e => setGrade(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none cursor-pointer text-[10px] sm:text-xs">
                  {[...Array(12)].map((_, i) => <option key={i} value={i+1} className="bg-black">Grade {i+1}</option>)}
                  <option value="University" className="bg-black">University</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[8px] sm:text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-2"><Target className="w-4 h-4" /> Marks Calibration</label>
                <select value={marks} onChange={e => setMarks(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none cursor-pointer text-[10px] sm:text-xs">
                  <option value="1" className="bg-black">1 - Atomic</option>
                  <option value="3" className="bg-black">3 - Concise</option>
                  <option value="5" className="bg-black">5 - Core</option>
                  <option value="10" className="bg-black">10 - Deep</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[8px] sm:text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-2"><Activity className="w-4 h-4" /> Difficulty Bias</label>
                <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none cursor-pointer text-[10px] sm:text-xs">
                  {DIFFICULTIES.map(d => <option key={d} value={d} className="bg-black">{d}</option>)}
                </select>
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full py-4 sm:py-5 bg-cyan-600 hover:bg-cyan-500 rounded-xl sm:rounded-2xl font-black text-white flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-2xl uppercase tracking-widest text-[9px] sm:text-xs">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-4 h-4 sm:w-5 h-5" /> Activate Ocean Uplink</>}
            </button>
          </form>

          {result && !loading && (
            <div ref={resultRef} className="mt-12 sm:mt-16 animate-in fade-in zoom-in-95 duration-700">
              <div className="flex flex-col xl:flex-row justify-between items-center gap-4 sm:gap-6 mb-8 sm:mb-10 bg-cyan-950/20 border border-cyan-500/20 p-4 sm:p-6 rounded-[1.2rem] sm:rounded-[2rem]">
                <div className="flex items-center gap-2 sm:gap-3 text-cyan-400">
                  <BookOpen className="w-5 h-5 sm:w-6 h-6" />
                  <span className="text-[9px] sm:text-xs font-black uppercase tracking-tight sm:tracking-[0.2em]">Synthesis Delivered</span>
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 w-full xl:w-auto">
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 px-3 py-2 rounded-lg sm:rounded-xl border border-white/10 shrink-0">
                    <Globe className="w-3.5 h-3.5 text-gray-500" />
                    <select value={selectedLanguage} onChange={e => setSelectedLanguage(targetValue => targetValue)} className="bg-transparent text-[8px] sm:text-[10px] font-black uppercase text-white outline-none cursor-pointer">
                      {LANGUAGES.map(l => <option key={l.code} value={l.name} className="bg-black">{l.name}</option>)}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 px-3 py-2 rounded-lg sm:rounded-xl border border-white/10 shrink-0">
                    <Gauge className="w-3.5 h-3.5 text-gray-500" />
                    <select value={playbackSpeed} onChange={e => setPlaybackSpeed(parseFloat(e.target.value))} className="bg-transparent text-[8px] sm:text-[10px] font-black uppercase text-white outline-none cursor-pointer">
                      {PLAYBACK_SPEEDS.map(s => <option key={s} value={s} className="bg-black">{s}x</option>)}
                    </select>
                  </div>

                  <button onClick={initiateAudioSelection} className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase transition-all shadow-xl active:scale-95 min-w-[100px] ${audioStatus === 'PLAYING' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                    {audioStatus === 'LOADING' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : audioStatus === 'PLAYING' ? <Square className="w-2.5 h-2.5 fill-current" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{audioStatus === 'PLAYING' ? 'Stop' : 'Listen'}</span>
                    {audioStatus === 'PLAYING' && <AudioVisualizer />}
                  </button>

                  <button onClick={handleDeepDive} disabled={deepDiveLoading} className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-5 py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest border border-cyan-500/30 transition-all active:scale-95 min-w-[100px]">
                    {deepDiveLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Microscope className="w-3.5 h-3.5" />} Deep Dive
                  </button>

                  <button onClick={handleExportPDF} disabled={isExporting} className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-5 py-2.5 bg-white text-black rounded-lg sm:rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all flex items-center min-w-[100px]">
                    {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />} PDF
                  </button>
                </div>
              </div>
              
              <div className="space-y-8 sm:space-y-12">
                 <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-2 text-[8px] sm:text-[10px] font-black uppercase text-cyan-400 tracking-widest bg-cyan-400/10 w-fit px-3 py-1.5 rounded-lg border border-cyan-400/20"><User className="w-3.5 h-3.5" /> Humanized Briefing</div>
                    <div className="prose prose-invert prose-sm sm:prose-lg max-w-none text-gray-200 bg-white/5 p-5 sm:p-12 rounded-[1.2rem] sm:rounded-[2.5rem] border border-white/5 leading-relaxed shadow-2xl font-light">
                      {cleanText(result.humanized).split('\n').map((line, i) => <p key={i} className="mb-4 sm:mb-6 last:mb-0">{line}</p>)}
                      
                      {result.deepDive && (
                        <div className="mt-8 sm:mt-12 pt-8 sm:pt-12 border-t border-white/10 animate-in fade-in slide-in-from-top-4">
                           <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8 text-cyan-400 font-black uppercase text-[10px] sm:text-xs tracking-widest">
                             <Microscope className="w-4 h-4 sm:w-5 h-5" /> Nexus Deep Dive Analysis
                           </div>
                           <div className="text-gray-400 text-sm sm:text-base leading-relaxed italic border-l-2 border-cyan-500/30 pl-4 sm:pl-8 whitespace-pre-wrap">
                             {cleanText(result.deepDive)}
                           </div>
                        </div>
                      )}
                    </div>
                 </div>

                 <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-2 text-[8px] sm:text-[10px] font-black uppercase text-purple-400 tracking-widest bg-purple-400/10 w-fit px-3 py-1.5 rounded-lg border border-purple-400/20"><Bot className="w-3.5 h-3.5" /> Engine Perspective</div>
                    <div className="prose prose-invert prose-xs sm:prose-sm max-w-none text-gray-500 bg-purple-500/5 p-5 sm:p-8 rounded-[1.2rem] sm:rounded-[2rem] border border-purple-500/10 leading-relaxed italic">
                      {cleanText(result.summary)}
                    </div>
                 </div>
              </div>

              {result.grounding.length > 0 && (
                <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-white/5 overflow-x-auto no-scrollbar">
                  <span className="text-[8px] sm:text-[10px] text-gray-600 uppercase font-black tracking-[0.2em] sm:tracking-[0.3em] block mb-4">Neural Data Nodes:</span>
                  <div className="flex gap-2 sm:gap-3 pb-2">
                    {result.grounding.map((chunk, i) => chunk.web && (
                      <a key={i} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[8px] sm:text-[10px] text-cyan-400 hover:bg-white/10 transition-all font-bold whitespace-nowrap">
                        <ExternalLink className="w-3 h-3" /> {chunk.web.title || 'Uplink Node'}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Audio Selection Modal */}
      {showAudioSelector && (
        <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-cyan-600"></div>
              <button onClick={() => setShowAudioSelector(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center mb-8">
                <Headphones className="w-12 h-12 text-cyan-500 mx-auto mb-4" />
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Audio Synthesis</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Select playback stream</p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => handleSpeak('HUMANIZED')}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all group"
                >
                  <User className="w-5 h-5 text-gray-600 group-hover:text-cyan-400" />
                  <div className="text-left">
                    <p className="text-xs font-black text-white uppercase italic">Humanized Briefing</p>
                    <p className="text-[9px] text-gray-500 uppercase">Listen to core resolution</p>
                  </div>
                </button>

                <button 
                  onClick={() => handleSpeak('DEEP_DIVE')}
                  className={`w-full p-4 border rounded-2xl flex items-center gap-4 transition-all group ${result?.deepDive ? 'bg-white/5 border-white/10 hover:bg-purple-500/10 hover:border-purple-500/30' : 'opacity-40 cursor-not-allowed bg-black border-white/5'}`}
                  disabled={!result?.deepDive}
                >
                  <Microscope className="w-5 h-5 text-gray-600 group-hover:text-purple-400" />
                  <div className="text-left">
                    <p className="text-xs font-black text-white uppercase italic">Nexus Deep Dive</p>
                    <p className="text-[9px] text-gray-500 uppercase">{result?.deepDive ? 'Technical expansion stream' : 'Not generated yet'}</p>
                  </div>
                </button>

                <button 
                  onClick={() => handleSpeak('BOTH')}
                  className="w-full p-4 bg-cyan-600/10 border border-cyan-500/30 rounded-2xl flex items-center gap-4 hover:bg-cyan-600/20 transition-all group"
                >
                  <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  <div className="text-left">
                    <p className="text-xs font-black text-white uppercase italic">Full Synthesis</p>
                    <p className="text-[9px] text-gray-500 uppercase">Complete immersive briefing</p>
                  </div>
                </button>
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
                 <div className="flex items-center gap-2 text-[8px] text-gray-600 font-mono uppercase tracking-widest">
                    <Zap className="w-3 h-3 text-cyan-500" /> Optimizing for playback speed: {playbackSpeed}x
                 </div>
              </div>
           </div>
        </div>
      )}

      <style>{`
        @keyframes sound-wave { 0%, 100% { height: 3px; } 50% { height: 100%; } }
      `}</style>
    </section>
  );
};

export default EngineOcean;

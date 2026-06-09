import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Download, Code, Database, Shield, Server, ArrowRight, Play, RefreshCw, Layers } from 'lucide-react';
import { Screen } from '../types';
import projectsData from '../resources/projects.json';
import RockPaperScissorsBoids from './RockPaperScissorsBoids';

// Dynamic projects imported from JSON source of truth
const PROJECTS = projectsData;

export default function PortfolioHome({ onNavigateToBlog, onContactClick }) {
  // Console animation state
  const [bootLines, setBootLines] = useState([]);
  const lineTemplates = [
    "> initializing boot sequence...",
    "> loading kernel modules...",
    "> [OK] user environment established."
  ];

  useEffect(() => {
    let timers = [];
    lineTemplates.forEach((line, index) => {
      const t = setTimeout(() => {
        setBootLines((prev) => [...prev, line]);
      }, (index + 1) * 700);
      timers.push(t);
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  // Decryption terminal emulator for "RESUME.GPG" modal
  const [gpgModalOpen, setGpgModalOpen] = useState(false);
  const [decryptProgress, setDecryptProgress] = useState(0);
  const [decryptedMsg, setDecryptedMsg] = useState('');
  const [decrypting, setDecrypting] = useState(false);

  const startGpgDecrypt = () => {
    setDecrypting(true);
    setDecryptProgress(0);
    setDecryptedMsg('');
    const interval = setInterval(() => {
      setDecryptProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDecrypting(false);
          setDecryptedMsg("-----BEGIN PUBLIC KEY_DATA-----\nID: POMPEIIFRECKLES@DEV_SECURE_VERIFIED\nNAME: Siddharth Bhardwaj\nROLE: Senior Systems Lead\nEMAIL: siddharth.bhardwaj.1337@gmail.com\nSTATUS: Active in Cloud Workspace\n-----END PUBLIC KEY_DATA-----");
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  // Projects Explorer state
  const [activeTab, setActiveTab] = useState('All');
  const filteredProjects = activeTab === 'All' 
    ? PROJECTS 
    : PROJECTS.filter(p => p.lang.includes(activeTab) || (activeTab === 'Security' && p.title.includes("guard")));

  // Lab Terminal Emulator client-side state
  const [terminalHistory, setTerminalHistory] = useState([
    "POMPEIIFRECKLES@DEV:/~ help",
    "Available commands: help, cat bio.txt, kernel, stats, get_rekt, clear"
  ]);
  const [terminalInput, setTerminalInput] = useState('');
  const terminalContainerRef = useRef(null);

  const executeCommand = (e) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim().toLowerCase();
    let response = "";

    switch (cmd) {
      case "help":
        response = "Available commands:\n  help         - Show available terminal routines\n  cat bio.txt  - View developer core information\n  kernel       - Check active kernel configurations\n  stats        - Query real-time programmer vital signs\n  get_rekt     - Run an encrypted sanity handshake\n  clear        - Clear history buffer";
        break;
      case "cat bio.txt":
        response = "SYS_BIO: Highly-adaptive full-stack developer obsessed with low-level speed, memory safety, high-concurrency systems, and robust neobrutalist web widgets.";
        break;
      case "kernel":
        response = "KERNEL: v13.37-RELEASE_x86_64\nSTATUS: STABLE_GREEN\nCOMPILER: rustc 1.80.1-nightly\nCPU: 16x Zen Cores\nUPTIME: 45 Days, 12 Hours, 28 Minutes";
        break;
      case "stats":
        response = "SYS_VITALS:\n  HEART_RATE: 72bpm\n  CAFFEINE: 92% (CRITICAL_LEVEL)\n  SLEEP: DEFICIT\n  LATEST_COMMIT: a1b2c3d";
        break;
      case "get_rekt":
        response = "🚨 ALERT: SYSTEM OVERRUN DETECTED. Just kidding, you are strictly safe on the dev sandbox! Keep on scaling!";
        break;
      case "clear":
        setTerminalHistory([]);
        setTerminalInput('');
        return;
      default:
        response = `bash: command not found: ${terminalInput}. Try typing 'help' to get started.`;
    }

    setTerminalHistory(prev => [...prev, `POMPEIIFRECKLES@DEV:/~ ${terminalInput}`, response]);
    setTerminalInput('');
  };

  useEffect(() => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [terminalHistory]);

  return (
    <div className="flex-grow w-full max-w-[1440px] mx-auto px-6 py-12 md:py-16 md:px-12 flex flex-col gap-16 select-none">
      
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Hero Card */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-8 border-4 border-black bg-white p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          
          {/* Status Badge */}
          <div className="absolute top-0 right-0 bg-[#FFE600] text-black font-heading font-black text-xs px-4 py-2 border-b-4 border-l-4 border-black tracking-widest">
            &gt; STATUS: ONLINE
          </div>

          {/* Sequential bootloader text */}
          <div className="font-mono text-xs md:text-sm text-gray-500 mb-2 h-16 opacity-75 select-none leading-relaxed">
            {bootLines.map((line, idx) => (
              <p key={idx} className="animate-fade-in">{line}</p>
            ))}
            {bootLines.length < lineTemplates.length && (
              <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse" />
            )}
          </div>

          <div className="flex flex-col gap-4">
            <h1 className="font-heading text-6xl md:text-8xl font-black text-black leading-none uppercase tracking-tighter">
              BUILDING<br/>
              <span className="bg-neo-blue text-white px-3 mt-2 inline-block -rotate-1 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">SH*T</span><br/>
              THAT SCALE
            </h1>
            <p className="font-sans text-lg md:text-xl text-neutral-700 max-w-2xl mt-4 leading-relaxed font-normal">
              Full-stack engineer & security researcher. Turning caffeine and chaos into robust, high-performance architecture.
            </p>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-wrap gap-4 mt-8">
            <button 
              id="btn-view-projects"
              onClick={() => {
                const ele = document.getElementById("projects-explorer");
                if (ele) ele.scrollIntoView({ behavior: 'smooth' });
              }}
              className="border-2 border-black bg-[#FFE600] text-black px-6 py-3 font-heading font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
            >
              <Terminal size={16} />
              VIEW REPOS
            </button>
            <button 
              onClick={() => setGpgModalOpen(true)}
              className="border-2 border-black bg-white text-black px-6 py-3 font-heading font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download size={16} />
              RESUME.GPG
            </button>
          </div>
        </div>

        {/* Right Graphic Card */}
        <div className="lg:col-span-5 border-4 border-black bg-[#ffdce1] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] min-h-[400px] overflow-hidden relative group flex flex-col justify-end">
          <RockPaperScissorsBoids />
          <div className="absolute top-4 left-4 bg-black text-[#FFE600] font-mono text-[10px] px-2 py-1 tracking-widest border border-black uppercase z-10 shadow-sm animate-pulse">
            LIVE FEED: KOI_MONITOR
          </div>
          <div className="absolute bottom-4 right-4 bg-white border-2 border-black px-3 py-1 font-mono font-bold text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10 uppercase text-black">
            IMG_01: AQUARIUM
          </div>
        </div>
      </section>

      {/* Projects Grid Section (Scroll target for View Repos) */}
      <section id="projects-explorer" className="pt-8 border-t-4 border-black">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-block bg-neo-blue text-white px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase text-xs font-mono mb-2">
              Source Code
            </div>
            <h2 className="font-heading text-4xl font-extrabold text-black uppercase tracking-tight">
              Active Repositories
            </h2>
          </div>
          
          {/* Tag Filter */}
          <div className="flex flex-wrap gap-2">
            {['All', 'C/C++', 'Python', 'PostgreSQL', 'Security'].map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTab(tag)}
                className={`px-3 py-1 font-heading text-xs uppercase border-2 border-black ${
                  activeTab === tag 
                    ? 'bg-black text-white' 
                    : 'bg-white text-black hover:bg-neutral-100'
                } transition-colors font-bold`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProjects.map((p) => (
              <div 
                key={p.id}
                className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold bg-neutral-200 text-black px-2 py-0.5 border border-black">
                      {p.lang}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-neutral-600 font-mono">
                      <span>★</span>
                      <span>{p.stars}</span>
                    </div>
                  </div>
                  <h3 className="font-heading text-lg font-black text-black uppercase hover:underline cursor-pointer tracking-tight mb-2">
                    {p.title}
                  </h3>
                  <p className="font-sans text-xs text-neutral-600 font-normal leading-relaxed">
                    {p.desc}
                  </p>
                </div>

                <div className="border-t border-black/10 mt-4 pt-3 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-neutral-500 uppercase">
                    {p.commits} Commits
                  </span>
                  {p.id === 'avionics' ? (
                    <button 
                      onClick={() => onNavigateToBlog('avionics-safe-rust')}
                      className="flex items-center gap-1 font-heading text-xs text-secondary font-black hover:underline uppercase"
                    >
                      Read Log
                      <ArrowRight size={12} />
                    </button>
                  ) : p.id === 'vm-sandbox' ? (
                    <button 
                      onClick={() => onNavigateToBlog('art-of-exploitation')}
                      className="flex items-center gap-1 font-heading text-xs text-secondary font-black hover:underline uppercase"
                    >
                      Exploit Log
                      <ArrowRight size={12} />
                    </button>
                  ) : p.id === 'k8s-guard' ? (
                    <button 
                      onClick={() => onNavigateToBlog('chroot-containerization')}
                      className="flex items-center gap-1 font-heading text-xs text-secondary font-black hover:underline uppercase"
                    >
                      Jail Log
                      <ArrowRight size={12} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => console.log(`Opening source dump for ${p.title} in dev sandbox sandbox mode!`)}
                      className="flex items-center gap-1 font-heading text-xs text-black font-black hover:underline uppercase"
                    >
                      Browse
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-4 border-dashed border-neutral-400 p-8 flex flex-col items-center justify-center text-center gap-6 bg-neutral-50">
            <pre className="font-mono text-xs text-neutral-500 leading-none">
              {`
      .---.
     |     |
     | R.I.P |
     | EMPTY |
     |_______|
         |
      ___|___
`}
            </pre>
            <div className="font-heading text-xl font-black uppercase text-neutral-600">
              Welcome to the Project Orphanage
            </div>
            <p className="font-sans text-sm text-neutral-500 max-w-sm">
              I'm embarrassed to show these right now, but I'm furiously coding behind the scenes. 
              New experiments will be dropping into the orphanage soon!
            </p>
          </div>
        )}
      </section>

      {/* About the Kernel Section */}
      <section className="border-t-4 border-black pt-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column Label Block */}
        <div className="md:col-span-4">
          <h2 className="font-heading text-3xl md:text-4xl text-black bg-[#FFE600] inline-block px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-2 font-black uppercase tracking-tight">
            ABOUT THE_KERNEL
          </h2>
        </div>

        {/* Right Column Core Profile + Interactive Tech Stack */}
        <div className="md:col-span-8 flex flex-col gap-6">
          <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-sans text-base md:text-lg leading-relaxed text-black font-normal mb-8">
              I am a systems thinker who thrives in the terminal. My work bridges the gap between low-level performance optimization and high-level architectural design. When I'm not writing JS or Python, I'm probably disassembling malware for fun.
            </p>
            
            <div className="flex flex-wrap gap-2 mt-6">
              <span 
                onClick={() => { setActiveTab('C/C++'); console.log("Filtered repos above to display safe C/C++ builds!"); }}
                className="border-2 border-black bg-[#e3e0ff] text-[#000668] px-3 py-1 font-heading text-xs uppercase tracking-wide cursor-pointer hover:bg-black hover:text-white transition-colors font-extrabold select-none"
              >
                C/C++
              </span>
              <span 
                onClick={() => { setActiveTab('Python'); console.log("Filtered repos above to display Python container validation logic!"); }}
                className="border-2 border-black bg-[#e3e0ff] text-[#000668] px-3 py-1 font-heading text-xs uppercase tracking-wide cursor-pointer hover:bg-black hover:text-white transition-colors font-extrabold select-none"
              >
                Python
              </span>
              <span 
                onClick={() => console.log("Kubernetes ephemeral systems controller container is online and verifying signatures.")}
                className="border-2 border-black bg-[#e3e0ff] text-[#000668] px-3 py-1 font-heading text-xs uppercase tracking-wide cursor-pointer hover:bg-black hover:text-white transition-colors font-extrabold select-none"
              >
                Kubernetes
              </span>
              <span 
                onClick={() => { setActiveTab('PostgreSQL'); console.log("Filtered repos above to display Postgres robust WAL replications!"); }}
                className="border-2 border-black bg-[#e3e0ff] text-[#000668] px-3 py-1 font-heading text-xs uppercase tracking-wide cursor-pointer hover:bg-black hover:text-white transition-colors font-extrabold select-none"
              >
                PostgreSQL
              </span>
              <span 
                onClick={() => { setActiveTab('Security'); console.log("Filtered security frameworks disassembling hardware modules!"); }}
                className="border-2 border-black bg-[#ffdce1] text-[#ca0055] px-3 py-1 font-heading text-xs uppercase tracking-wide cursor-pointer hover:bg-black hover:text-white transition-colors font-extrabold select-none"
              >
                Security
              </span>
            </div>
          </div>

          {/* Interactive Labs Terminal Emulator */}
          <div className="border-4 border-black bg-black text-[#5563f7] p-2 flex flex-col shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex justify-between items-center bg-zinc-900 px-4 py-2 border-b-2 border-black font-mono text-xs text-white">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 block" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 block" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 block" />
                <span className="ml-2">LABS://ROOT_PLAYGROUND</span>
              </div>
              <span className="text-[10px] text-gray-500 uppercase select-none">Node Sandbox</span>
            </div>
            
            <div ref={terminalContainerRef} className="p-4 font-mono text-xs md:text-sm h-64 overflow-y-auto flex flex-col gap-2 select-text bg-zinc-950 text-zinc-100">
              {terminalHistory.map((line, idx) => (
                <div key={idx} className="whitespace-pre-wrap leading-relaxed">
                  {line.startsWith("POMPEIIFRECKLES@DEV") ? (
                    <span className="text-yellow-400 font-bold">{line}</span>
                  ) : (
                    <span className="text-slate-300">{line}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Input form */}
            <form onSubmit={executeCommand} className="flex border-t border-zinc-800 bg-zinc-900">
              <span className="px-3 py-3 font-mono text-xs text-yellow-400 font-black select-none">
                POMPEIIFRECKLES@DEV:/~
              </span>
              <input 
                type="text" 
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                placeholder="Type 'help' and press Enter to query..."
                className="flex-grow bg-transparent text-white font-mono text-xs md:text-sm p-3 focus:outline-none placeholder-gray-600 border-none outline-none"
              />
              <button 
                type="submit" 
                className="bg-black hover:bg-[#FFE600] text-white hover:text-black font-heading font-black text-xs px-6 uppercase border-l-2 border-black transition-colors"
              >
                Run
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Decrypt modal overlay for RESUME.GPG */}
      {gpgModalOpen && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-xs select-none">
          <div className="max-w-xl w-full border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative flex flex-col gap-4 animate-scale-in">
            <button 
              onClick={() => setGpgModalOpen(false)}
              className="absolute top-4 right-4 bg-black text-white hover:bg-neutral-200 hover:text-black font-heading font-black border border-black w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
            
            <div className="flex items-center gap-2 border-b-2 border-black pb-3">
              <Shield className="text-secondary" />
              <h3 className="font-heading text-xl font-black uppercase text-black">
                GPG KEY DECRYPTION UTILITY
              </h3>
            </div>
            
            <p className="font-sans text-xs text-neutral-600">
              Authenticate via the client decrypt pipeline. This will securely assemble the developer's core contact payload using clean crypto blocks.
            </p>

            <div className="bg-neutral-900 border-2 border-black text-lime-400 font-mono text-xs p-4 rounded h-48 overflow-y-auto flex flex-col justify-end gap-2">
              {decryptProgress === 0 && !decrypting && (
                <div className="text-center text-neutral-400 font-sans my-auto flex flex-col items-center gap-3">
                  <p>Ready to decrypt: resume_sid.gpg</p>
                  <button 
                    onClick={startGpgDecrypt}
                    className="border-2 border-black bg-[#FFE600] text-black px-4 py-2 font-heading font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                  >
                    BEGIN SECURE SANITY CHECK
                  </button>
                </div>
              )}

              {decrypting && (
                <div className="my-auto flex flex-col items-center gap-4">
                  <RefreshCw className="animate-spin text-[#FFE600] w-8 h-8" />
                  <p className="text-center text-xs">DECRYPTING SYMMETRIC BUFFER: {decryptProgress}%</p>
                  <div className="w-full bg-zinc-800 h-3 border border-black rounded-sm overflow-hidden">
                    <div className="bg-[#FFE600] h-full transition-all duration-150" style={{ width: `${decryptProgress}%` }} />
                  </div>
                </div>
              )}

              {decryptProgress === 100 && decryptedMsg && (
                <div className="whitespace-pre overflow-x-auto text-slate-300 font-mono select-text font-bold">
                  {decryptedMsg}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-2">
              <button 
                onClick={() => setGpgModalOpen(false)}
                className="border-2 border-black bg-white text-black px-4 py-2 font-heading font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] cursor-pointer"
              >
                CLOSE
              </button>
              {decryptProgress === 100 && (
                  <a 
                    href="https://github.com/samurai-green/Resume/blob/main/Siddharth_Bhardwaj.pdf?raw=true"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-2 border-black bg-[#FFE600] text-black px-4 py-2 font-heading font-black text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-x-[2px] active:translate-y-[2px] cursor-pointer"
                  >
                    DOWNLOAD PDF
                  </a>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

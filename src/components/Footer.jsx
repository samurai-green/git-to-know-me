import React, { useState } from 'react';
import { Github, FileCode, Shield, Terminal } from 'lucide-react';

const TIPS = [
  "Encrypt everything. Trust nobody.",
  "Never push your secrets to GitHub. Keep them in env.",
  "Always check your borrow checker. Memory safety is key.",
  "Stay safe or get rekt.",
  "Dissembling malware is better with coffee.",
  "A SQL query walks into a bar, walks up to two tables and asks: Can I join you?"
];

export default function Footer() {
  const [tipIndex, setTipIndex] = useState(0);

  const rotateTip = () => {
    setTipIndex((prev) => (prev + 1) % TIPS.length);
  };

  return (
    <footer className="bg-black text-white font-mono text-xs tracking-widest w-full border-t-4 border-black flex flex-col p-12 gap-8 mt-auto">
      <div className="max-w-[1440px] w-full mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col gap-2 items-center md:items-start text-center md:text-left">
          <div className="text-white font-bold uppercase text-sm flex items-center gap-2">
            <Terminal size={14} className="text-[#FFE600]" />
            STAY_SAFE_OR_GET_REKT // © {new Date().getFullYear()}
          </div>
          <p className="text-gray-500 font-sans tracking-normal font-normal text-xs mt-1">
            Build robust, scalable & memory-safe architecture.
          </p>
        </div>

        {/* Easter egg tip terminal */}
        <div 
          onClick={rotateTip}
          className="border-2 border-zinc-800 bg-zinc-950 p-3 max-w-[320px] md:max-w-md w-full rounded cursor-pointer hover:border-[#FFE600] transition-all group flex gap-2 items-start"
        >
          <span className="text-[#FFE600] animate-pulse font-black">&gt;</span>
          <div className="flex-grow">
            <span className="text-gray-400 text-[10px] block uppercase font-sans mb-1 group-hover:text-[#FFE600]">Terminal Advice (Click to rotate):</span>
            <p className="text-zinc-300 font-sans tracking-normal font-medium text-xs normal-case italic">
              "{TIPS[tipIndex]}"
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 items-center justify-center">
          <a 
            className="text-white/70 hover:text-[#FFE600] transition-colors flex items-center gap-1 scale-95 hover:scale-100 transition-transform font-bold"
            href="https://github.com/samurai-green/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github size={14} />
            GITHUB
          </a>
          <a 
            className="text-white/70 hover:text-[#FFE600] transition-colors flex items-center gap-1 scale-95 hover:scale-100 transition-transform font-bold"
            href="#"
            onClick={(e) => { e.preventDefault(); alert("Viewing secure source sandbox module! License is MIT."); }}
          >
            <FileCode size={14} />
            SOURCE
          </a>
          <a 
            className="text-white/70 hover:text-[#FFE600] transition-colors flex items-center gap-1 scale-95 hover:scale-100 transition-transform font-bold"
            href="#"
            onClick={(e) => { e.preventDefault(); alert("License is MIT. Feel free to fork or get rekt."); }}
          >
            <Shield size={14} />
            LICENSE
          </a>
        </div>
      </div>
    </footer>
  );
}

import React, { useState } from 'react';
import { Screen } from '../types';
import { Menu, X } from 'lucide-react';

export default function TopAppBar({ currentScreen, onNavigate, onContactClick }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNav = (target) => {
    setMenuOpen(false);
    if (target === currentScreen) {
      if (target === Screen.Home) {
        onNavigate(Screen.Home, 'none');
      }
      return;
    }

    if (target === Screen.Home) {
      // Blog -> Home should be push_back
      onNavigate(Screen.Home, 'push_back');
    } else {
      // Home -> Blog should be push
      onNavigate(Screen.Blog, 'push');
    }
  };

  const handleLogoClick = () => {
    if (currentScreen !== Screen.Home) {
      onNavigate(Screen.Home, 'push_back');
    }
  };

  return (
    <header className="bg-[#FFE600] dark:bg-yellow-400 font-heading font-bold uppercase tracking-tighter sticky top-0 w-full border-b-4 border-black z-50 flex justify-between items-center px-6 py-4">
      {/* Logo */}
      <div 
        onClick={handleLogoClick}
        className={`text-lg sm:text-lg md:text-2xl font-black text-black tracking-tight sm:tracking-widest cursor-pointer select-none active:scale-95 transition-all flex items-center gap-2 break-all`}
      >
        POMPEIIFRECKLES@DEV:/~
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex gap-8 items-center font-heading text-lg font-bold">
        <a 
          id="nav-home"
          href="#" 
          onClick={(e) => { e.preventDefault(); handleNav(Screen.Home); }}
          className={`relative px-1 py-1 text-black transition-all ${
            currentScreen === Screen.Home 
              ? "after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-1 after:bg-black font-extrabold" 
              : "hover:bg-white/30"
          }`}
        >
          HOME
        </a>
        <a 
          id="nav-blog"
          href="#" 
          onClick={(e) => { e.preventDefault(); handleNav(Screen.Blog); }}
          className={`relative px-1 py-1 text-black transition-all ${
            currentScreen === Screen.Blog 
              ? "after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-1 after:bg-black font-extrabold" 
              : "hover:bg-white/30"
          }`}
        >
          BLOG
        </a>
      </nav>

      {/* Desktop Call to Action */}
      <button 
        onClick={onContactClick}
        className="hidden md:flex border-2 border-black bg-white text-black px-4 py-2 font-heading font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all cursor-pointer"
      >
        CONTACT_ME
      </button>

      {/* Mobile Menu Button */}
      <button 
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden flex items-center justify-center p-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
      >
        {menuOpen ? <X size={24} className="text-black" /> : <Menu size={24} className="text-black" />}
      </button>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="absolute top-[71px] left-0 w-full bg-[#FFE600] border-b-4 border-black border-t-2 z-40 flex flex-col p-6 gap-6 md:hidden text-black shadow-lg">
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); handleNav(Screen.Home); }}
            className={`font-heading font-extrabold text-xl ${currentScreen === Screen.Home ? "underline decoration-4" : ""}`}
          >
            HOME
          </a>
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); handleNav(Screen.Blog); }}
            className={`font-heading font-extrabold text-xl ${currentScreen === Screen.Blog ? "underline decoration-4" : ""}`}
          >
            BLOG
          </a>
          <button 
            onClick={() => { setMenuOpen(false); onContactClick(); }}
            className="w-full text-center border-2 border-black bg-white text-black py-3 font-heading font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            CONTACT_ME
          </button>
        </div>
      )}
    </header>
  );
}

import React, { useState, useEffect } from 'react';
import { Screen } from './types';
import TopAppBar from './components/TopAppBar';
import Footer from './components/Footer';
import PortfolioHome from './components/PortfolioHome';
import BlogPost from './components/BlogPost';
import { MessageSquare, CheckCircle2 } from 'lucide-react';
import { useForm, ValidationError } from '@formspree/react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState(Screen.Home);
  const [transitionType, setTransitionType] = useState('none');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [state, handleSubmit] = useForm("xdavzlzn");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigate = (target, transition) => {
    setTransitionType(transition);
    setCurrentScreen(target);
  };


  // Motion animation parameters corresponding to spec transitions
  const animationVariants = {
    initial: (type) => {
      if (type === 'push') return { x: '100vw', opacity: 0 };
      if (type === 'push_back') return { x: '-100vw', opacity: 0 };
      return { x: 0, opacity: 1 };
    },
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 110,
        damping: 18,
        mass: 0.8
      }
    },
    exit: (type) => {
      if (type === 'push') return { x: '-100vw', opacity: 0 };
      if (type === 'push_back') return { x: '100vw', opacity: 0 };
      return { x: 0, opacity: 1 };
    }
  };

  return (
    <div className="bg-[#f9f9f9] text-black min-h-screen flex flex-col font-sans overflow-x-hidden relative">
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            className="fixed inset-0 z-[100] bg-[#f9f9f9] flex items-center justify-center p-6"
          >
            <div className="text-center space-y-4">
              <div className="font-heading font-black text-4xl sm:text-6xl animate-pulse uppercase tracking-tighter text-black">
                INITIALIZING<br/>SYSTEM
              </div>
              <div className="w-48 h-1 bg-black animate-pulse mx-auto" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Shared Neobrutalist Header bar */}
      <TopAppBar 
        currentScreen={currentScreen} 
        onNavigate={handleNavigate}
        onContactClick={() => { setContactOpen(true); }}
      />
      
      {/* Route Switcher Screen Transition Wrappers */}
      <div className="flex-grow z-10 w-full relative">
        <AnimatePresence mode="wait" initial={false} custom={transitionType}>
          {currentScreen === Screen.Home ? (
            <motion.div
              key="home-key"
              custom={transitionType}
              variants={animationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex"
            >
              <PortfolioHome 
                onNavigateToBlog={(postId) => {
                  if (postId) {
                    setSelectedPostId(postId);
                  } else {
                    setSelectedPostId(null);
                  }
                  handleNavigate(Screen.Blog, 'push');
                }}
                onContactClick={() => { setContactOpen(true); }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="blog-key"
              custom={transitionType}
              variants={animationVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full flex"
            >
              <BlogPost 
                initialPostId={selectedPostId}
                onNavigateToHome={() => handleNavigate(Screen.Home, 'push_back')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Shared Neobrutalist Footer bar */}
      <Footer />

      {/* Contact me secure dialog */}
      {contactOpen && (
        <div className="fixed inset-0 bg-black/75 z-[55] flex items-center justify-center p-4 backdrop-blur-xs select-none">
          <div className="max-w-xl w-full border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative flex flex-col gap-4 animate-scale-in">
            <button 
              onClick={() => setContactOpen(false)}
              className="absolute top-4 right-4 bg-black text-white hover:bg-neutral-200 hover:text-black font-heading font-black border border-black w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
            
            <div className="flex items-center gap-2 border-b-2 border-black pb-3">
              <MessageSquare className="text-secondary" />
              <h3 className="font-heading text-xl font-black uppercase text-black">
                TRANSMIT MESSAGE PACKET
              </h3>
            </div>
            
            <p className="font-sans text-xs text-neutral-600">
              Establish a direct telemetry bridge. Your message packet is assembled instantly into a secure stream.
            </p>

            {state.succeeded ? (
               <div className="border-4 border-black bg-emerald-100 p-6 flex flex-col items-center gap-4 text-center my-6">
                <CheckCircle2 className="text-emerald-700 w-12 h-12" />
                <div>
                  <h4 className="font-heading text-lg font-black uppercase text-emerald-900">TRANSMISSION OK</h4>
                  <p className="font-sans text-xs text-emerald-800 mt-1 max-w-sm">
                    Carrier wave connection established. Your packet was securely validated.
                  </p>
                </div>
                <button 
                  onClick={() => setContactOpen(false)}
                  className="border-2 border-black bg-black text-white px-5 py-2 font-heading font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-800 cursor-pointer mt-2"
                >
                  OK
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="font-heading font-black text-xs uppercase text-zinc-700">USERNAME_ALIAS</label>
                  <input 
                    name="username"
                    type="text" 
                    placeholder="E.g., SECURE_SYSADMIN_99" 
                    className="border-2 border-black p-3 font-heading font-black text-xs uppercase bg-white focus:outline-none focus:border-4 focus:-m-[2px] transition-all text-black"
                    required
                  />
                  <ValidationError 
                    prefix="Username" 
                    field="username"
                    errors={state.errors}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-heading font-black text-xs uppercase text-zinc-700">EMAIL_ADDRESS</label>
                  <input 
                    name="email"
                    type="email" 
                    placeholder="USER@DOMAIN.COM" 
                    className="border-2 border-black p-3 font-heading font-black text-xs uppercase bg-white focus:outline-none focus:border-4 focus:-m-[2px] transition-all text-black"
                    required
                  />
                  <ValidationError 
                    prefix="Email" 
                    field="email"
                    errors={state.errors}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-heading font-black text-xs uppercase text-zinc-700">MESSAGE_PACKET</label>
                  <textarea 
                    name="message"
                    placeholder="Enter packet context payload here..." 
                    rows={4}
                    className="border-2 border-black p-3 font-sans text-sm bg-white focus:outline-none focus:border-4 focus:-m-[2px] transition-all text-black resize-none"
                    required
                  />
                  <ValidationError 
                    prefix="Message" 
                    field="message"
                    errors={state.errors}
                  />
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button 
                    type="button"
                    onClick={() => setContactOpen(false)}
                    className="border-2 border-black bg-white text-black px-5 py-3 font-heading font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer"
                  >
                    ABORT
                  </button>
                  <button 
                    type="submit"
                    disabled={state.submitting}
                    className="border-2 border-black bg-black text-white px-5 py-3 font-heading font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFE600] hover:text-black transition-colors cursor-pointer"
                  >
                    {state.submitting ? 'TRANSMITTING...' : 'SHIP_PACKET'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

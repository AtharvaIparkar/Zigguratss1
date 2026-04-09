import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Check, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence, useSpring, useMotionValue, useVelocity } from 'framer-motion';
import Lenis from 'lenis';

/* -------------------------------------------------------------------------- */
/*                                CUSTOM STYLES                               */
/* -------------------------------------------------------------------------- */

const ZigguratssStyles = () => (
  <style dangerouslySetInnerHTML={{
    __html: `
    @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Playfair+Display:ital,wght@0,900;1,900&family=Space+Mono&display=swap');

    :root {
      --amber-gold: #f5c842;
      --amber-gold-8: rgba(245, 200, 66, 0.08);
      --deep-black: #0a0a0a;
    }

    .font-lato { font-family: 'Lato', sans-serif; }
    .font-serif { font-family: 'Playfair Display', serif; }
    .font-mono { font-family: 'Space Mono', monospace; }

    .velvet-texture::before {
      content: "";
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url("https://grainy-gradients.vercel.app/noise.svg");
      opacity: 0.05;
      pointer-events: none;
      z-index: 100;
    }

    .glass-card {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%);
      backdrop-filter: blur(28px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 0 60px rgba(0,0,0,0.6);
    }

    .glass-card::after {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      border: 1px solid rgba(255, 255, 255, 0.05);
      pointer-events: none;
      mask-image: linear-gradient(to bottom right, black, transparent);
    }

    .holographic-text {
      background: linear-gradient(
        90deg, 
        #f5c842 0%, 
        #fff 20%, 
        #f5c842 40%, 
        #dfa32d 60%, 
        #fff 80%, 
        #f5c842 100%
      );
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: holographic-shimmer 10s linear infinite;
    }

    @keyframes holographic-shimmer {
      0% { background-position: 0% 50%; }
      100% { background-position: 200% 50%; }
    }

    .ambient-glow {
      position: fixed;
      top: var(--y, 0px);
      left: var(--x, 0px);
      width: 65vw;
      height: 65vh;
      background: radial-gradient(circle, rgba(245, 200, 66, 0.1) 0%, transparent 70%);
      pointer-events: none;
      z-index: 1;
      transform: translate(-50%, -50%);
      transition: transform 0.6s cubic-bezier(0.1, 0.4, 0.1, 1);
    }

    .metadata-gutter {
      position: absolute;
      left: 2.5rem;
      top: 0;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      padding-top: 6rem;
      pointer-events: none;
      opacity: 0.3;
      border-left: 1px solid rgba(245, 200, 66, 0.2);
      padding-left: 1.5rem;
    }

    .art-frame-outline {
      position: absolute;
      border: 1px solid rgba(245, 200, 66, 0.08);
      pointer-events: none;
      z-index: 0;
    }

    .tracking-extreme { letter-spacing: 0.5em; }

    @keyframes scan {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100vh); }
    }
    .animate-scan { animation: scan 20s linear infinite; }

    @keyframes float-up {
      0% { transform: translateY(115vh) translateX(0); opacity: 0; }
      20% { opacity: 0.2; }
      80% { opacity: 0.2; }
      100% { transform: translateY(-15vh) translateX(40px); opacity: 0; }
    }
    .animate-float-up { animation: float-up var(--duration) linear infinite; }

    ::selection {
      background: var(--amber-gold);
      color: black;
    }

    html.lenis { height: auto; }
    .lenis.lenis-smooth { scroll-behavior: auto !important; }
    .lenis.lenis-stopped { overflow: hidden; }

    .liquid-reveal {
      mask-image: linear-gradient(to top, black 0%, black 100%);
      mask-size: 100% 200%;
      mask-position: 0 100%;
      transition: mask-position 1.5s cubic-bezier(0.23, 1, 0.32, 1);
    }
    .liquid-reveal.revealed { mask-position: 0 0; }
  ` }} />
);

/* -------------------------------------------------------------------------- */
/*                               SUB-COMPONENTS                               */
/* -------------------------------------------------------------------------- */

const Magnetic = ({ children }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 120, damping: 12, mass: 0.05 });
  const springY = useSpring(y, { stiffness: 120, damping: 12, mass: 0.05 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    if (!ref.current) return;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const midX = clientX - (left + width / 2);
    const midY = clientY - (top + height / 2);
    x.set(midX * 0.4);
    y.set(midY * 0.4);
  };

  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div ref={ref} style={{ x: springX, y: springY }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {children}
    </motion.div>
  );
};

const CharacterReveal = ({ text, className, delay = 0, trigger = true }) => {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.35em] py-[0.1em]">
          <motion.span
            initial={{ y: "115%", rotate: 8, opacity: 0 }}
            animate={trigger ? { y: 0, rotate: 0, opacity: 1 } : {}}
            transition={{ duration: 1.2, delay: delay + i * 0.1, ease: [0.19, 1, 0.22, 1] }}
            className="inline-block origin-bottom-left holographic-text"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

const BackgroundEffects = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const scrollVelocity = useVelocity(scrollYProgress);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });

  const yShift1 = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const yShift2 = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const rotateS = useTransform(scrollYProgress, [0, 1], [0, 75]);
  const skewS = useTransform(smoothVelocity, [-1, 1], [-2, 2]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      document.documentElement.style.setProperty('--x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#030303]">
        <div className="velvet-texture fixed inset-0 opacity-15" />

      {/* ATMOSPHERIC MASTER BLOOMS */}
      <motion.div style={{ y: yShift1, skewX: skewS }} className="absolute top-[-20%] left-[-15%] w-[80vw] h-[80vw] bg-amber-gold/5 blur-[200px] rounded-full opacity-50 mix-blend-screen" />
      <motion.div style={{ y: yShift2, skewY: skewS }} className="absolute bottom-[-20%] right-[-15%] w-[90vw] h-[90vw] bg-amber-gold/4 blur-[250px] rounded-full opacity-40 mix-blend-screen" />

      {/* FLOATING ART GLASS SHARDS */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ x: mousePos.x * 0.03 * (i + 1), y: mousePos.y * 0.03 * (i + 1), rotate: [0, 360] }}
          transition={{ rotate: { duration: 60 + i * 10, repeat: Infinity, ease: 'linear' } }}
          style={{
            y: i % 2 === 0 ? yShift1 : yShift2,
            width: `${150 + i * 80}px`,
            height: `${150 + i * 80}px`,
            left: `${10 + i * 25}%`,
            top: `${15 + i * 20}%`,
            opacity: 0.06 - i * 0.01,
          }}
        />
      ))}

      {/* STUDIO LIGHT BEAMS */}
      <motion.div
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-gold/5 to-transparent skew-y-12"
      />

      <div className="fixed top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-gold/20 to-transparent animate-scan z-50 pointer-events-none" />
      <div className="ambient-glow" style={{ left: `${mousePos.x}px`, top: `${mousePos.y}px` }} />

      <motion.div style={{ y: yShift1, rotate: rotateS }} className="art-frame-outline w-[45vw] h-[65vh] top-[10%] left-[5%] opacity-10" />
      <motion.div style={{ y: yShift2, rotate: -rotateS }} className="art-frame-outline w-[35vw] h-[45vh] top-[55%] left-[75%] opacity-8" />

      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full bg-amber-gold/25 animate-float-up ${i % 2 === 0 ? 'w-1.5 h-1.5' : 'w-0.5 h-0.5'}`}
            style={{
              left: `${Math.random() * 100}%`,
              '--duration': `${12 + Math.random() * 18}s`,
              animationDelay: `${Math.random() * 25}s`,
              opacity: Math.random() * 0.4,
            }}
          />
        ))}
      </div>

      </div>

      <motion.div
        className="fixed top-0 left-0 w-3 h-3 bg-amber-gold rounded-full pointer-events-none z-[10000] -translate-x-1/2 -translate-y-1/2 shadow-[0_0_20px_var(--amber-gold)]"
        animate={{ x: mousePos.x, y: mousePos.y }}
        transition={{ type: "spring", damping: 35, stiffness: 600, mass: 0.1 }}
      />
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 border border-amber-gold/40 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
        animate={{ x: mousePos.x, y: mousePos.y }}
        transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.4 }}
      />
    </>
  );
};

const Ticker = () => {
  const { scrollYProgress } = useScroll();
  const scrollVelocity = useVelocity(scrollYProgress);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const skewX = useTransform(smoothVelocity, [-1, 1], [-10, 10]);
  const extraX = useTransform(smoothVelocity, [-1, 1], [-200, 200]);

  const curs = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'];
  return (
    <div className="w-full overflow-hidden py-4 border-y border-amber-gold/15 mt-10 relative bg-white/[0.02]">
      <motion.div style={{ skewX, x: extraX }}>
        <motion.div animate={{ x: [0, -1000] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="inline-block whitespace-nowrap">
          {Array(8).fill(curs).flat().map((c, i) => (
            <span key={i} className="font-mono text-[12px] tracking-extreme mx-12 text-amber-gold/50 hover:text-amber-gold transition-all cursor-default uppercase">
              {c} · {c === 'INR' ? '₹' : c === 'USD' ? '$' : '🏷️'}
            </span>
          ))}
        </motion.div>
      </motion.div>
      <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-black to-transparent pointer-events-none z-10" />
      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-black to-transparent pointer-events-none z-10" />
    </div>
  );
};

const Header = () => {
  const [init, setInit] = useState(false);
  useEffect(() => { const t = setTimeout(() => setInit(true), 150); return () => clearTimeout(t); }, []);

  return (
    <header className="pt-56 pb-40 max-w-7xl mx-auto px-10 xl:px-48 relative overflow-hidden flex flex-col items-start translate-z-0">
      <div className="absolute top-0 left-0 w-full h-[70vh] bg-gradient-to-b from-amber-gold/15 to-transparent pointer-events-none z-0" />

      <motion.div initial={{ opacity: 0, x: -50 }} animate={init ? { opacity: 0.4, x: 0 } : {}} transition={{ duration: 1.5 }}>
        <div className="label text-amber-gold mb-10 tracking-[0.6em] flex items-center gap-6">
          <div className="w-16 h-[1px] bg-amber-gold shadow-[0_0_10px_var(--amber-gold)]" />MUSEUM SEQUENCE 01
        </div>
      </motion.div>

      <div className="relative z-10 w-full mb-20">
        <h1 className="text-[6.2vw] leading-[1] font-serif font-black uppercase tracking-tight mb-4 drop-shadow-2xl">
          <CharacterReveal text="GENERAL TERMS" className="block" trigger={init} />
          <CharacterReveal text="AND CONDITIONS" className="block" delay={0.4} trigger={init} />
        </h1>
        <h2 className="text-[4.8vw] leading-[1] font-serif font-black uppercase opacity-60 tracking-widest italic">
          <CharacterReveal text="FOR ARTIST'S & BUYER'S" className="block" delay={0.9} trigger={init} />
        </h2>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={init ? { opacity: 0.6 } : {}} transition={{ duration: 2, delay: 2.2 }} className="mt-10 flex items-center gap-10">
        <motion.div animate={{ width: [150, 250, 150], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 5, repeat: Infinity }} className="h-[2px] bg-amber-gold shadow-[0_0_20px_var(--amber-gold)]" />
        <span className="label lowercase italic tracking-widest text-lg opacity-50">Initiating Gallery Protocol</span>
      </motion.div>
    </header>
  );
};

const TiltCard = ({ children, className }) => {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rotateX = useTransform(y, [0, 1], [8, -8]);
  const rotateY = useTransform(x, [0, 1], [-8, 8]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPos = e.clientX - rect.left;
    const yPos = e.clientY - rect.top;
    x.set(xPos / rect.width);
    y.set(yPos / rect.height);
  };
  const handleMouseLeave = () => { x.set(0.5); y.set(0.5); };

  return (
    <motion.div
      style={{ rotateX, rotateY, perspective: 1200, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <motion.div style={{ transform: "translateZ(20px)" }} className="h-full w-full">
        {children}
      </motion.div>
    </motion.div>
  );
};

const Section = ({ title, children, layout = "default", metadata = {} }) => {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.95, 1, 1, 0.95]);
  const scrollParallaxY = useTransform(scrollYProgress, [0, 1], [30, -30]);

  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.1 });
    if (ref.current) ob.observe(ref.current); return () => ob.disconnect();
  }, []);

  return (
    <motion.div ref={ref} style={{ scale }} className="relative w-full max-w-7xl mx-auto py-32 px-10 xl:px-48 border-b border-white/10 transition-all duration-1000">
      <div className="metadata-gutter hidden xl:flex">
        <Magnetic><span className="label text-amber-gold mb-4 cursor-pointer">{metadata.chapter || 'CH --'}</span></Magnetic>
        <span className="label text-white/40 mb-4">{metadata.year || '24'}</span>
        <div className="w-[1px] bg-amber-gold/30 flex-1 shadow-[0_0_10px_var(--amber-gold)]" />
      </div>

      <div className={`transition-all duration-1000 ${vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}>
        {layout === "split" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start relative z-10 w-full">
            <h2 className="text-[4.2rem] leading-[0.9] mb-12 tracking-tighter uppercase relative">
              <CharacterReveal text={title} trigger={vis} />
              <motion.div initial={{ width: 0 }} animate={vis ? { width: "100%" } : {}} transition={{ delay: 0.6, duration: 1.2 }} className="h-[3px] bg-amber-gold mt-6 shadow-[0_0_20px_var(--amber-gold)]" />
            </h2>
            <motion.div style={{ y: scrollParallaxY }} className={`text-white/50 text-xl font-light leading-relaxed space-y-10 liquid-reveal ${vis ? 'revealed' : ''}`}>{children}</motion.div>
          </div>
        ) : layout === "card" ? (
          <TiltCard className="glass-card p-16 md:p-28 relative z-10 group rounded-lg transition-colors duration-700 hover:border-amber-gold/30">
            <div className="label text-amber-gold/60 mb-10 flex items-center gap-8"><div className="w-12 h-[1px] bg-amber-gold/60 shadow-[0_0_10px_var(--amber-gold)]" />ARTISTIC DECREE</div>
            <h2 className="text-[3.6rem] leading-[1] mb-12 tracking-tight uppercase group-hover:text-amber-gold transition-all duration-700">
              <CharacterReveal text={title} trigger={vis} />
            </h2>
            <div className={`text-white/45 text-xl font-light leading-relaxed space-y-10 liquid-reveal ${vis ? 'revealed' : ''}`}>{children}</div>
          </TiltCard>
        ) : (
          <div className="relative z-10 w-full">
            <h2 className="text-[4.2rem] leading-[0.9] mb-12 tracking-tighter uppercase relative inline-block">
              <CharacterReveal text={title} trigger={vis} />
              <motion.div initial={{ width: 0 }} animate={vis ? { width: "100%" } : {}} transition={{ delay: 0.6, duration: 1.2 }} className="h-[3px] bg-amber-gold mt-6 shadow-[0_0_20px_var(--amber-gold)]" />
            </h2>
            <div className={`text-white/50 text-xl font-light leading-relaxed space-y-10 max-w-5xl mt-6 liquid-reveal ${vis ? 'revealed' : ''}`}>{children}</div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const TermsAndConditions = () => {
  const [acc, setAcc] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const lenis = new Lenis({ duration: 1.6, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, lerp: 0.05 });
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf); return () => lenis.destroy();
  }, []);

  return (
    <div className="font-lato relative z-10 w-full overflow-hidden bg-[#020202] text-white selection:bg-amber-gold selection:text-black">
      <ZigguratssStyles />
      <BackgroundEffects />
      <Header />

      <Section title="Terms of Use" layout="default" metadata={{ chapter: 'CH 01' }}>
        <div className="flex gap-16 items-start group">
          <div className="w-[2px] bg-amber-gold/30 h-56 self-stretch relative">
            <motion.div animate={{ height: ["10%", "80%", "10%"] }} transition={{ duration: 7, repeat: Infinity }} className="absolute top-0 left-[-1.5px] w-[5px] bg-amber-gold shadow-[0_0_30px_rgba(245,200,66,0.8)]" />
          </div>
          <p className="max-w-4xl leading-[2.2] text-xl font-light text-white/60">
            <span className="text-8xl font-serif text-amber-gold float-left mr-8 mt-4 h-20 flex items-center leading-none drop-shadow-xl">T</span>he sale made through Zigguratss are contracted directly between the buyer and the Seller/Artist. Zigguratss is not, in any respect, a reseller of the artworks proposed by the seller through Zigguratss. Zigguratss acts simply as a middleman, in the context of the provision of the site that allows Seller/Artist and buyers to connect and do business. The artworks offered for sale on Zigguratss by the Seller/Artist are subject to their availability. The artworks made available for sale on the website may not always be in the physical possession of Zigguratss and may be physically located anywhere in the world.
          </p>
        </div>
      </Section>

      <Section title="Orders" layout="card" metadata={{ chapter: 'CH 02' }}>
        <p>Each of the artwork comes with a short explanation sheet containing information about its dimension, weight, type etc. To order an artwork, the buyer must select the artwork of choice and add it in the cart and provide the necessary personal information to place the order. Before finalising the order, the buyer must check the information on the order summary, if found any mistakes, the buyer can correct them before finalising the order. The buyer payment will be returned in full if the artwork's availability from the artists is not possible due to any unforeseen reasons. The same shall be intimated to the buyer within 24 hours of his purchase of artwork from online portal of Zigguratss. If the artwork is no longer available, an email regarding the same will be sent to buyer within 48 hours, cancelling the order.</p>
      </Section>

      <Section title="Sales & Payment" layout="default" metadata={{ chapter: 'CH 03' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-20">
          <div className="space-y-10"><p>All artworks made available for sale on the website will be sold at the listed price and no discounts will be granted to the buyer. The information provided during registration or amended at the time of finalising a purchase shall be the final billing address and shipping address for delivery of the object. Shipping cost is included in the cost of artwork.</p></div>
          <div className="space-y-10"><p>The artist must add the cost of shipping in his/her artist price depending upon the type of artwork, its dimension, its weight, as well as the place of delivery. Transfer of ownership happens as soon as the full price has been paid by the buyer. Failure to do so, will automatically cancels the order.</p></div>
        </div>
        <Ticker />
        <div className="mt-20 glass-card p-12 border-l-4 border-amber-gold max-w-5xl">
          <p className="text-white/40 text-lg italic leading-relaxed">The contract of sale is between Zigguratss (acting as the agent of the Seller/Artist) and the buyer. Zigguratss shall assume no responsibility for any errors or omissions that may occur in the description, pricing or other content related to the artwork. In the event of such error, Zigguratss reserves the right to cancel the order placed by the buyer by informing the buyer in writing. You agree to abide by all provisions prescribed in these terms and conditions.</p>
        </div>
      </Section>

      <Section title="Refund Policy" layout="card" metadata={{ chapter: 'CH 04' }}>
        <div className="border-l-[2px] border-amber-gold/30 pl-16 space-y-12">
          <p>Art is precious and valuable, it takes time to complete a single work of art. Due to its fragile and singular nature we are unable to allow returns. Hence, we urge you to be certain of your decision before purchasing it. We are always available to ensure that the art you see is the art you get. If you're in doubt, you can always ask for additional images of the artworks. However, there may be times when you receive an item in damaged condition, in which case we will ensure a timely resolution keeping in mind your interest. This may be through repair, exchange or return of the product. Refund request must be raised immediately i.e, within 24 hours of receipt of artwork, through Customer dashboard alongwith photographs of the damaged Artwork.</p>
        </div>
      </Section>

      <Section title="Cancel & Return" layout="default" metadata={{ chapter: 'CH 05' }}>
        <div className="space-y-24">
          <p>No cancellation policy - Should a Seller/Artist become aware of any reason which may cause a delay in delivery of and artwork, Seller/Artist will immediately notified of such reasons and expected delay time.</p>
          <div className="flex items-center justify-center gap-20 py-16 opacity-80">
            <div className="h-[2px] bg-gradient-to-r from-transparent via-amber-gold to-transparent w-full" />
            <span className="serif text-7xl uppercase tracking-[0.5em] holographic-text font-black select-none">OR</span>
            <div className="h-[2px] bg-gradient-to-l from-transparent via-amber-gold to-transparent w-full" />
          </div>
          <p>If a buyer elects a return of art (only if met by Zigguratss refund policy), the buyer must raise a request immediately through Customer dashboard after receipt of Artwork alongwith photographs of the damaged Artwork.</p>
          <motion.div animate={{ boxShadow: ["0 0 0px var(--amber-gold)", "0 0 50px rgba(245,200,66,0.2)", "0 0 0px var(--amber-gold)"] }} transition={{ duration: 5, repeat: Infinity }} className="glass-card p-16 md:p-24 border-amber-gold/20">
            <p className="text-amber-gold font-bold italic text-3xl leading-snug drop-shadow-lg">Insurance, packing and shipping fees associated with the return of the returned item shall be the sole responsibility of the Seller.</p>
          </motion.div>
        </div>
      </Section>

      <Section title="Regulatory Compliance" layout="default" metadata={{ chapter: 'CH 06' }}>
        <div className="border-t border-amber-gold/20 pt-20 flex flex-col lg:flex-row gap-20 items-center">
          <p className="text-4xl flex-1 leading-[1.4] font-serif font-black text-white/70 italic holographic-text">Buyer's is responsible for paying all fees/costs/charges associated with the use of the website to purchase Artwork and you agree to bear any and all applicable taxes/GST, Cess, Custom Duties, Octoroi, etc. levied thereon.</p>
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        <Section title="Fees" metadata={{ chapter: 'CH 07' }}><p>The profit ratio will be shared with you on individual basis via email or any other mode of contact. For commission work percentage will be negotiated over the call.</p></Section>
        <Section title="Remittance" metadata={{ chapter: 'CH 08' }}><p>Zigguratss shall remit the purchase fees to seller, after deducting the Zigguratss commissions, within 21 days after the full confirmation.</p></Section>
        <Section title="Purchasing" metadata={{ chapter: 'CH 09' }}><p>All artwork posted for sale by Artist on the Zigguratss website is supported by an authenticity certificate from the Artist themselves.</p></Section>
        <Section title="Transfer" metadata={{ chapter: 'CH 10' }}><p>The Artwork shall be and remain at the risk of the Seller/Artist until it is shipped and reach to the Buyer.</p></Section>
      </div>

      <section className="py-80 text-center relative z-10 px-10 bg-white/[0.01]">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="label mb-20 text-amber-gold flex items-center justify-center gap-10 tracking-[1em] font-black italic text-2xl uppercase shadow-amber-gold/20 text-shadow-xl">
          <div className="w-24 h-[2px] bg-amber-gold shadow-[0_0_20px_var(--amber-gold)]" />FINAL AUTHENTICATION<div className="w-24 h-[2px] bg-amber-gold shadow-[0_0_20px_var(--amber-gold)]" />
        </motion.div>

        {!acc ? (
          <div className="flex justify-center flex-col items-center">
            <Magnetic>
              <button onClick={() => setAcc(true)} className="group relative bg-amber-gold text-black font-serif font-black px-40 py-12 text-4xl uppercase tracking-[0.3em] transition-all duration-1000 shadow-[0_60px_100px_rgba(245,200,66,0.25)] border-4 border-black/10 overflow-hidden">
                <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-white/20" />
                <span className="relative z-10">Sign Protocol</span>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-all duration-700 z-0 opacity-25" />
                <div className="absolute -inset-2 border-2 border-amber-gold/50 group-hover:-inset-4 transition-all duration-700 opacity-0 group-hover:opacity-100 rounded-lg animate-pulse" />
              </button>
            </Magnetic>
            <p className="mt-16 label text-white/40 italic text-xl tracking-widest uppercase">Encryption active — Selection is permanent</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <motion.div initial={{ scale: 0, rotate: 360 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", damping: 12, stiffness: 100 }} className="w-48 h-48 rounded-full border-4 border-amber-gold flex items-center justify-center mb-16 bg-amber-gold/10 relative shadow-[0_0_50px_var(--amber-gold)] shadow-opacity-30">
              <div className="absolute inset-0 rounded-full border-4 border-amber-gold animate-ping opacity-30" style={{ animationDuration: '4s' }} />
              <Check className="text-amber-gold" size={100} strokeWidth={1} />
            </motion.div>
            <CharacterReveal text="Protocol Finalized — Welcome to Zigguratss" className="serif text-[4.2rem] text-amber-gold italic holographic-text font-black drop-shadow-2xl" />
          </div>
        )}
      </section>

      <footer className="py-40 border-t-2 border-white/10 text-center px-12 relative overflow-hidden bg-black">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
          <span className="serif text-[50vw] font-black uppercase tracking-tighter select-none blur-sm">ZIGG</span>
        </div>
        <div className="label text-amber-gold mb-20 tracking-[1em] text-4xl font-black relative z-10 holographic-text italic drop-shadow-2xl whitespace-nowrap">ZIGGURATSS ARTWORK LLP</div>
        <div className="flex flex-wrap gap-20 justify-center mb-20 relative z-10">
          {['LEGACY', 'POLICY', 'RESOURCES'].map(l => (
            <Magnetic key={l}>
              {l === 'POLICY' ? (
                <Link to="/privacy-policy" onClick={() => window.scrollTo(0, 0)} className="label hover:text-amber-gold transition-all duration-700 hover:tracking-[0.8em] text-white/60 text-2xl font-bold uppercase">{l}</Link>
              ) : (
                <a href="#" className="label hover:text-amber-gold transition-all duration-700 hover:tracking-[0.8em] text-white/60 text-2xl font-bold uppercase">{l}</a>
              )}
            </Magnetic>
          ))}
        </div>
        <div className="label text-white/15 text-[12px] relative z-10 tracking-[0.5em] font-mono">Copyright © 2026 Zigguratss Artwork LLP. All Rights Reserved.</div>
      </footer>
    </div>
  );
};

export default TermsAndConditions;

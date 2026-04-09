import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useVelocity, useInView, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Lenis from 'lenis';

/* -------------------------------------------------------------------------- */
/*                                CUSTOM STYLES                               */
/* -------------------------------------------------------------------------- */

const PrivacyStyles = () => (
  <style dangerouslySetInnerHTML={{
    __html: `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap');

    :root {
      --amber-gold: #f5c842;
      --amber-gold-8: rgba(245, 200, 66, 0.08);
      --deep-black: #0a0a0a;
      --body-text: rgba(255,255,255,0.6);
      --card-bg: rgba(255,255,255,0.06);
    }

    /* FONT CLASSES */
    .pp-serif { font-family: 'Playfair Display', serif; }
    .pp-mono { font-family: 'Space Mono', 'Courier New', monospace; }

    /* BODY TEXT STYLE */
    .pp-body {
      font-family: 'Space Mono', 'Courier New', monospace;
      font-style: italic;
      color: rgba(255,255,255,0.6);
      line-height: 2.0;
    }

    /* LABEL STYLE */
    .pp-label {
      font-family: 'Courier New', monospace;
      text-transform: uppercase;
      letter-spacing: 0.4em;
      font-size: 0.65rem;
    }

    /* NOISE TEXTURE */
    .pp-noise::before {
      content: "";
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background-image: url("https://grainy-gradients.vercel.app/noise.svg");
      opacity: 0.04;
      pointer-events: none;
      z-index: 100;
    }

    /* GLASS CARD */
    .pp-glass {
      background: rgba(255,255,255,0.03);
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
      border: 1px solid rgba(255,255,255,0.08);
    }

    /* HOLOGRAPHIC SHIMMER */
    .pp-holographic {
      background: linear-gradient(
        90deg,
        #f5c842 0%,
        #fff8dc 15%,
        #f5c842 30%,
        #dfa32d 50%,
        #fff8dc 70%,
        #f5c842 85%,
        #dfa32d 100%
      );
      background-size: 300% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: pp-shimmer 6s linear infinite;
    }

    @keyframes pp-shimmer {
      0% { background-position: 0% 50%; }
      100% { background-position: 300% 50%; }
    }

    /* SCAN LINE */
    @keyframes pp-scan {
      0% { transform: translateY(-100vh); }
      100% { transform: translateY(100vh); }
    }
    .pp-scanline {
      animation: pp-scan 18s linear infinite;
    }

    /* FLOAT PARTICLES */
    @keyframes pp-float {
      0% { transform: translateY(100vh) translateX(0px); opacity: 0; }
      10% { opacity: var(--particle-opacity, 0.18); }
      90% { opacity: var(--particle-opacity, 0.18); }
      100% { transform: translateY(-10vh) translateX(var(--drift, 30px)); opacity: 0; }
    }
    .pp-particle {
      animation: pp-float var(--dur) linear infinite;
      animation-delay: var(--delay);
    }

    /* ORB PULSE */
    @keyframes pp-orb-travel {
      0%, 100% { top: 5%; }
      50% { top: 85%; }
    }
    .pp-orb {
      animation: pp-orb-travel 4s ease-in-out infinite;
    }

    /* SELECTION COLOR */
    ::selection {
      background: #f5c842;
      color: black;
    }

    /* LENIS */
    html.lenis { height: auto; }
    .lenis.lenis-smooth { scroll-behavior: auto !important; }
    .lenis.lenis-stopped { overflow: hidden; }

    /* CALLOUT PULSE */
    @keyframes pp-callout-glow {
      0% { box-shadow: 0 0 0px rgba(245, 200, 66, 0); }
      50% { box-shadow: 0 0 40px rgba(245, 200, 66, 0.3); }
      100% { box-shadow: 0 0 0px rgba(245, 200, 66, 0); }
    }
    .pp-callout-pulse {
      animation: pp-callout-glow 1.5s ease-out 1;
    }

    /* BREATHING LINE */
    @keyframes pp-breathe-line {
      0%, 100% { width: 150px; }
      50% { width: 250px; }
    }

    /* EMAIL HOVER */
    .pp-email {
      color: #f5c842;
      text-decoration: none;
      position: relative;
      transition: all 0.3s ease;
    }
    .pp-email::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 100%;
      height: 1px;
      background: #f5c842;
      box-shadow: 0 0 8px rgba(245, 200, 66, 0.5);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }
    .pp-email:hover::after {
      transform: scaleX(1);
    }
    .pp-email:hover {
      text-shadow: 0 0 12px rgba(245, 200, 66, 0.4);
    }

    /* CUSTOM SCROLLBAR */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #0a0a0a; }
    ::-webkit-scrollbar-thumb { background: rgba(245, 200, 66, 0.2); border-radius: 2px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(245, 200, 66, 0.4); }

    /* CURSOR HIDE ON DESKTOP */
    @media (pointer: fine) {
      .pp-cursor-hide { cursor: none; }
      .pp-cursor-hide a, .pp-cursor-hide button { cursor: none; }
    }
  ` }} />
);

/* -------------------------------------------------------------------------- */
/*                               SUB-COMPONENTS                               */
/* -------------------------------------------------------------------------- */

// — Magnetic hover effect
const Magnetic = ({ children, strength = 0.4 }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 120, damping: 12, mass: 0.05 });
  const springY = useSpring(y, { stiffness: 120, damping: 12, mass: 0.05 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    x.set((e.clientX - (left + width / 2)) * strength);
    y.set((e.clientY - (top + height / 2)) * strength);
  };

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
    >
      {children}
    </motion.div>
  );
};

// — Word-by-word character reveal
const CharacterReveal = ({ text, className = '', delay = 0, trigger = true }) => {
  const words = text.split(' ');
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.35em] py-[0.1em]">
          <motion.span
            initial={{ y: '120%', rotate: 8, opacity: 0 }}
            animate={trigger ? { y: 0, rotate: 0, opacity: 1 } : {}}
            transition={{
              duration: 1.1,
              delay: delay + i * 0.1,
              ease: [0.19, 1, 0.22, 1]
            }}
            className="inline-block origin-bottom-left"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

// — Background effects layer
const BackgroundEffects = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Generate particle data once
  const particles = useRef(
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: Math.random() > 0.5 ? 2 : 1,
      dur: `${18 + Math.random() * 14}s`,
      delay: `${Math.random() * 20}s`,
      drift: `${(Math.random() - 0.5) * 80}px`,
      opacity: 0.15 + Math.random() * 0.05,
    }))
  ).current;

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Noise texture */}
        <div className="pp-noise fixed inset-0" />

      {/* Top spotlight */}
      <motion.div
        animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
        transition={{ rotate: { duration: 40, repeat: Infinity, ease: 'linear' }, scale: { duration: 15, repeat: Infinity, ease: 'easeInOut' } }}
        className="fixed top-[-25vh] left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(245, 200, 66, 0.08) 0%, transparent 60%)',
        }}
      />

      {/* Ambient cursor glow */}
      <motion.div
        className="fixed pointer-events-none z-[1]"
        animate={{ x: mousePos.x - window.innerWidth * 0.325, y: mousePos.y - window.innerHeight * 0.325 }}
        transition={{ type: 'spring', damping: 40, stiffness: 150, mass: 0.8 }}
        style={{
          width: '65vw',
          height: '65vh',
          background: 'radial-gradient(circle, rgba(245, 200, 66, 0.08) 0%, transparent 65%)',
        }}
      />

      {/* Scan line */}
      <div
        className="fixed top-0 left-0 w-full h-[1px] pp-scanline z-50"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(245, 200, 66, 0.08) 30%, rgba(245, 200, 66, 0.08) 70%, transparent)' }}
      />

      {/* Gold dust particles */}
      <div className="fixed inset-0 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full pp-particle"
            style={{
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: '#f5c842',
              '--dur': p.dur,
              '--delay': p.delay,
              '--drift': p.drift,
              '--particle-opacity': p.opacity,
            }}
          />
        ))}
      </div>
      
      </div>

      {/* Custom cursor — gold dot */}
      <motion.div
        className="fixed top-0 left-0 w-[10px] h-[10px] bg-[#f5c842] rounded-full pointer-events-none z-[10000] -translate-x-1/2 -translate-y-1/2"
        style={{ boxShadow: '0 0 15px rgba(245, 200, 66, 0.6)' }}
        animate={{ x: mousePos.x, y: mousePos.y }}
        transition={{ type: 'spring', damping: 40, stiffness: 700, mass: 0.08 }}
      />

      {/* Custom cursor — gold ring */}
      <motion.div
        className="fixed top-0 left-0 w-[40px] h-[40px] border border-[rgba(245,200,66,0.35)] rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
        animate={{ x: mousePos.x, y: mousePos.y }}
        transition={{ type: 'spring', damping: 20, stiffness: 200, mass: 0.5 }}
      />
    </>
  );
};

// — Animated section divider
const SectionDivider = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div ref={ref} className="w-full max-w-7xl mx-auto px-10 xl:px-48">
      <motion.div
        initial={{ scaleX: 0, originX: 0 }}
        animate={isInView ? { scaleX: [1, 1.05, 1], opacity: [0.7, 1, 0.7] } : {}}
        transition={{ scaleX: { delay: 0.2, duration: 3, repeat: Infinity, ease: 'easeInOut' }, opacity: { delay: 0.2, duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
        className="h-[1px] w-full"
        style={{ background: 'linear-gradient(90deg, #f5c842, rgba(245, 200, 66, 0.3), transparent)' }}
      />
    </div>
  );
};

// — 3D Tilt Card
const TiltCard = ({ children, className, style }) => {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rotateX = useTransform(y, [0, 1], [6, -6]);
  const rotateY = useTransform(x, [0, 1], [-6, 6]);

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
      style={{ ...style, rotateX, rotateY, perspective: 1200, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <motion.div style={{ transform: "translateZ(30px)" }} className="h-full w-full">
        {children}
      </motion.div>
    </motion.div>
  );
};

// — Section wrapper with scroll animations
const Section = ({ title, children, layout = 'default', metadata = {} }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.95, 1, 1, 0.95]);
  const scrollParallaxY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <>
      <SectionDivider />
      <motion.section
        ref={ref}
        style={{ scale }}
        className="relative w-full max-w-7xl mx-auto py-28 px-10 xl:px-48"
      >
        {/* Desktop metadata gutter */}
        <div className="absolute left-8 top-0 h-full hidden xl:flex flex-col items-start pt-28 pointer-events-none">
          <div className="border-l border-[rgba(245,200,66,0.15)] pl-5 flex flex-col gap-3">
            <motion.span
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="pp-label text-[#f5c842] text-[9px]"
            >
              {metadata.label || 'ZIGG · PRIVACY'}
            </motion.span>
            <span className="pp-label text-white/20 text-[9px]">{metadata.year || '2024'}</span>
          </div>
        </div>

        {/* Scroll reveal animation wrapper */}
        <motion.div
          initial={{ opacity: 0, y: 50, rotateX: 6 }}
          animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
          transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
          style={{ perspective: 1200 }}
        >
          {/* DEFAULT LAYOUT */}
          {layout === 'default' && (
            <div className="relative z-10 w-full">
              <h2 className="pp-serif text-4xl md:text-5xl font-bold text-[#f5c842] mb-10 uppercase tracking-tight relative inline-block">
                <CharacterReveal text={title} trigger={isInView} />
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: '100%' } : {}}
                  transition={{ delay: 0.7, duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
                  className="h-[2px] bg-[#f5c842] mt-4"
                  style={{ boxShadow: '0 0 15px rgba(245, 200, 66, 0.4)' }}
                />
              </h2>
                <motion.div style={{ y: scrollParallaxY }} className="mt-8 space-y-8 max-w-5xl">
                  {React.Children.map(children, (child, i) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.3 + i * 0.08, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                    >
                      {child}
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}

            {/* CARD LAYOUT */}
            {layout === 'card' && (
              <TiltCard
                className="pp-glass p-12 md:p-20 relative z-10 rounded-lg group transition-colors duration-700 hover:border-[rgba(245,200,66,0.3)]"
                style={{ boxShadow: '0 0 0px rgba(245, 200, 66, 0), 0 25px 50px rgba(0,0,0,0.3)' }}
              >
                <h2 className="pp-serif text-4xl md:text-5xl font-bold text-[#f5c842] mb-10 uppercase tracking-tight group-hover:text-amber-gold transition-all duration-700">
                  <motion.div
                    initial={{ x: -40, opacity: 0 }}
                    animate={isInView ? { x: 0, opacity: 1 } : {}}
                    transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <CharacterReveal text={title} trigger={isInView} />
                  </motion.div>
                </h2>
                <div className="space-y-8">
                  {React.Children.map(children, (child, i) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.3 + i * 0.08, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                    >
                      {child}
                    </motion.div>
                  ))}
                </div>
              </TiltCard>
            )}

          {/* SPLIT LAYOUT */}
          {layout === 'split' && (
            <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.6fr] gap-10 lg:gap-16 items-start relative z-10 w-full">
              <div className="lg:sticky lg:top-32">
                <h2 className="pp-serif text-4xl md:text-5xl font-bold text-[#f5c842] mb-0 uppercase tracking-tight">
                  <CharacterReveal text={title} trigger={isInView} />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: '100%' } : {}}
                    transition={{ delay: 0.7, duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
                    className="h-[2px] bg-[#f5c842] mt-4"
                    style={{ boxShadow: '0 0 15px rgba(245, 200, 66, 0.4)' }}
                  />
                </h2>
              </div>
              <motion.div style={{ y: scrollParallaxY }} className="space-y-6">
                {React.Children.map(children, (child, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                  >
                    {child}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}
        </motion.div>
      </motion.section>
    </>
  );
};

/* -------------------------------------------------------------------------- */
/*                                 HEADER                                     */
/* -------------------------------------------------------------------------- */

const Header = () => {
  const [init, setInit] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setInit(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <header className="relative overflow-hidden" style={{ paddingTop: '220px', paddingBottom: '120px' }}>
      {/* Top spotlight glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[80vh] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(245, 200, 66, 0.12) 0%, transparent 60%)',
        }}
      />

      {/* Desktop metadata gutter */}
      <div className="absolute left-8 top-0 h-full hidden xl:flex flex-col pt-56 pointer-events-none">
        <div className="border-l border-[rgba(245,200,66,0.2)] pl-5 flex flex-col gap-3">
          <motion.span
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="pp-label text-[#f5c842] text-[9px]"
          >
            ZIGG · PRIVACY
          </motion.span>
          <motion.span
            animate={{ opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            className="pp-label text-white/20 text-[9px]"
          >
            2024
          </motion.span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-10 xl:px-48 relative z-10">
        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={init ? { opacity: 0.8, y: 0 } : {}}
          transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
          className="pp-serif italic text-[#f5c842] text-lg md:text-xl mb-8 tracking-wide"
        >
          Welcome to Zigguratss – Beautiful Creative Paintings!
        </motion.p>

        {/* Main title */}
        <h1 className="pp-serif font-bold uppercase text-[12vw] md:text-[8vw] lg:text-[6.5vw] leading-[0.95] tracking-tight mb-12">
          <CharacterReveal
            text="PRIVACY POLICY"
            className="pp-holographic block"
            trigger={init}
            delay={0.3}
          />
        </h1>

        {/* Breathing line + label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={init ? { opacity: 0.7 } : {}}
          transition={{ duration: 2, delay: 1.8 }}
          className="flex items-center gap-8 mt-6"
        >
          <motion.div
            animate={{ width: [150, 250, 150], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="h-[2px] bg-[#f5c842] flex-shrink-0"
            style={{ boxShadow: '0 0 20px rgba(245, 200, 66, 0.4)' }}
          />
          <span className="pp-mono italic text-white/40 text-xs tracking-widest whitespace-nowrap">
            Initiating Privacy Protocol
          </span>
        </motion.div>
      </div>
    </header>
  );
};

/* -------------------------------------------------------------------------- */
/*                            SECTION CONTENT                                 */
/* -------------------------------------------------------------------------- */

const DataCollectionSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.95, 1, 1, 0.95]);
  const scrollParallaxY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <>
      <SectionDivider />
      <motion.section
        ref={ref}
        style={{ scale }}
        className="relative w-full max-w-7xl mx-auto py-28 px-10 xl:px-48"
      >
        {/* Metadata gutter */}
        <div className="absolute left-8 top-0 h-full hidden xl:flex flex-col items-start pt-28 pointer-events-none">
          <div className="border-l border-[rgba(245,200,66,0.15)] pl-5 flex flex-col gap-3">
            <motion.span animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 4, repeat: Infinity }} className="pp-label text-[#f5c842] text-[9px]">
              SEC 01
            </motion.span>
            <span className="pp-label text-white/20 text-[9px]">2024</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50, rotateX: 6 }}
          animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
          transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
          style={{ perspective: 1200 }}
        >
          {/* Heading */}
          <h2 className="pp-serif text-4xl md:text-5xl font-bold text-[#f5c842] mb-10 uppercase tracking-tight relative inline-block">
            <CharacterReveal text="Data Collection" trigger={isInView} />
            <motion.div
              initial={{ width: 0 }}
              animate={isInView ? { width: '100%' } : {}}
              transition={{ delay: 0.7, duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
              className="h-[2px] bg-[#f5c842] mt-4"
              style={{ boxShadow: '0 0 15px rgba(245, 200, 66, 0.4)' }}
            />
          </h2>

          {/* Body with vertical accent bar */}
          <motion.div style={{ y: scrollParallaxY }} className="flex gap-10 md:gap-14 items-stretch mt-8 max-w-5xl">
            {/* Left accent bar with orb */}
            <div className="w-[2px] bg-[rgba(245,200,66,0.2)] relative flex-shrink-0 self-stretch min-h-[200px]">
              <div
                className="absolute left-[-4px] w-[10px] h-[10px] rounded-full bg-[#f5c842] pp-orb"
                style={{ boxShadow: '0 0 20px rgba(245, 200, 66, 0.8), 0 0 40px rgba(245, 200, 66, 0.3)' }}
              />
            </div>

            <div className="space-y-8">
              {/* Paragraph 1 with drop cap */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="pp-body text-base leading-[2]"
              >
                <span className="pp-serif text-[#f5c842] text-[80px] font-bold float-left mr-5 mt-1 leading-[0.75] drop-shadow-lg" style={{ textShadow: '0 0 30px rgba(245, 200, 66, 0.3)' }}>
                  I
                </span>
                n general, you can visit our website without telling us who you are or revealing any personal information about yourself. We track the Internet address of the domains from which people visit us and analyze this data for trends and statistics, but the individual user remains anonymous. However, to make better use our site including receiving communications from us and accessing certain features, you will need to sign up for our e-mail newsletters or register using our online registration form, where you are required to provide us with your contact and identity information, town/city, email id and other personal information as indicated in the forms on the site as well as your third-party account information (for example, your log-in name and password for Facebook). We may also collect information you supply to us regarding your personal preferences and interests. If you access the Service through Facebook Connect, you understand that some content and/or information in your Facebook account ("Third Party Account Information") may be transmitted into your account with us if you authorize such transmissions, and that Third Party Account Information transmitted to our Websites is covered by this Privacy Policy.
              </motion.p>

              {/* Paragraph 2 */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.38, duration: 0.8 }}
                className="pp-body text-base leading-[2]"
              >
                We only collect personal information about you that we consider relevant for achieving this purpose. If you want to make an online purchase on our website, we collect some additional information, such as a billing and shipping address, a credit or debit card number and a card expiration date. We protect the security of your credit/debit card information during transmission by using Secure Sockets Layer (SSL) software, which encrypts information you input. We reveal only the last four digits of your credit card numbers when confirming an order. Zigguratss will continue to enhance security procedures as new technology becomes available.
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>
    </>
  );
};

/* -------------------------------------------------------------------------- */
/*                             CALLOUT BLOCK                                 */
/* -------------------------------------------------------------------------- */

const CalloutBlock = ({ children }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [hasPulsed, setHasPulsed] = useState(false);

  useEffect(() => {
    if (isInView && !hasPulsed) {
      setHasPulsed(true);
    }
  }, [isInView, hasPulsed]);

  return (
    <div
      ref={ref}
      className={`border-l-[3px] border-[#f5c842] pl-8 py-6 my-6 rounded-r-md ${hasPulsed ? 'pp-callout-pulse' : ''}`}
      style={{
        background: 'rgba(245, 200, 66, 0.08)',
      }}
    >
      <p className="pp-mono italic text-white/75 text-base leading-[2]">
        {children}
      </p>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                FOOTER                                      */
/* -------------------------------------------------------------------------- */

const Footer = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <footer ref={ref} className="py-32 border-t border-white/10 text-center px-10 relative overflow-hidden bg-[#050505]">
      {/* ZIGG watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.04 }}>
        <span className="pp-serif text-[50vw] font-black uppercase tracking-tighter select-none" style={{ filter: 'blur(1px)' }}>
          ZIGG
        </span>
      </div>

      {/* Company name */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 1.5 }}
        className="pp-mono pp-holographic text-2xl md:text-3xl font-bold mb-16 relative z-10"
        style={{ letterSpacing: '0.5em' }}
      >
        ZIGGURATSS ARTWORK LLP
      </motion.div>

      {/* Links */}
      <div className="flex flex-wrap gap-12 md:gap-20 justify-center mb-16 relative z-10">
        {['LEGACY', 'TERMS', 'RESOURCES'].map((link) => (
          <Magnetic key={link}>
            {link === 'TERMS' ? (
              <Link
                to="/"
                onClick={() => window.scrollTo(0, 0)}
                className="pp-label text-white/50 text-sm font-bold hover:text-[#f5c842] transition-all duration-500"
                style={{ letterSpacing: '0.3em' }}
              >
                {link}
              </Link>
            ) : (
              <a
                href="#"
                className="pp-label text-white/50 text-sm font-bold hover:text-[#f5c842] transition-all duration-500"
                style={{ letterSpacing: '0.3em' }}
              >
                {link}
              </a>
            )}
          </Magnetic>
        ))}
      </div>

      {/* Copyright */}
      <div className="pp-mono text-white/15 text-[11px] relative z-10" style={{ letterSpacing: '0.4em' }}>
        Copyright © 2026 Zigguratss Artwork LLP. All Rights Reserved.
      </div>
    </footer>
  );
};

/* -------------------------------------------------------------------------- */
/*                          CLOSING STATEMENT                                 */
/* -------------------------------------------------------------------------- */

const ClosingSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <>
      <SectionDivider />
      <section ref={ref} className="relative w-full max-w-7xl mx-auto py-32 px-10 xl:px-48 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Heading */}
          <h2 className="pp-serif text-4xl md:text-5xl font-bold text-[#f5c842] mb-12 uppercase tracking-tight">
            <CharacterReveal text="Contact" trigger={isInView} />
          </h2>

          {/* Body */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="pp-body text-base leading-[2] max-w-3xl mx-auto mb-8"
          >
            We are committed to protecting and safeguarding your privacy. Please contact us at{' '}
            <a href="mailto:info@zigguratss.com" className="pp-email pp-holographic" style={{ WebkitTextFillColor: '#f5c842', backgroundImage: 'none' }}>
              info@zigguratss.com
            </a>{' '}
            if you have any questions.
          </motion.p>

          {/* Closing statement */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 1 }}
            className="pp-serif italic text-3xl md:text-4xl lg:text-5xl pp-holographic mt-16 mb-20 leading-snug"
          >
            Thank you for visiting Zigguratss.
          </motion.p>

          {/* Decorative separator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.8, duration: 1 }}
            className="flex items-center justify-center gap-6 md:gap-10 mt-10"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={isInView ? { width: 120 } : {}}
              transition={{ delay: 1, duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
              className="h-[1px] bg-[#f5c842]"
              style={{ boxShadow: '0 0 10px rgba(245, 200, 66, 0.3)' }}
            />
            <span className="pp-serif text-[#f5c842] text-base md:text-lg tracking-[0.3em] whitespace-nowrap select-none">
              ✦ ZIGGURATSS ✦
            </span>
            <motion.div
              initial={{ width: 0 }}
              animate={isInView ? { width: 120 } : {}}
              transition={{ delay: 1, duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
              className="h-[1px] bg-[#f5c842]"
              style={{ boxShadow: '0 0 10px rgba(245, 200, 66, 0.3)' }}
            />
          </motion.div>
        </motion.div>
      </section>
    </>
  );
};

/* -------------------------------------------------------------------------- */
/*                              MAIN COMPONENT                                */
/* -------------------------------------------------------------------------- */

const PrivacyPolicy = () => {
  // Lenis smooth scroll
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Privacy Policy | Zigguratss";
    
    const lenis = new Lenis({
      duration: 1.6,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      lerp: 0.05,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return (
    <div className="pp-cursor-hide relative z-10 w-full overflow-hidden text-white" style={{ background: '#0a0a0a' }}>
      <PrivacyStyles />
      <BackgroundEffects />

      {/* ————— HEADER ————— */}
      <Header />

      {/* ————— SECTION 1: DATA COLLECTION ————— */}
      <DataCollectionSection />

      {/* ————— SECTION 2: COOKIES & COMMUNICATIONS ————— */}
      <Section title="Cookies & Communications" layout="card" metadata={{ label: 'SEC 02' }}>
        <p className="pp-body text-base leading-[2]">
          We use data collection devices such as "cookies" on certain pages of the site to help analyze our web page flow, measure promotional effectiveness, and promote trust and safety. "Cookies" are small files placed on your device that allow us to identify your browser and device and assist us in providing our services. We offer certain features that are only available through the use of a "cookie". We also use cookies to allow you to enter your password less frequently during a session. Cookies can also help us provide information that is targeted to your interests. Most cookies are "session cookies," meaning that they automatically expire at the end of a session. You are always free to decline our cookies if your browser permits, although in that case you may not be able to use certain features on the site and you may be required to re-enter your password more frequently during a session.
        </p>
        <p className="pp-body text-base leading-[2]">
          In order to provide you with timely notice about new products and events, Zigguratss may send you email notices based on your expressed interests history. To help us make these e-mails more useful and interesting, we often receive a confirmation when you open the e-mail or click on a link if your computer supports such capabilities. At any time, you may click the unsubscribe link at the bottom of most emails we send to stop receiving those emails. You may also send an email to{' '}
          <a href="mailto:info@zigguratss.com" className="pp-email">info@zigguratss.com</a>
          {' '}and request that your email address be removed from our lists.
        </p>
        <p className="pp-body text-base leading-[2]">
          If you send us personal correspondence, such as emails or letters, or if other users or third parties send us correspondence about your activities or postings on the Site, we may collect such information into a file specific to you. We would like to reiterate that we limit the use of your information to the extent that we reasonably require to deliver our products, services and other opportunities, and to administer our business. Zigguratss does not sell, lease or give your personal information to any other company.
        </p>
      </Section>

      {/* ————— SECTION 3: DATA SECURITY ————— */}
      <Section title="Data Security" layout="split" metadata={{ label: 'SEC 03' }}>
        <p className="pp-body text-base leading-[2]">
          Any personal data you provide to us is securely stored in our internal Information Technology (IT) systems to which only authorized Zigguratss employees are permitted access. This access is provided to employees only on a "need-to-know" basis to the extent necessary to execute their official responsibilities.
        </p>

        <CalloutBlock>
          We neither rent nor sell your personal information in personally identifiable form to anyone.
        </CalloutBlock>

        <p className="pp-body text-base leading-[2]">
          We may release your personal information when we believe in good faith that release is necessary to comply with laws; enforce or apply our conditions of use and/or other agreements; or protect the rights, property, or safety of Zigguratss, our employees, our users, or others. We may exchange information with other companies and organisations (including governmental authorities) for fraud protection and credit risk reduction.
        </p>
        <p className="pp-body text-base leading-[2]">
          Except as set forth in this Privacy Policy, your personal information may be shared with third parties only with your consent. By using the website, you consent to the collection and use of the information you disclose on the site by Zigguratss.
        </p>
      </Section>

      {/* ————— SECTION 4: AMENDMENTS ————— */}
      <Section title="Amendments" layout="default" metadata={{ label: 'SEC 04' }}>
        <div className="relative">
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden" style={{ opacity: 0.03 }}>
            <span className="pp-serif text-[20vw] font-black uppercase tracking-tighter whitespace-nowrap" style={{ color: 'white' }}>
              AMENDMENTS
            </span>
          </div>
          <p className="pp-body text-base leading-[2] relative z-10">
            We may amend this Privacy Policy from time to time. Use of information we collect now is subject to the Privacy Policy in effect at the time such information is used. If we make changes in the way we use Personal Information, we will modify this page. You are bound by any changes to the Privacy Policy when you use the Websites.
          </p>
        </div>
      </Section>

      {/* ————— SECTION 5: CONTACT (Closing) ————— */}
      <ClosingSection />

      {/* ————— FOOTER ————— */}
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

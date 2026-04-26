import React, { Suspense, useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, ContactShadows, Environment } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import * as THREE from 'three';

// --------------------------------------------------------------------------------
// 1. DATA: EMBEDDED PRIVACY CONTENT
// --------------------------------------------------------------------------------
const privacyContent = [
  {
    chapter: "PRIVACY 01",
    title: "Data Collection",
    text: "In general, you can visit our website without telling us who you are or revealing any personal information about yourself. We track the Internet address of the domains from which people visit us and analyze this data for trends and statistics, but the individual user remains anonymous. However, to make better use our site including receiving communications from us and accessing certain features, you will need to sign up for our e-mail newsletters or register using our online registration form, where you are required to provide us with your contact and identity information, town/city, email id and other personal information as indicated in the forms on the site as well as your third-party account information (for example, your log-in name and password for Facebook). We may also collect information you supply to us regarding your personal preferences and interests. If you access the Service through Facebook Connect, you understand that some content and/or information in your Facebook account (\"Third Party Account Information\") may be transmitted into your account with us if you authorize such transmissions, and that Third Party Account Information transmitted to our Websites is covered by this Privacy Policy. We only collect personal information about you that we consider relevant for achieving this purpose. If you want to make an online purchase on our website, we collect some additional information, such as a billing and shipping address, a credit or debit card number and a card expiration date. We protect the security of your credit/debit card information during transmission by using Secure Sockets Layer (SSL) software, which encrypts information you input. We reveal only the last four digits of your credit card numbers when confirming an order. Zigguratss will continue to enhance security procedures as new technology becomes available."
  },
  {
    chapter: "PRIVACY 02",
    title: "Cookies & Communications",
    text: "We use data collection devices such as \"cookies\" on certain pages of the site to help analyze our web page flow, measure promotional effectiveness, and promote trust and safety. \"Cookies\" are small files placed on your device that allow us to identify your browser and device and assist us in providing our services. We offer certain features that are only available through the use of a \"cookie\". We also use cookies to allow you to enter your password less frequently during a session. Cookies can also help us provide information that is targeted to your interests. Most cookies are \"session cookies,\" meaning that they automatically expire at the end of a session. You are always free to decline our cookies if your browser permits, although in that case you may not be able to use certain features on the site and you may be required to re-enter your password more frequently during a session. In order to provide you with timely notice about new products and events, Zigguratss may send you email notices based on your expressed interests history. To help us make these e-mails more useful and interesting, we often receive a confirmation when you open the e-mail or click on a link if your computer supports such capabilities. At any time, you may click the unsubscribe link at the bottom of most emails we send to stop receiving those emails. You may also send an email to info@zigguratss.com and request that your email address be removed from our lists. If you send us personal correspondence, such as emails or letters, or if other users or third parties send us correspondence about your activities or postings on the Site, we may collect such information into a file specific to you. We would like to reiterate that we limit the use of your information to the extent that we reasonably require to deliver our products, services and other opportunities, and to administer our business. Zigguratss does not sell, lease or give your personal information to any other company."
  },
  {
    chapter: "PRIVACY 03",
    title: "Data Security",
    text: "Any personal data you provide to us is securely stored in our internal Information Technology (IT) systems to which only authorized Zigguratss employees are permitted access. This access is provided to employees only on a \"need-to-know\" basis to the extent necessary to execute their official responsibilities. We neither rent nor sell your personal information in personally identifiable form to anyone. We may release your personal information when we believe in good faith that release is necessary to comply with laws; enforce or apply our conditions of use and/or other agreements; or protect the rights, property, or safety of Zigguratss, our employees, our users, or others. We may exchange information with other companies and organisations (including governmental authorities) for fraud protection and credit risk reduction. Except as set forth in this Privacy Policy, your personal information may be shared with third parties only with your consent. By using the website, you consent to the collection and use of the information you disclose on the site by Zigguratss."
  },
  {
    chapter: "PRIVACY 04",
    title: "Amendments",
    text: "We may amend this Privacy Policy from time to time. Use of information we collect now is subject to the Privacy Policy in effect at the time such information is used. If we make changes in the way we use Personal Information, we will modify this page. You are bound by any changes to the Privacy Policy when you use the Websites."
  },
  {
    chapter: "PRIVACY 05",
    title: "Contact",
    text: "We are committed to protecting and safeguarding your privacy. Please contact us at info@zigguratss.com if you have any questions. Thank you for visiting Zigguratss."
  }
];

// --------------------------------------------------------------------------------
// 2. SHADER: HELIX SHADER SOURCE
// --------------------------------------------------------------------------------
const HelixShader = {
  uniforms: {
    uTexture: { value: null },
    uTime: { value: 0 },
    uScrollVelocity: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uOpacity: { value: 1.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float uTime;
    uniform vec2 uMouse;

    void main() {
      vUv = uv;
      vPosition = position;
      vec3 pos = position;
      vec2 screenPos = (modelMatrix * vec4(pos, 1.0)).xy;
      float dist = distance(screenPos, uMouse);
      pos.z += smoothstep(12.0, 0.0, dist) * 0.15;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float uOpacity;
    uniform float uTime;
    
    float noise(vec2 n) {
      return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
    }

    void main() {
      vec4 texColor = texture2D(uTexture, vUv);
      float focalCenter = 1.0 - distance(vUv, vec2(0.5, 0.5));
      texColor.rgb *= (0.95 + focalCenter * 0.1);
      float scanline = sin(vUv.y * 1200.0 + uTime * 2.0) * 0.005;
      float grain = (noise(vUv + uTime) - 0.5) * 0.01;
      texColor.rgb += scanline + grain;
      texColor.a *= uOpacity;
      gl_FragColor = texColor;
    }
  `
};

// --------------------------------------------------------------------------------
// 3. COMPONENTS: THREE.JS INTERNAL LOGIC
// --------------------------------------------------------------------------------

const Particles = ({ count = 2000 }) => {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t = t + speed;
      dummy.position.set(
        xFactor + Math.cos(t) + (Math.sin(t * 1) * factor) / 10,
        yFactor + Math.sin(t) + (Math.cos(t * 2) * factor) / 10,
        zFactor + Math.cos(t) + (Math.sin(t * 3) * factor) / 10
      );
      dummy.scale.setScalar(0.02 + Math.random() * 0.05);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
    </instancedMesh>
  );
};

const KineticShards = ({ count = 60, scrollProgress = 0, mousePos }) => {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const { viewport } = useThree();

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 30 + Math.random() * 80;
      const speed = 0.005 + Math.random() / 150;
      const xFactor = -60 + Math.random() * 120;
      const yFactor = -40 + Math.random() * 80;
      const zFactor = -40 + Math.random() * 60;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, curX: xFactor, curY: yFactor, curZ: zFactor });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t = t + speed;
      const a = Math.cos(t);
      const b = Math.sin(t);
      const s = Math.cos(t);

      let targetX = xFactor + (a * factor) / 8;
      let targetY = yFactor + (b * factor) / 8 + scrollProgress * 60.0;
      let targetZ = zFactor + (s * factor) / 8;

      if (mousePos) {
        const dx = (mousePos.x * viewport.width / 2) - particle.curX;
        const dy = (mousePos.y * viewport.height / 2) - (particle.curY - scrollProgress * 60.0);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 15.0) {
          targetX += dx * 0.15;
          targetY += dy * 0.15;
        }
      }

      particle.curX = THREE.MathUtils.lerp(particle.curX, targetX, 0.05);
      particle.curY = THREE.MathUtils.lerp(particle.curY, targetY, 0.05);
      particle.curZ = THREE.MathUtils.lerp(particle.curZ, targetZ, 0.05);

      dummy.position.set(particle.curX, particle.curY, particle.curZ);
      dummy.rotation.set(s * 2, t * 1, s * 1);
      dummy.scale.setScalar(0.15 + Math.abs(s) * 0.2);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={1.2} transparent opacity={0.25} />
    </instancedMesh>
  );
};

const HelixTile = ({ data, index, totalCount, scrollProgress, mousePosition, isMobile }) => {
  const meshRef = useRef();
  const materialRef = useRef();
  const { gl } = useThree();
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    const generateTexture = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const scale = 2.0;

      // Professional Responsive Calibration
      const baseWidth = isMobile ? 1600 : 2048;
      const baseFontSize = isMobile ? 54 : 86;
      const bodyFontSize = isMobile ? 36 : 26;
      const maxWidth = isMobile ? 1000 : 1800;
      const lineHeight = isMobile ? 52 : 40;
      const headerSpace = isMobile ? 250 : 250;

      // Real measurement pre-pass
      ctx.font = `500 ${bodyFontSize}px "Inter"`;
      const words = data.text.split(' ');
      let lineCount = 1;
      let testLineMsg = '';
      for (let n = 0; n < words.length; n++) {
        let testText = testLineMsg + words[n] + ' ';
        let metrics = ctx.measureText(testText);
        if (metrics.width > maxWidth && n > 0) {
          testLineMsg = words[n] + ' ';
          lineCount++;
        } else {
          testLineMsg = testText;
        }
      }

      // Height Safety
      const bodySpace = lineCount * lineHeight;
      const calculatedHeight = Math.max(1024, headerSpace + bodySpace + 140);

      canvas.width = baseWidth * scale;
      canvas.height = calculatedHeight * scale;

      ctx.scale(scale, scale);
      ctx.fillStyle = '#010101';
      ctx.fillRect(0, 0, baseWidth, calculatedHeight);

      const paddingX = isMobile ? (baseWidth - maxWidth) / 2 : 80;
      // Label
      ctx.font = 'bold 24px "DM Mono"';
      ctx.fillStyle = '#ffcc00';
      ctx.fillText(`${data.chapter}`, paddingX, 60);

      // Title
      ctx.font = `italic 800 ${baseFontSize}px "Inter Tight"`;
      ctx.fillStyle = '#ffffff';
      const titleY = isMobile ? 130 : 150;
      ctx.fillText(data.title.toUpperCase(), paddingX, titleY);

      // Body Text
      ctx.font = `500 ${bodyFontSize}px "Inter"`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#ffffff';
      let line = '';
      let y = headerSpace;

      for (let i = 0; i < words.length; i++) {
        let testLine = line + words[i] + ' ';
        let metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && i > 0) {
          ctx.font = `500 ${bodyFontSize}px "Inter"`;
          ctx.fillStyle = '#ffffff';
          ctx.fillText(line, paddingX, y);
          line = words[i] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.font = `500 ${bodyFontSize}px "Inter"`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(line, paddingX, y);

      const tex = new THREE.CanvasTexture(canvas);
      tex.anisotropy = gl.capabilities.getMaxAnisotropy();
      tex.needsUpdate = true;
      setTexture(tex);
    };

    generateTexture();
    document.fonts.ready.then(generateTexture);

    // Safety fallback for route switches
    const timer = setTimeout(generateTexture, 100);

    return () => {
      clearTimeout(timer);
      if (texture) texture.dispose();
    };
  }, [data, gl, isMobile]);

  useEffect(() => {
    return () => {
      if (texture) texture.dispose();
      if (meshRef.current) {
        meshRef.current.geometry.dispose();
        if (meshRef.current.material) meshRef.current.material.dispose();
      }
    };
  }, [texture]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const verticalSpacing = isMobile ? 45 : 24;
    const scrollOffset = scrollProgress * (totalCount - 1) * verticalSpacing;
    const targetY = -index * verticalSpacing + scrollOffset;
    const zDepth = targetY > 5.0 ? -(targetY - 5.0) * 10.0 : 0;

    meshRef.current.position.set(0, targetY, zDepth);
    meshRef.current.lookAt(0, targetY, 35);

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.uMouse.value.lerp(mousePosition, 0.1);
      const distFromCenter = Math.abs(targetY);
      const opacityClamp = isMobile ? 25.0 : 17.0;
      materialRef.current.uniforms.uOpacity.value = THREE.MathUtils.clamp(2.5 - (distFromCenter / opacityClamp), 0.0, 1.0);
    }
  });

  if (!texture) return null;

  const planeWidth = isMobile ? 16 : 28;
  const planeHeight = isMobile ? 22 : 14;

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[planeWidth, planeHeight, 32, 24]} />
      <shaderMaterial
        ref={materialRef}
        transparent={true}
        side={THREE.DoubleSide}
        uniforms={THREE.UniformsUtils.clone(HelixShader.uniforms)}
        vertexShader={HelixShader.vertexShader}
        fragmentShader={HelixShader.fragmentShader}
        onBeforeCompile={(shader) => {
          shader.uniforms.uTexture = { value: texture };
        }}
      />
    </mesh>
  );
};

const HelixStage = ({ data, isMobile, fontsReady }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mousePos] = useState(() => new THREE.Vector2(0, 0));
  const lightRef = useRef();

  useFrame((state) => {
    const windowHeight = window.innerHeight;
    const fullHeight = document.documentElement.scrollHeight;
    const scrolled = window.scrollY;
    const scrollMax = fullHeight - windowHeight;
    const progress = scrollMax > 0 ? scrolled / scrollMax : 0;
    setScrollProgress(progress);

    mousePos.lerp(state.mouse, 0.1);
    const time = state.clock.getElapsedTime();
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, isMobile ? 0 : state.mouse.x * 2.0, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, isMobile ? 0 : state.mouse.y * 2.0, 0.05);
    state.camera.position.z = 35 + Math.sin(time * 0.4) * 0.5;
    state.camera.rotation.y = THREE.MathUtils.lerp(state.camera.rotation.y, isMobile ? 0 : -state.mouse.x * 0.08, 0.05);
    state.camera.rotation.x = THREE.MathUtils.lerp(state.camera.rotation.x, isMobile ? 0 : state.mouse.y * 0.08, 0.05);

    if (lightRef.current) {
      lightRef.current.position.x = Math.sin(progress * Math.PI + time * 0.2) * 25;
      lightRef.current.position.y = 40;
      lightRef.current.position.z = Math.cos(progress * Math.PI) * 20;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <spotLight ref={lightRef} position={[0, 40, 10]} angle={0.6} penumbra={1} intensity={8} color="#ffcc00" castShadow />
      <KineticShards count={60} scrollProgress={scrollProgress} mousePos={mousePos} />
      <Float speed={2} rotationIntensity={0.15} floatIntensity={0.15}>
        <group position={[0, isMobile ? -3 : 1, 0]}>
          {data.map((item, index) => (
            <HelixTile
              key={index}
              data={item}
              index={index}
              totalCount={data.length}
              scrollProgress={scrollProgress}
              mousePosition={mousePos}
              isMobile={isMobile}
            />
          ))}
        </group>
      </Float>
      <Particles count={2000} />
      <ContactShadows position={[0, -35, 0]} opacity={0.3} scale={120} blur={2} far={70} />
      <Environment preset="night" />
    </>
  );
};

// --------------------------------------------------------------------------------
// 4. UI: NAVIGATION & LAYOUT
// --------------------------------------------------------------------------------

const NavLink = ({ to, label, active }) => (
  <Link to={to} className="relative group flex items-center gap-4 overflow-hidden">
    <motion.span className={`text-[0.65rem] font-bold uppercase tracking-[0.3em] transition-all duration-500 ${active ? 'text-dialect-accent' : 'text-dialect-text/50 group-hover:text-dialect-text'}`}>
      {label}
    </motion.span>
    <div className={`w-8 h-px bg-dialect-accent transition-all duration-700 ${active ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} />
  </Link>
);

const MinimalNav = ({ isMobile }) => {
  const location = useLocation();
  return (
    <nav className="fixed top-0 left-0 w-full p-6 md:p-12 z-[100] flex justify-between items-start pointer-events-none">
      <Link to="/" className="pointer-events-auto h-12 flex items-center gap-2 group">
        <div className="w-6 h-6 md:w-8 md:h-8 bg-dialect-accent rounded-sm flex items-center justify-center text-dialect-bg font-extrabold text-sm md:text-xl">Z</div>
        <div className="overflow-hidden">
          <motion.span initial={{ y: '100%' }} animate={{ y: '0%' }} className="block text-dialect-text font-black tracking-tighter text-sm md:text-lg leading-none group-hover:text-dialect-accent transition-colors duration-300">
            ZIGGURATSS
          </motion.span>
        </div>
      </Link>
      <div className="flex flex-col items-end gap-1 md:gap-2 pointer-events-auto">
        <NavLink to="/" label="Terms" active={location.pathname === '/'} />
        <NavLink to="/privacy" label="Privacy" active={location.pathname === '/privacy'} />
      </div>
    </nav>
  );
};

// Interaction system integrated into button

// --------------------------------------------------------------------------------
// 5. MAIN PAGE COMPONENT: PRIVACY POLICY
// --------------------------------------------------------------------------------

const PrivacyPolicy = () => {
  const [isAgreed, setIsAgreed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleAgree = () => {
    setIsAgreed(true);
  };

  return (
    <main className="relative w-full min-h-[800vh] bg-dialect-bg cursor-crosshair">
      <MinimalNav isMobile={isMobile} />
      <div className="fixed inset-0 w-full h-screen bg-dialect-bg z-[1] pointer-events-none">
        <Canvas
          shadows
          className="pointer-events-auto"
          camera={{ position: [0, 0, isMobile ? 42 : 35], fov: isMobile ? 42 : 35 }}
          gl={{ antialias: true, stencil: false, depth: true }}
          onCreated={(s) => s.scene.fog = new THREE.FogExp2('#020202', isMobile ? 0.02 : 0.015)}
        >
          <Suspense fallback={null}>
            <HelixStage data={privacyContent} isMobile={isMobile} />
          </Suspense>
        </Canvas>
        <div className="absolute bottom-12 left-12 max-md:hidden flex flex-col gap-2 pointer-events-none">
          <div className="meta-label text-[0.65rem]">Copyright © 2026 Zigguratss Artwork LLP. All Rights Reserved.</div>
        </div>
      </div>
      <div className="relative z-10 pointer-events-none">
        <div className="h-screen flex items-center justify-center">
          <div className="fixed top-24 md:top-12 left-1/2 -translate-x-1/2 z-50 mix-blend-difference text-center w-full px-6">
            <h1 className="gallery-heading text-[0.45rem] md:text-[0.6rem] tracking-[0.2em] md:tracking-[0.8em] uppercase">PRIVACY POLICY</h1>
          </div>
        </div>
      </div>
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-8 pointer-events-auto w-full px-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-px h-8 bg-dialect-accent/30" />
          <p className="text-[0.5rem] md:text-[0.55rem] text-dialect-text/30 tracking-[0.3em] font-medium uppercase text-center">End of Privacy Covenants</p>
        </div>

        <button
          onClick={handleAgree}
          disabled={isAgreed}
          className={`group relative px-12 py-4 w-full max-w-[280px] h-[58px] md:h-[64px] bg-transparent border transition-all duration-700 overflow-hidden flex items-center justify-center ${isAgreed ? 'border-dialect-accent/50 cursor-default' : 'border-dialect-accent/30 hover:border-dialect-accent'}`}
        >
          <div className="absolute inset-0 bg-dialect-accent/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />

          <AnimatePresence mode="wait">
            {!isAgreed ? (
              <motion.span
                key="sign-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
                className="relative z-10 text-[0.55rem] md:text-[0.7rem] font-bold tracking-[0.3em] md:tracking-[0.4em] text-dialect-accent uppercase"
              >
                Agree and Continue
              </motion.span>
            ) : (
              <motion.div
                key="signed-badge"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 flex items-center gap-4"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <motion.path
                    d="M5 12L10 17L19 8"
                    stroke="#ffcc00"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </svg>
                <span className="text-[0.55rem] md:text-[0.65rem] tracking-[0.4em] md:tracking-[0.5em] text-dialect-accent uppercase font-black">Privacy Signed</span>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
      <div className="fixed inset-0 pointer-events-none border-[12px] md:border-[30px] border-dialect-bg/80 z-40" />
    </main>
  );
};

export default PrivacyPolicy;

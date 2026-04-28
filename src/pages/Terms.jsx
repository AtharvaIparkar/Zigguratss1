import React, { Suspense, useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, ContactShadows, Environment } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import * as THREE from 'three';

// --------------------------------------------------------------------------------
// 1. DATA: EMBEDDED TERMS CONTENT
// --------------------------------------------------------------------------------
const termsContent = [
  {
    chapter: "CH 01",
    title: "Terms of Use",
    text: "The sale made through Zigguratss are contracted directly between the buyer and the Seller/Artist. Zigguratss is not, in any respect, a reseller of the artworks proposed by the seller through Zigguratss. Zigguratss acts simply as a middleman, in the context of the provision of the site that allows Seller/Artist and buyers to connect and do business. The artworks offered for sale on Zigguratss by the Seller/Artist are subject to their availability. The artworks made available for sale on the website may not always be in the physical possession of Zigguratss and may be physically located anywhere in the world."
  },
  {
    chapter: "CH 02",
    title: "Orders",
    text: "Each of the artwork comes with a short explanation sheet containing information about its dimension, weight, type etc. To order an artwork, the buyer must select the artwork of choice and add it in the cart and provide the necessary personal information to place the order. Before finalising the order, the buyer must check the information on the order summary, if found any mistakes, the buyer can correct them before finalising the order. The buyer payment will be returned in full if the artwork's availability from the artists is not possible due to any unforeseen reasons. The same shall be intimated to the buyer within 24 hours of his purchase of artwork from online portal of Zigguratss. If the artwork is no longer available, an email regarding the same will be sent to buyer within 48 hours, cancelling the order."
  },
  {
    chapter: "CH 03",
    title: "Sales Prices & Terms of Payment",
    text: "All artworks made available for sale on the website will be sold at the listed price and no discounts will be granted to the buyer. The information provided during registration or amended at the time of finalising a purchase shall be the final billing address and shipping address for delivery of the object. Shipping cost is included in the cost of artwork. The artist must add the cost of shipping in his/her artist price depending upon the type of artwork, its dimension, its weight, as well as the place of delivery(highest cost of shipping as order can be placed from any country). Transfer of ownership happens as soon as the full price has been paid by the buyer. Failure to do so, will automatically cancels the order and the artworks is put back for sale on Zigguratss website. Placing an order on Zigguratss constitutes an irrevocable acceptance of the purchase, unless cancelled by Zigguratss within 2 working days on account of a default by the seller or any prior or continuing breach by the buyer, such acceptance results in an enforceable contact of sale. The contract of sale is between Zigguratss (acting as the agent of the Seller/Artist) and the buyer. Zigguratss shall assume no responsibility for any errors or omissions that may occur in the description, pricing or other content related to the artwork. In the event of such error, Zigguratss reserves the right to cancel the order placed by the buyer by informing the buyer in writing. You agree to abide by all provisions prescribed in these terms and conditions. The particular, you warrant that all information that you submit will true and accurate and you agree to pay all the cost, charges plus applicable taxes for the purchase made by you. All objects (other than jewellery, watches and precious stone) displayed on site, Zigguratss is not obligated to provide any physical overview of the object either before or after the sale. Zigguratss is in no way liable for the condition of the object. Conditions reports are provided on request and are based on the information provided by the seller. All the liability of product lies with seller, Zigguratss is simply acting as a middleman or agent."
  },
  {
    chapter: "CH 04",
    title: "Refund Policy",
    text: "Art is precious and valuable, it takes time to complete a single work of art. Due to its fragile and singular nature we are unable to allow returns. Hence, we urge you to be certain of your decision before purchasing it. We are always available to ensure that the art you see is the art you get. If you're in doubt, you can always ask for additional images of the artworks. However, there may be times when you receive an item in damaged condition, in which case we will ensure a timely resolution keeping in mind your interest. This may be through repair, exchange or return of the product. Refund request must be raised immediately i.e, within 24 hours of receipt of artwork, through Customer dashboard alongwith photographs of the damaged Artwork."
  },
  {
    chapter: "CH 05",
    title: "Cancel & Return Policy",
    text: "No cancellation policy- Should a Seller/Artist become aware of any reason which may cause a delay in delivery of and artwork, Seller/Artist will immediately notified of such reasons and expected delay time. On being so notified, Zigguratss may attempt to contact the buyer and/or offer a refund with regard to such sale of the artwork and/cancel the order with respect to such art. OR If a buyer elects a return of art (only if met by Zigguratss refund policy), the buyer must raise a request immediately through Customer dashboard after receipt of Artwork alongwith photographs of the damaged Artwork. We shall debit seller for the purchase fees less any insurance, packing freight and transport fees associated with buyer's purchase. Reimbursement shall be made by same mode of payment through which the purchase was made else will be decided by the Zigguratss Management based on banking details provided by Customer at the time of making payment. Insurance, packing and shipping fees associated with the return of the returned item shall be the sole responsibility of the Seller, and Zigguratss shall have no obligation to reimburse the Seller for such amounts. The unsatisfactory condition will only be covered or damaged or spoilt condition and not because the buyer did not like the artwork."
  },
  {
    chapter: "CH 06",
    title: "Taxes",
    text: "Buyer's is responsible for paying all fees/costs/charges associated with the use of the website to purchase Artwork and you agree to bear any and all applicable taxes/GST, Cess, Custom Duties, Octoroi, etc. levied thereon."
  },
  {
    chapter: "CH 07",
    title: "Fees & Services for Artist",
    text: "The profit ratio will be shared with you on individual basis via email or any other mode of contact. For commission work percentage will be negotiated over the call as there is no fixed criteria for commission and it depends upon the need of the cleint."
  },
  {
    chapter: "CH 08",
    title: "Remittance of Proceeds",
    text: "Ziggurats shall remit the purchase fees to seller, after deducting the Ziggurats commissions, within 21 days after the full confirmation of the artwork obtained by the buyer or the date when Ziggurats verifies the receipt of the purchase fees from the buyer. All payments will be made direct deposits/transfer, credit card or debit card."
  },
  {
    chapter: "CH 09",
    title: "Purchasing Artwork",
    text: "All artwork posted for sale by Artist on the Zigguratss website is supported by an authenticity certificate from the Artist themselves. Ziggurats does not issue any authenticity certificate of its own."
  },
  {
    chapter: "CH 10",
    title: "Ownership Transfer",
    text: "The Artwork shall be and remain at the risk of the Seller/Artist until it is shipped and reach to the Buyer and thereafter the risk shall shift to the Buyer."
  }
];

// --------------------------------------------------------------------------------
// 2. SHADER: HELIX SHADER SOURCE (Clarity Version)
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
  const [tileHeight, setTileHeight] = useState(isMobile ? 22 : 14);

  useEffect(() => {
    const generateTexture = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const scale = 2.0;

      // Professional Responsive Calibration
      const baseWidth = isMobile ? 1600 : 2048;
      const baseFontSize = isMobile ? 54 : 86;
      const bodyFontSize = isMobile ? 44 : 26;
      const maxWidth = isMobile ? 1000 : 1800;
      const lineHeight = isMobile ? 62 : 40;
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

      const planeWidth = isMobile ? 15 : 28;
      setTileHeight((calculatedHeight / baseWidth) * planeWidth);
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
    const verticalSpacing = isMobile ? 80 : 24;
    const scrollOffset = scrollProgress * (totalCount - 1) * verticalSpacing;
    let targetY = -index * verticalSpacing + scrollOffset;

    // Make last para go more up on mobile
    if (isMobile && index === totalCount - 1) {
      targetY += 10;
    }

    const zDepth = targetY > 5.0 ? -(targetY - 5.0) * (isMobile ? 5.0 : 10.0) : 0;

    meshRef.current.position.set(0, targetY, zDepth);
    meshRef.current.lookAt(0, targetY, 35);

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.uMouse.value.lerp(mousePosition, 0.1);
      const distFromCenter = Math.abs(targetY);
      const opacityClamp = isMobile ? 40.0 : 17.0;
      materialRef.current.uniforms.uOpacity.value = THREE.MathUtils.clamp(2.5 - (distFromCenter / opacityClamp), 0.0, 1.0);
    }
  });

  if (!texture) return null;

  const planeWidth = isMobile ? 15 : 28;
  const planeHeight = tileHeight;

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
              fontsReady={fontsReady}
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
// 5. MAIN PAGE COMPONENT: TERMS
// --------------------------------------------------------------------------------

const Terms = () => {
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
            <HelixStage data={termsContent} isMobile={isMobile} />
          </Suspense>
        </Canvas>
        <div className="absolute bottom-12 left-12 max-md:hidden flex flex-col gap-2 pointer-events-none">
          <div className="meta-label text-[0.65rem]">Copyright © 2026 Zigguratss Artwork LLP. All Rights Reserved.</div>
        </div>
      </div>
      <div className="relative z-10 pointer-events-none">
        <div className="h-screen flex items-center justify-center">
          <div className="fixed top-24 md:top-12 left-1/2 -translate-x-1/2 z-50 mix-blend-difference text-center w-full px-6">
            <h1 className="gallery-heading text-[0.6rem] md:text-[0.6rem] tracking-[0.2em] md:tracking-[0.8em] uppercase">GENERAL TERMS AND CONDITIONS FOR ARTIST'S AND BUYER'S</h1>
          </div>
        </div>
      </div>
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-8 pointer-events-auto w-full px-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-px h-8 bg-dialect-accent/30" />
          <p className="text-[0.5rem] md:text-[0.55rem] text-dialect-text/30 tracking-[0.3em] font-medium uppercase text-center">End of Covenant Agreement</p>
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
                <span className="text-[0.55rem] md:text-[0.65rem] tracking-[0.4em] md:tracking-[0.5em] text-dialect-accent uppercase font-black">Archive Signed</span>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
      <div className="fixed inset-0 pointer-events-none border-[12px] md:border-[30px] border-dialect-bg/80 z-40" />
    </main>
  );
};

export default Terms;

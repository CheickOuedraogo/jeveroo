/* JAVEROO — Main JavaScript — Three.js · GSAP · Lenis */

let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;
const isMobile = window.innerWidth < 768;

// ============ PAGE LOADER ============
function initLoader() {
    const loader = document.getElementById('loader');
    const letters = document.querySelectorAll('.loader-letter');
    const tagline = document.querySelector('.loader-tagline');
    const barFill = document.querySelector('.loader-bar-fill');
    const canvas = document.getElementById('loader-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    for (let i = 0; i < 60; i++) {
        particles.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, size: Math.random()*2+0.5, speedX: (Math.random()-0.5)*0.5, speedY: (Math.random()-0.5)*0.5, opacity: Math.random()*0.5+0.1 });
    }

    let loaderAnimFrame;
    function animateLoaderParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.x += p.speedX; p.y += p.speedY;
            if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            ctx.fill();
        });
        loaderAnimFrame = requestAnimationFrame(animateLoaderParticles);
    }
    animateLoaderParticles();

    gsap.to(barFill, { width: '100%', duration: 2, ease: 'power2.inOut' });

    const tl = gsap.timeline();
    tl.to(letters, { opacity:1, y:0, rotateX:0, duration:0.6, stagger:0.08, ease:'back.out(1.7)', delay:0.3 })
      .to(tagline, { opacity:1, duration:0.5 }, '-=0.2')
      .to({}, { duration:0.8 })
      .to(loader, { opacity:0, duration:0.6, ease:'power2.inOut', onComplete: () => { loader.style.display='none'; cancelAnimationFrame(loaderAnimFrame); initHeroAnimations(); } });
}

// ============ CUSTOM CURSOR ============
function initCursor() {
    if (isMobile) return;
    const cursor = document.getElementById('cursor');
    const dot = cursor.querySelector('.cursor-dot');
    const ring = cursor.querySelector('.cursor-ring');
    let cursorX=0, cursorY=0, dotX=0, dotY=0, ringX=0, ringY=0;

    document.addEventListener('mousemove', (e) => { cursorX=e.clientX; cursorY=e.clientY; mouseX=e.clientX; mouseY=e.clientY; });

    function updateCursor() {
        dotX += (cursorX-dotX)*0.2; dotY += (cursorY-dotY)*0.2;
        ringX += (cursorX-ringX)*0.08; ringY += (cursorY-ringY)*0.08;
        dot.style.left = dotX+'px'; dot.style.top = dotY+'px';
        ring.style.left = ringX+'px'; ring.style.top = ringY+'px';
        requestAnimationFrame(updateCursor);
    }
    updateCursor();

    document.querySelectorAll('a, button, .equipe-member, .magnetic-btn').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
    });

    document.querySelectorAll('.magnetic-btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width/2;
            const y = e.clientY - rect.top - rect.height/2;
            btn.style.transform = `translate(${x*0.15}px, ${y*0.15}px)`;
        });
        btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
}

// ============ STARFIELD ============
function initStarfield() {
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize(); window.addEventListener('resize', resize);

    const stars = [];
    const numStars = isMobile ? 60 : 150;
    for (let i = 0; i < numStars; i++) {
        stars.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, size: Math.random()*1.2+0.3, twinkleSpeed: Math.random()*0.01+0.003, twinklePhase: Math.random()*Math.PI*2 });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const time = Date.now()*0.001;
        stars.forEach(star => {
            const alpha = 0.15 + Math.sin(time*star.twinkleSpeed*100 + star.twinklePhase)*0.15;
            ctx.beginPath(); ctx.arc(star.x, star.y, star.size, 0, Math.PI*2);
            ctx.fillStyle = `rgba(0, 51, 160, ${alpha})`;
            ctx.fill();
        });
        requestAnimationFrame(animate);
    }
    animate();
}

// ============ THREE.JS HERO — TORUS KNOT + PARTICLES ============
function supportsWebGL() {
    try {
        const c = document.createElement('canvas');
        return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
    } catch(e) { return false; }
}

function initHeroScene() {
    if (supportsWebGL()) {
        try { initHeroScene3D(); return; } catch(e) { /* fallback below */ }
    }
    initHeroCanvasFallback();
}

function initHeroScene3D() {
    const canvas = document.getElementById('hero-canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 5;

    // TORUS KNOT — Main 3D object
    const torusGeo = new THREE.TorusKnotGeometry(1.0, 0.3, 128, 32);
    const torusMat = new THREE.MeshBasicMaterial({ color:0xFFFFFF, wireframe:true, transparent:true, opacity:0.12 });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    scene.add(torus);

    // Inner glowing sphere
    const glowGeo = new THREE.IcosahedronGeometry(0.6, 4);
    const glowMat = new THREE.MeshBasicMaterial({ color:0x1A5FFF, wireframe:true, transparent:true, opacity:0.06 });
    const glowSphere = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glowSphere);

    // Outer wireframe dodecahedron
    const outerGeo = new THREE.DodecahedronGeometry(2.2, 0);
    const outerMat = new THREE.MeshBasicMaterial({ color:0xFFFFFF, wireframe:true, transparent:true, opacity:0.04 });
    const outerShape = new THREE.Mesh(outerGeo, outerMat);
    scene.add(outerShape);

    // PARTICLES — 800 orbiting particles with custom shaders
    const pCount = 800;
    const pGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(pCount*3);
    const cols = new Float32Array(pCount*3);
    const sizes = new Float32Array(pCount);

    for (let i = 0; i < pCount; i++) {
        const theta = Math.random()*Math.PI*2;
        const phi = Math.acos(Math.random()*2-1);
        const r = 1.5 + Math.random()*5;
        pos[i*3] = r*Math.sin(phi)*Math.cos(theta);
        pos[i*3+1] = r*Math.sin(phi)*Math.sin(theta);
        pos[i*3+2] = r*Math.cos(phi);
        const c = Math.random();
        if (c < 0.35) { cols[i*3]=1; cols[i*3+1]=1; cols[i*3+2]=1; }
        else if (c < 0.65) { cols[i*3]=0.1; cols[i*3+1]=0.37; cols[i*3+2]=1; }
        else if (c < 0.85) { cols[i*3]=0.4; cols[i*3+1]=0.7; cols[i*3+2]=1; }
        else { cols[i*3]=0.7; cols[i*3+1]=0.85; cols[i*3+2]=1; }
        sizes[i] = Math.random()*1.2+0.2;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    pGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const pVS = `
        attribute float size;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float uTime;
        void main() {
            vColor = color;
            vec3 p = position;
            p.x += sin(uTime*0.5 + position.y*2.0)*0.15;
            p.y += cos(uTime*0.3 + position.z*2.0)*0.15;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            float d = -mv.z;
            gl_PointSize = size * (60.0 / d);
            vAlpha = clamp(1.0 - (d - 2.0) / 10.0, 0.15, 1.0);
            gl_Position = projectionMatrix * mv;
        }`;
    const pFS = `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
            float d = length(gl_PointCoord - vec2(0.5));
            if(d > 0.5) discard;
            float core = 1.0 - smoothstep(0.0, 0.12, d);
            float glow = 1.0 - smoothstep(0.05, 0.5, d);
            float a = (core * 1.0 + glow * 0.5) * vAlpha;
            vec3 col = vColor + core * 0.4;
            gl_FragColor = vec4(col, a * 0.7);
        }`;

    const pMat = new THREE.ShaderMaterial({ vertexShader:pVS, fragmentShader:pFS, transparent:true, vertexColors:true, depthWrite:false, blending:THREE.AdditiveBlending, uniforms:{ uTime:{value:0} } });
    const pSystem = new THREE.Points(pGeo, pMat);
    scene.add(pSystem);

    // ORBIT RINGS — Multiple tilted rings
    for (let i = 0; i < 4; i++) {
        const rGeo = new THREE.TorusGeometry(1.6+i*0.5, 0.005, 8, 100);
        const rMat = new THREE.MeshBasicMaterial({ color:i%2===0?0xFFFFFF:0x1A5FFF, transparent:true, opacity:0.08-i*0.015 });
        const ring = new THREE.Mesh(rGeo, rMat);
        ring.rotation.x = Math.PI*0.3 + i*0.35;
        ring.rotation.z = i*0.4;
        scene.add(ring);
    }

    let time = 0;
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        time += delta;

        // Torus rotation
        torus.rotation.x = time*0.12;
        torus.rotation.y = time*0.18;
        torus.rotation.z = time*0.06;

        // Inner sphere counter-rotation
        glowSphere.rotation.x = -time*0.2;
        glowSphere.rotation.y = -time*0.15;

        // Outer shape slow rotation
        outerShape.rotation.x = time*0.03;
        outerShape.rotation.y = time*0.05;

        // Mouse influence
        targetMouseX = (mouseX/window.innerWidth-0.5)*2;
        targetMouseY = (mouseY/window.innerHeight-0.5)*2;
        torus.position.x += (targetMouseX*0.4-torus.position.x)*0.03;
        torus.position.y += (-targetMouseY*0.4-torus.position.y)*0.03;
        glowSphere.position.copy(torus.position);
        outerShape.position.x += (targetMouseX*0.15-outerShape.position.x)*0.02;
        outerShape.position.y += (-targetMouseY*0.15-outerShape.position.y)*0.02;

        // Particles rotation + time uniform
        pSystem.rotation.y = time*0.04;
        pSystem.rotation.x = Math.sin(time*0.08)*0.08;
        pMat.uniforms.uTime.value = time;

        // Pulse effects
        torusMat.opacity = 0.1 + Math.sin(time*1.5)*0.04;
        glowMat.opacity = 0.04 + Math.sin(time*2)*0.03;
        outerMat.opacity = 0.03 + Math.sin(time*0.8)*0.015;

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => { camera.aspect=window.innerWidth/window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth,window.innerHeight); });
}

function initHeroCanvasFallback() {
    const canvas = document.getElementById('hero-canvas');
    const ctx = canvas.getContext('2d');
    function resize() { canvas.width=window.innerWidth; canvas.height=window.innerHeight; }
    resize(); window.addEventListener('resize', resize);

    const area = canvas.width * canvas.height;
    const numParticles = Math.min(Math.floor(area / 12000), 200);

    const particles = [];
    for (let i = 0; i < numParticles; i++) {
        particles.push({ x:Math.random()*canvas.width, y:Math.random()*canvas.height, size:Math.random()*2+0.5, speedX:(Math.random()-0.5)*0.3, speedY:(Math.random()-0.5)*0.3, hue:Math.random()>0.5?220:210 });
    }

    const cx0 = canvas.width/2, cy0 = canvas.height/2;
    const rings = [
        { r: Math.min(canvas.width, canvas.height)*0.08, rot:0, speed:0.001 },
        { r: Math.min(canvas.width, canvas.height)*0.14, rot:0, speed:-0.0007 },
        { r: Math.min(canvas.width, canvas.height)*0.22, rot:0, speed:0.0005 }
    ];

    function drawWireframeTorus(cx, cy, r1, r2, segments, rot) {
        ctx.beginPath();
        for (let i = 0; i <= segments; i++) {
            const a = (i/segments)*Math.PI*2;
            const x = cx + (r1 + r2*Math.cos(a))*Math.cos(rot);
            const y = cy + (r1 + r2*Math.cos(a))*Math.sin(rot)*0.4;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const time = Date.now()*0.001;

        rings.forEach(ring => {
            ring.rot += ring.speed;
            ctx.strokeStyle = 'rgba(255,255,255,0.08)';
            ctx.lineWidth = 1;
            drawWireframeTorus(cx0, cy0, ring.r, ring.r*0.3, 60, ring.rot);
            drawWireframeTorus(cx0, cy0, ring.r, ring.r*0.3, 60, ring.rot + Math.PI/2);
        });

        particles.forEach(p => {
            p.x+=p.speedX; p.y+=p.speedY;
            if(p.x<0||p.x>canvas.width) p.speedX*=-1;
            if(p.y<0||p.y>canvas.height) p.speedY*=-1;
            const alpha=0.3+Math.sin(time+p.x*0.01)*0.2;
            ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
            ctx.fillStyle=`hsla(${p.hue},100%,70%,${alpha})`; ctx.fill();
        });

        for (let i = 0; i < particles.length; i++) {
            for (let j = i+1; j < particles.length; j++) {
                const dx = particles[i].x-particles[j].x, dy = particles[i].y-particles[j].y;
                const dist = Math.sqrt(dx*dx+dy*dy);
                if (dist < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(255,255,255,${0.06*(1-dist/100)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }
    animate();
}

// ============ HERO ANIMATIONS ============
function initHeroAnimations() {
    const tl = gsap.timeline();
    tl.to('.hero-letter', { opacity:1, y:0, rotateX:0, duration:0.8, stagger:0.1, ease:'back.out(1.7)' })
      .to('#hero-subtitle', { opacity:1, y:0, duration:0.6, ease:'power3.out' }, '-=0.3')
      .to('#hero-tagline', { opacity:1, y:0, duration:0.5, ease:'power3.out' }, '-=0.2')
      .to('#hero-cta', { opacity:1, y:0, duration:0.6, ease:'power3.out' }, '-=0.2')
      .to('#scroll-indicator', { opacity:0.6, duration:0.5 }, '-=0.1');

    gsap.to('.hero-content', { scrollTrigger:{ trigger:'#hero', start:'top top', end:'bottom top', scrub:1 }, y:-100, opacity:0 });
    gsap.to('#scroll-indicator', { scrollTrigger:{ trigger:'#hero', start:'10% top', end:'20% top', scrub:1 }, opacity:0 });
}

// ============ SMOOTH SCROLL ============
function initSmoothScroll() {
    const lenis = new Lenis({ duration:1.2, easing:(t)=>Math.min(1,1.001-Math.pow(2,-10*t)), orientation:'vertical', smoothWheel:true });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time*1000); });
    gsap.ticker.lagSmoothing(0);
}

// ============ NAVIGATION ============
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const burger = document.getElementById('nav-burger');
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
        const sections = ['hero','services','equipe','contact'];
        let current = 'hero';
        sections.forEach(id => { const s=document.getElementById(id); if(s && window.scrollY >= s.offsetTop-200) current=id; });
        navLinks.forEach(link => link.classList.toggle('active', link.dataset.section===current));
    });

    burger.addEventListener('click', () => {
        burger.classList.toggle('active'); mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => { burger.classList.remove('active'); mobileMenu.classList.remove('active'); document.body.style.overflow=''; });
    });
}

// ============ SERVICES ============
function initServicesSection() {
    // Service cards staggered reveal
    gsap.utils.toArray('.svc-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger:{ trigger:card, start:'top 88%', toggleActions:'play none none reverse' },
            opacity:0, y:50, scale:0.95, duration:0.7, delay:i*0.08, ease:'power3.out'
        });
    });

    // Showcase rows
    document.querySelectorAll('.showcase-row').forEach(row => {
        gsap.to(row, { scrollTrigger:{ trigger:row, start:'top 85%', toggleActions:'play none none reverse' }, opacity:1, y:0, duration:1, ease:'power3.out' });
    });

    // Services floating shapes canvas
    if (!isMobile) initServicesCanvas();
}

function initServicesCanvas() {
    const canvas = document.getElementById('services-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const section = canvas.parentElement;

    function resize() { canvas.width = section.offsetWidth; canvas.height = section.offsetHeight; }
    resize(); window.addEventListener('resize', resize);

    const shapes = [];
    for (let i = 0; i < 25; i++) {
        shapes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 20 + 8,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.008,
            speedY: (Math.random() - 0.5) * 0.3,
            speedX: (Math.random() - 0.5) * 0.2,
            type: Math.floor(Math.random() * 4), // 0=triangle, 1=square, 2=circle, 3=hexagon
            opacity: Math.random() * 0.06 + 0.02
        });
    }

    function drawShape(s) {
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rotation);
        ctx.strokeStyle = `rgba(0, 51, 160, ${s.opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (s.type === 0) { // Triangle
            ctx.moveTo(0, -s.size); ctx.lineTo(s.size, s.size); ctx.lineTo(-s.size, s.size); ctx.closePath();
        } else if (s.type === 1) { // Square
            ctx.rect(-s.size/2, -s.size/2, s.size, s.size);
        } else if (s.type === 2) { // Circle
            ctx.arc(0, 0, s.size/2, 0, Math.PI * 2);
        } else { // Hexagon
            for (let j = 0; j < 6; j++) {
                const a = (j / 6) * Math.PI * 2;
                j === 0 ? ctx.moveTo(Math.cos(a)*s.size/2, Math.sin(a)*s.size/2) : ctx.lineTo(Math.cos(a)*s.size/2, Math.sin(a)*s.size/2);
            }
            ctx.closePath();
        }
        ctx.stroke();
        ctx.restore();
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        shapes.forEach(s => {
            s.x += s.speedX; s.y += s.speedY; s.rotation += s.rotSpeed;
            if (s.x < -30) s.x = canvas.width + 30;
            if (s.x > canvas.width + 30) s.x = -30;
            if (s.y < -30) s.y = canvas.height + 30;
            if (s.y > canvas.height + 30) s.y = -30;
            drawShape(s);
        });
        requestAnimationFrame(animate);
    }
    animate();
}

// ============ TRUST SECTION ============
function initTrustSection() {
    const numbers = document.querySelectorAll('.trust-number');
    numbers.forEach(num => {
        const target = parseInt(num.dataset.target);
        gsap.to(num, {
            scrollTrigger:{ trigger:'.trust-section', start:'top 75%', toggleActions:'play none none reverse' },
            innerText:target, duration:2, snap:{innerText:1}, ease:'power2.out'
        });
    });

    gsap.from('.trust-image', { scrollTrigger:{ trigger:'.trust-section', start:'top 80%', toggleActions:'play none none reverse' }, opacity:0, x:-60, duration:1, ease:'power3.out' });
    gsap.from('.trust-content', { scrollTrigger:{ trigger:'.trust-section', start:'top 80%', toggleActions:'play none none reverse' }, opacity:0, x:60, duration:1, ease:'power3.out', delay:0.2 });

    // Constellation network canvas
    if (!isMobile) initTrustCanvas();
}

function initTrustCanvas() {
    const canvas = document.getElementById('trust-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const section = canvas.parentElement;

    function resize() { canvas.width = section.offsetWidth; canvas.height = section.offsetHeight; }
    resize(); window.addEventListener('resize', resize);

    const dots = [];
    for (let i = 0; i < 40; i++) {
        dots.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            size: Math.random() * 2.5 + 1
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Move dots
        dots.forEach(d => {
            d.x += d.vx; d.y += d.vy;
            if (d.x < 0 || d.x > canvas.width) d.vx *= -1;
            if (d.y < 0 || d.y > canvas.height) d.vy *= -1;
        });

        // Draw connections
        for (let i = 0; i < dots.length; i++) {
            for (let j = i + 1; j < dots.length; j++) {
                const dx = dots[i].x - dots[j].x;
                const dy = dots[i].y - dots[j].y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(dots[i].x, dots[i].y);
                    ctx.lineTo(dots[j].x, dots[j].y);
                    ctx.strokeStyle = `rgba(0, 51, 160, ${0.06 * (1 - dist/150)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        // Draw dots
        dots.forEach(d => {
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 51, 160, 0.08)';
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }
    animate();
}

// ============ EQUIPE ============
function initEquipeSection() {
    const members = document.querySelectorAll('.equipe-member');
    const detail = document.getElementById('equipe-detail');
    const detailName = document.getElementById('detail-name');
    const detailRole = document.getElementById('detail-role');
    const detailPhoto = document.getElementById('detail-photo');
    const detailPhotoWrapper = document.querySelector('.detail-photo-wrapper');
    const orbit = document.getElementById('equipe-orbit');
    let orbitAngleOffset = 0, isAnimating = true;

    function positionMembers() {
        const currentRadius = orbit.offsetWidth/2-50;
        members.forEach((member, i) => {
            const angle = (i/members.length)*Math.PI*2+orbitAngleOffset;
            member.style.left = (Math.cos(angle)*currentRadius+orbit.offsetWidth/2-32)+'px';
            member.style.top = (Math.sin(angle)*currentRadius+orbit.offsetHeight/2-32)+'px';
        });
    }

    function animateOrbit() { if(isAnimating) { orbitAngleOffset+=0.003; positionMembers(); } requestAnimationFrame(animateOrbit); }
    positionMembers(); animateOrbit();

    function showDetail(member) {
        detailName.textContent = member.dataset.name;
        detailRole.textContent = member.dataset.role;
        const photo = member.dataset.photo;
        if(photo) { detailPhoto.src=photo; detailPhoto.alt=member.dataset.name; detailPhotoWrapper.style.display=''; }
        else { detailPhoto.src=''; detailPhotoWrapper.style.display='none'; }
        detail.classList.add('visible');
    }

    members.forEach(member => {
        member.addEventListener('click', () => {
            const wasActive = member.classList.contains('active');
            members.forEach(m => m.classList.remove('active'));
            if(wasActive) { detail.classList.remove('visible'); isAnimating=true; }
            else { member.classList.add('active'); showDetail(member); isAnimating=false; }
        });
        member.addEventListener('mouseenter', () => { if(!member.classList.contains('active')) showDetail(member); });
        member.addEventListener('mouseleave', () => { if(!document.querySelector('.equipe-member.active')) detail.classList.remove('visible'); });
    });

    gsap.from('#equipe-orbit', { scrollTrigger:{ trigger:'#equipe', start:'top 60%', toggleActions:'play none none reverse' }, opacity:0, scale:0.6, rotation:-30, duration:1.2, ease:'power3.out' });

    if (!isMobile) {
        const canvas = document.getElementById('equipe-canvas');
        const ctx = canvas.getContext('2d');
        function resizeCanvas() { const w=document.querySelector('.equipe-scene-wrapper'); canvas.width=w.offsetWidth; canvas.height=w.offsetHeight; }
        resizeCanvas(); window.addEventListener('resize', resizeCanvas);
        function drawConnections() {
            ctx.clearRect(0,0,canvas.width,canvas.height);
            const cx=canvas.width/2, cy=canvas.height/2;
            members.forEach(member => {
                const rect=member.getBoundingClientRect(), wr=canvas.getBoundingClientRect();
                ctx.beginPath(); ctx.moveTo(cx,cy);
                ctx.lineTo(rect.left-wr.left+rect.width/2, rect.top-wr.top+rect.height/2);
                ctx.strokeStyle='rgba(0,51,160,0.06)'; ctx.lineWidth=1; ctx.stroke();
            });
            requestAnimationFrame(drawConnections);
        }
        drawConnections();
    }
    window.addEventListener('resize', positionMembers);
}

// ============ CTA ============
function initCTASection() {
    if(!isMobile) initCTACanvas();
    gsap.to('.cta-word', { scrollTrigger:{ trigger:'#contact', start:'top 80%', toggleActions:'play none none reverse' }, opacity:1, y:0, duration:0.6, stagger:0.1, ease:'power3.out' });
    gsap.to('.cta-subtitle', { scrollTrigger:{ trigger:'#contact', start:'top 70%', toggleActions:'play none none reverse' }, opacity:1, duration:0.6, delay:0.3 });
    gsap.to('.cta-buttons', { scrollTrigger:{ trigger:'#contact', start:'top 70%', toggleActions:'play none none reverse' }, opacity:1, y:0, duration:0.6, delay:0.5 });
    gsap.to('.cta-social', { scrollTrigger:{ trigger:'#contact', start:'top 65%', toggleActions:'play none none reverse' }, opacity:1, duration:0.6, delay:0.7 });
}

function initCTACanvas() {
    const canvas = document.getElementById('cta-canvas');
    const ctx = canvas.getContext('2d');
    function resize() { canvas.width=window.innerWidth; canvas.height=window.innerHeight; }
    resize(); window.addEventListener('resize', resize);

    const particles = [];
    for(let i=0;i<150;i++) {
        particles.push({ x:Math.random()*canvas.width, y:Math.random()*canvas.height, size:Math.random()*2.5+0.5, speed:Math.random()*1.2+0.3, wobble:Math.random()*Math.PI*2, wobbleSpeed:Math.random()*0.02+0.008, opacity:Math.random()*0.4+0.1 });
    }

    function animate() {
        ctx.clearRect(0,0,canvas.width,canvas.height);

        // Move particles up (anti-gravity)
        particles.forEach(p => {
            p.y -= p.speed; p.wobble += p.wobbleSpeed; p.x += Math.sin(p.wobble)*0.4;
            if(p.y<-10) { p.y=canvas.height+10; p.x=Math.random()*canvas.width; }
        });

        // Draw connections between nearby particles
        for (let i = 0; i < particles.length; i++) {
            for (let j = i+1; j < particles.length; j++) {
                const dx = particles[i].x-particles[j].x, dy = particles[i].y-particles[j].y;
                const dist = Math.sqrt(dx*dx+dy*dy);
                if (dist < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(255,255,255,${0.08*(1-dist/100)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        // Draw particles with glow
        particles.forEach(p => {
            ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
            ctx.fillStyle=`rgba(255,255,255,${p.opacity})`; ctx.fill();
            // Glow
            ctx.beginPath(); ctx.arc(p.x,p.y,p.size*3,0,Math.PI*2);
            ctx.fillStyle=`rgba(100,160,255,${p.opacity*0.1})`; ctx.fill();
        });

        requestAnimationFrame(animate);
    }
    animate();
}

// ============ SECTION ANIMATIONS ============
function initSectionAnimations() {
    gsap.utils.toArray('.section-label').forEach(el => { gsap.from(el, { scrollTrigger:{ trigger:el, start:'top 85%', toggleActions:'play none none reverse' }, opacity:0, x:-30, duration:0.6, ease:'power3.out' }); });
    gsap.utils.toArray('.section-title').forEach(el => { gsap.from(el, { scrollTrigger:{ trigger:el, start:'top 85%', toggleActions:'play none none reverse' }, opacity:0, y:40, duration:0.8, ease:'power3.out', delay:0.1 }); });
    gsap.utils.toArray('.section-desc').forEach(el => { gsap.from(el, { scrollTrigger:{ trigger:el, start:'top 85%', toggleActions:'play none none reverse' }, opacity:0, y:20, duration:0.6, ease:'power3.out', delay:0.2 }); });
}

// ============ SMOOTH LINKS ============
function initSmoothLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if(target) gsap.to(window, { duration:1.2, scrollTo:{y:target, offsetY:0}, ease:'power3.inOut' });
        });
    });
}

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    initLoader();
    initCursor();
    initStarfield();
    initHeroScene();
    initNavigation();
    initSmoothScroll();

    setTimeout(() => {
        initSectionAnimations();
        initServicesSection();
        initTrustSection();
        initEquipeSection();
        initCTASection();
        initSmoothLinks();
        ScrollTrigger.refresh();
    }, 2500);
});

let resizeTimer;
window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer=setTimeout(()=>ScrollTrigger.refresh(),250); });

/* =========================================================
   ALEGRA LABS — main.js
   Custom cursor · Hero canvas · Scroll animations ·
   Counter · Testimonial carousel · Nav · Mobile menu
   ========================================================= */

'use strict';

/* ── 1. CUSTOM CURSOR ──────────────────────────────────── */
(function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mx = -100, my = -100;
  let rx = -100, ry = -100;

  // Ring follows with slight lag
  let cursorAnimating = false;
  function lerp() {
    const dx = mx - rx;
    const dy = my - ry;
    if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
      cursorAnimating = false;
      return; // Stop the loop when idle to save CPU/GPU cycles
    }
    rx += dx * 0.15;
    ry += dy * 0.15;
    ring.style.transform = `translate3d(calc(${rx}px - 50%), calc(${ry}px - 50%), 0)`;
    requestAnimationFrame(lerp);
  }
  
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate3d(calc(${mx}px - 50%), calc(${my}px - 50%), 0)`;
    if (!cursorAnimating) {
      cursorAnimating = true;
      requestAnimationFrame(lerp);
    }
  });

  // Hover state on interactive elements
  const hoverEls = document.querySelectorAll('a, button, .work-card, .service-item, .testimonial-card');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // Magnetic effect for buttons
  const magneticEls = document.querySelectorAll('.nav-link, .btn-primary, .btn-ghost, .btn-outline');
  magneticEls.forEach(el => {
    el.addEventListener('mousemove', e => {
      if (typeof gsap === 'undefined') return;
      const rect = el.getBoundingClientRect();
      const h = rect.width / 2;
      const x = e.clientX - rect.left - h;
      const y = e.clientY - rect.top - (rect.height / 2);
      gsap.to(el, { x: x * 0.35, y: y * 0.35, duration: 0.4, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', () => {
      if (typeof gsap === 'undefined') return;
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
    });
  });
})();

/* ── 2. WEBGL FLUID CANVAS ────────────────────────────── */
(function initFluidCanvas() {
  const canvas = document.getElementById('fluid-canvas');
  if (!canvas || typeof WebGLFluid === 'undefined') return;

  WebGLFluid(canvas, {
    TRIGGER: 'hover',
    IMMEDIATE: true,
    AUTO: false,
    SIM_RESOLUTION: 128,
    DYE_RESOLUTION: 1024,
    DENSITY_DISSIPATION: 1.5,
    VELOCITY_DISSIPATION: 1.0,
    PRESSURE: 0.8,
    PRESSURE_ITERATIONS: 20,
    CURL: 20,
    SPLAT_RADIUS: 0.25,
    SPLAT_FORCE: 6000,
    SHADING: true,
    COLORFUL: true,
    BACK_COLOR: { r: 255, g: 255, b: 255 },
    TRANSPARENT: true,
    BLOOM: false
  });

  // Forward all mouse movements to the canvas so it works even when hovering over text/buttons
  window.addEventListener('mousemove', (e) => {
    if (e.target !== canvas) {
      canvas.dispatchEvent(new MouseEvent('mousemove', {
        clientX: e.clientX,
        clientY: e.clientY
      }));
    }
  });
})();


/* ── 3. STICKY NAV + PROGRESS ─────────────────────────── */
(function initNav() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
})();


/* ── 4. MOBILE MENU ────────────────────────────────────── */
(function initMobileMenu() {
  const toggle  = document.getElementById('menu-toggle');
  const menu    = document.getElementById('mobile-menu');
  const links   = menu ? menu.querySelectorAll('.mobile-nav-link') : [];
  if (!toggle || !menu) return;

  function openMenu() {
    menu.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    animateHamburger(true);
  }

  function closeMenu() {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    animateHamburger(false);
  }

  function animateHamburger(open) {
    const spans = toggle.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    }
  }

  toggle.addEventListener('click', () => {
    menu.classList.contains('open') ? closeMenu() : openMenu();
  });

  links.forEach(link => link.addEventListener('click', closeMenu));

  // Close on outside click
  menu.addEventListener('click', e => { if (e.target === menu) closeMenu(); });
})();


/* ── 6. NUMBER COUNTER ANIMATION ──────────────────────── */
(function initCounters() {
  const statNums = document.querySelectorAll('.stat-num[data-target]');
  if (!statNums.length) return;

  function formatNumber(n, separator, suffix) {
    let str = Math.round(n).toString();
    if (separator) {
      str = str.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    }
    return str + (suffix || '');
  }

  function animateCounter(el) {
    const target   = parseFloat(el.dataset.target);
    const suffix   = el.dataset.suffix    || '';
    const sep      = el.dataset.separator || '';
    const duration = 2000;
    const start    = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      // Ease out expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      el.textContent = formatNumber(eased * target, sep, suffix);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Also animate the stat bars
  function animateBars(section) {
    section.querySelectorAll('.stat-bar-fill').forEach(fill => {
      const target = fill.style.width;
      fill.style.setProperty('--bar-target', target);
      // Trigger
      fill.style.width = target;
    });
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  const statsIo = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateBars(entry.target);
        statsIo.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  statNums.forEach(el => io.observe(el));

  const statsSection = document.getElementById('stats');
  if (statsSection) statsIo.observe(statsSection);
})();


/* ── 7. TESTIMONIALS CAROUSEL ──────────────────────────── */
(function initTestimonials() {
  const track  = document.getElementById('testimonials-track');
  const dotsEl = document.getElementById('t-dots');
  const prevBtn = document.getElementById('t-prev');
  const nextBtn = document.getElementById('t-next');
  if (!track) return;

  const cards = track.querySelectorAll('.testimonial-card');
  let current = 0;
  let perSlide = 3;
  const total  = cards.length;

  function getPerSlide() {
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }

  function buildDots() {
    dotsEl.innerHTML = '';
    const pages = Math.ceil(total / perSlide);
    for (let i = 0; i < pages; i++) {
      const dot = document.createElement('button');
      dot.className = 't-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Testimonial page ${i + 1}`);
      dot.setAttribute('role', 'tab');
      dot.addEventListener('click', () => goTo(i * perSlide));
      dotsEl.appendChild(dot);
    }
  }

  function updateDots() {
    const page = Math.floor(current / perSlide);
    dotsEl.querySelectorAll('.t-dot').forEach((d, i) => d.classList.toggle('active', i === page));
  }

  function goTo(idx) {
    perSlide = getPerSlide();
    const cardW  = cards[0].offsetWidth;
    const gap    = 24; // 1.5rem
    const maxIdx = Math.max(0, total - perSlide);
    current = Math.max(0, Math.min(idx, maxIdx));
    track.style.transform = `translateX(-${current * (cardW + gap)}px)`;
    updateDots();
  }

  function next() { goTo(current + perSlide); }
  function prev() { goTo(current - perSlide); }

  prevBtn && prevBtn.addEventListener('click', prev);
  nextBtn && nextBtn.addEventListener('click', next);

  // Touch / swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
  });

  // Auto-play
  let autoPlay = setInterval(next, 5000);
  [prevBtn, nextBtn].forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', () => { clearInterval(autoPlay); autoPlay = setInterval(next, 5000); });
  });

  window.addEventListener('resize', () => {
    perSlide = getPerSlide();
    buildDots();
    goTo(0);
  });

  perSlide = getPerSlide();
  buildDots();
  goTo(0);
})();


/* ── 8. SMOOTH SCROLL FOR NAV LINKS ───────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

/* ── 8.5 LENIS SMOOTH SCROLLING ────────────────────────── */
(function initLenis() {
  if (typeof Lenis === 'undefined') return;
  const lenis = new Lenis({
    lerp: 0.08, // Adjust for smoothness vs responsiveness
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2
  });

  // Drive Lenis with native browser requestAnimationFrame for maximum smoothness
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    // Sync ScrollTrigger to Lenis's native scroll events
    lenis.on('scroll', ScrollTrigger.update);
    // Prevent GSAP's internal ticker from conflicting with Lenis
    gsap.ticker.lagSmoothing(0);
  }
})();

/* ── 9. GSAP ANIMATIONS & SECTION TRANSITIONS ──────────── */
(function initGSAP() {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  // 0. Kinetic Typography Reveal
  const heroLines = document.querySelectorAll('.hero-line');
  heroLines.forEach(line => {
    const text = line.getAttribute('data-text') || line.textContent || '';
    line.innerHTML = '';
    text.split('').forEach(char => {
      const charSpan = document.createElement('span');
      charSpan.className = 'char';
      charSpan.style.display = 'inline-block';
      charSpan.textContent = char === ' ' ? '\u00A0' : char;
      line.appendChild(charSpan);
    });
  });

  gsap.fromTo('.hero-line .char', 
    {
      y: '100%',
      opacity: 0,
      rotateZ: 8
    },
    {
      y: '0%',
      opacity: 1,
      rotateZ: 0,
      duration: 0.8,
      stagger: 0.02,
      ease: 'power3.out',
      delay: 0.2
    }
  );

  // 1. Hero Dropping Transition
  gsap.to('.hero-content', {
    scrollTrigger: {
      trigger: '#work',
      start: 'top bottom', // Start dropping as soon as Work enters screen
      end: 'top 30%', // Finish dropping and fading before it overlaps the cards
      scrub: true
    },
    y: '25vh', // Drop down slightly
    scale: 0.9,
    opacity: 0,
    ease: 'power2.inOut'
  });

  gsap.to('.hero-tags, .hero-scroll-hint', {
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: '40% top',
      scrub: true
    },
    opacity: 0
  });



  // 2. Element Reveals (replacing old IntersectionObserver)
  const reveals = gsap.utils.toArray('.reveal');
  reveals.forEach(el => {
    gsap.fromTo(el, 
      { y: 50, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%'
        }
      }
    );
  });


  // 4. Parallax Image Masking (Work Section)
  const workImages = gsap.utils.toArray('.work-parallax-img');
  workImages.forEach(img => {
    gsap.fromTo(img, 
      { yPercent: -10 },
      {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: {
          trigger: img.closest('.work-card__visual'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      }
    );
  });
})();

/* ── 10. PHOTOREALISTIC SPRITE-BASED DUST BURST ── */
(function initCanvasTransition() {
  const canvas = document.getElementById('transition-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const PARTICLE_COUNT = 150; // Reduced count because sprites are larger/more detailed
  const SMOKE_COUNT = 30; 
  let globalGravity = 0;
  let isActive = true;

  let mouseX = -1000;
  let mouseY = -1000;

  // Track mouse coordinates for avoidance
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY + window.scrollY;
  });

  let viewportHeight;
  let tintedSprite = null;

  // 1. Load and Process the Photorealistic Sprite
  const spriteImage = new Image();
  spriteImage.src = 'powder-sprite.png';
  spriteImage.onload = () => {
    // Create an offscreen canvas to process the image data
    const offCanvas = document.createElement('canvas');
    offCanvas.width = spriteImage.width;
    offCanvas.height = spriteImage.height;
    const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
    
    // Draw the generated black/white image
    offCtx.drawImage(spriteImage, 0, 0);
    
    // Extract pixels to manipulate alpha channel
    const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
    const data = imgData.data;
    
    // Brand Blue: RGB(36, 138, 204)
    for (let i = 0; i < data.length; i += 4) {
      // The image is white powder on a black background.
      // We map the brightness (R channel) directly to the Alpha transparency!
      const brightness = data[i]; 
      
      data[i] = 36;     // R
      data[i+1] = 138;  // G
      data[i+2] = 204;  // B
      data[i+3] = brightness; // A (Black becomes fully transparent, white becomes fully opaque)
    }
    
    offCtx.putImageData(imgData, 0, 0);
    tintedSprite = offCanvas; // Save the processed sprite
    
    // Start the physics engine now that the sprite is ready
    window.addEventListener('resize', resize);
    resize();
    animate();
  };

  function resize() {
    width = window.innerWidth;
    viewportHeight = window.innerHeight;
    height = viewportHeight * 2; // Canvas spans Hero (100vh) + Work (100vh)
    canvas.width = width;
    canvas.height = height;
    initParticles();
  }

  function initParticles() {
    particles = [];
    
    // Create Dust Particles (Drop down on scroll)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        type: 'dust',
        x: -Math.random() * 200, 
        y: viewportHeight * 0.2 + Math.random() * (viewportHeight * 0.6),
        vx: Math.random() * 25 + 5, 
        vy: (Math.random() - 0.5) * 6,
        size: Math.random() * 4 + 1, // Tiny fine grains of powder
        opacity: Math.random() * 0.8 + 0.2,
        rotation: 0,
        rotationSpeed: 0,
        baseVx: (Math.random() - 0.5) * 1.5, 
        baseVy: (Math.random() - 0.5) * 1.5
      });
    }

    // Create Ambient Smoke (Floats in hero, avoids mouse)
    // We use the photorealistic sprites for these to form the massive cloud volume
    for (let i = 0; i < SMOKE_COUNT; i++) {
      particles.push({
        type: 'smoke',
        x: -Math.random() * 500, 
        y: viewportHeight * 0.1 + Math.random() * (viewportHeight * 0.5), // Spawn strictly in upper half of Hero
        vx: Math.random() * 10 + 2, 
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 250 + 150, // Massive clouds for volumetric smoke
        opacity: Math.random() * 0.15 + 0.05, // Very soft and transparent
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.005, // Slow rotation
        baseVx: (Math.random() - 0.5) * 0.5 + 0.2, 
        baseVy: (Math.random() - 0.5) * 0.5
      });
    }
  }

  let scrollProgress = 0;

  function animate() {
    if (!isActive) {
      requestAnimationFrame(animate);
      return;
    }
    
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      // 1. Mouse Interaction
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const interactionRadius = p.type === 'smoke' ? 350 : 150;
      
      let mouseOpacityMask = 1;

      if (dist < interactionRadius) {
        if (p.type === 'smoke') {
          // Smoke naturally fades out when the cursor gets close
          // Use an ease curve so it fades smoothly
          mouseOpacityMask = Math.pow(dist / interactionRadius, 2);
        } else {
          // Dust gets subtly pushed by the cursor
          const force = (interactionRadius - dist) / interactionRadius;
          p.vx += (dx / dist) * force * 1.5;
          p.vy += (dy / dist) * force * 1.5;
        }
      }

      // 2. Autonomous Float Physics
      p.vx += (p.baseVx - p.vx) * 0.025;
      p.vy += (p.baseVy - p.vy) * 0.025;

      // Gravity affects dust heavily, but smoke resists it completely (stays in hero forever)
      const appliedGravity = p.type === 'dust' ? globalGravity : 0;

      // Update position and rotation
      p.x += p.vx;
      p.y += p.vy + appliedGravity;
      p.rotation += p.rotationSpeed;

      // Wrap around horizontally
      if (p.x > width + 200) p.x = -200;
      if (p.x < -200) p.x = width + 200;

      // Restrict smoke from drifting into the bottom of the hero section/work section
      if (p.type === 'smoke') {
        const bottomLimit = viewportHeight * 0.7; // Keep safe distance from Work section
        if (p.y > bottomLimit) {
          p.y = bottomLimit;
          p.vy *= -1; // Bounce back up
          p.baseVy = -Math.abs(p.baseVy); // Force drift upwards
        }
        if (p.y < 0) {
          p.y = 0;
          p.vy *= -1;
          p.baseVy = Math.abs(p.baseVy);
        }
      }

      // Calculate dynamic opacity
      let drawOpacity = p.opacity;
      if (p.type === 'dust') {
        // Dust fades out to 0 as it drops deeper into the Work section
        drawOpacity = p.opacity * Math.max(0, 1 - Math.pow(scrollProgress, 2));
      }
      
      // Apply the mouse proximity fade-out mask
      drawOpacity *= mouseOpacityMask;

      // 3. Render
      if (p.type === 'smoke' && tintedSprite && drawOpacity > 0.01) {
        // Draw the massive photorealistic smoke clouds
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        
        ctx.globalAlpha = drawOpacity;
        ctx.drawImage(tintedSprite, -p.size/2, -p.size/2, p.size, p.size);
        
        ctx.restore();
      } else if (p.type === 'dust' && drawOpacity > 0.01) {
        // Draw the fine grains of powder as glowing dots
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        grad.addColorStop(0, `rgba(36, 138, 204, ${drawOpacity})`);
        grad.addColorStop(1, `rgba(36, 138, 204, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Optional: faint trailing line for the fast-falling dust
        ctx.beginPath();
        ctx.moveTo(p.x - p.vx * 2, p.y - p.vy * 2 - appliedGravity * 2);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = `rgba(36, 138, 204, ${drawOpacity * 0.3})`;
        ctx.lineWidth = p.size * 0.5;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    });

    requestAnimationFrame(animate);
  }

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    const workSection = document.getElementById('work');
    if (workSection) {
      ScrollTrigger.create({
        trigger: workSection,
        start: 'top bottom',
        end: 'center center',
        scrub: true,
        onUpdate: (self) => {
          scrollProgress = self.progress;
          globalGravity = Math.pow(self.progress, 2) * 35;
        }
      });
    }
  }
})();

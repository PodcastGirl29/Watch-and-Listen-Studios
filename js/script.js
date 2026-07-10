(function(){
    const el = document.getElementById('about-eq-line');
    if(!el) return;
    for(let i=0;i<60;i++){
      const span = document.createElement('span');
      const h = 15 + Math.round(Math.abs(Math.sin(i * 0.4)) * 70 + Math.random()*15);
      span.style.height = Math.min(h,100) + '%';
      span.style.animationDelay = (i * 0.03) + 's';
      el.appendChild(span);
    }
  })();

  (function(){
    function seededRandom(seed){ let s = seed; return function(){ s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
    document.querySelectorAll('.fingerprint').forEach(el=>{
      const seed = parseInt(el.dataset.seed || '1', 10);
      const rand = seededRandom(seed * 97);
      for(let i=0;i<22;i++){
        const h = 20 + Math.floor(rand() * 80);
        const span = document.createElement('span');
        span.style.height = h + '%';
        el.appendChild(span);
      }
    });
  })();

  document.querySelectorAll('.acc-head').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const item = btn.closest('.acc-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.acc-item.open').forEach(i=>{
        i.classList.remove('open');
        i.querySelector('.acc-head').setAttribute('aria-expanded','false');
        const b = i.querySelector('.acc-body');
        if(b) b.style.maxHeight = null;
      });
      if(!isOpen){
        item.classList.add('open');
        btn.setAttribute('aria-expanded','true');
        const body = item.querySelector('.acc-body');
        if(body) body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });
  // Keep the initially-open accordion item correctly sized on load
  (function(){
    const openItem = document.querySelector('.acc-item.open .acc-body');
    if(openItem) openItem.style.maxHeight = openItem.scrollHeight + 'px';
  })();

  // Reactive hero waveform glow: mouse and scroll responsive canvas overlay
  (function(){
    const canvas = document.getElementById("waveform");
    const hero = document.getElementById("hero");
    if(!canvas || !hero) return;
    const ctx = canvas.getContext("2d");

    let width, height, dpr;
    let mouseX = 0.24;
    let mouseY = 0.48;
    let scrollPower = 0;
    let t = 0;
    let rafId;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = hero.clientWidth;
      height = hero.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function pointerMove(e) {
      const r = hero.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      mouseX = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      mouseY = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
    }

    function updateScroll() {
      const r = hero.getBoundingClientRect();
      const centre = r.top + r.height / 2;
      const viewportCentre = window.innerHeight / 2;
      scrollPower = Math.max(0, 1 - Math.abs(centre - viewportCentre) / window.innerHeight);
    }

    function draw() {
      if (!width || !height || !Number.isFinite(width) || !Number.isFinite(height)) {
        rafId = requestAnimationFrame(draw);
        return;
      }
      t += 0.018;
      ctx.clearRect(0, 0, width, height);

      const baseline = height * 0.73;
      const startX = width * 0.054;
      const endX = width * 0.429;
      const bars = 190;
      const gap = (endX - startX) / bars;

      const pulse = 0.52 + Math.sin(t * 1.7) * 0.08;
      const cursorBoost = 0.35 + mouseX * 0.75;
      const scrollBoost = 0.75 + scrollPower * 0.55;

      const grad = ctx.createLinearGradient(startX, 0, endX, 0);
      grad.addColorStop(0, "rgba(197,129,48,0.02)");
      grad.addColorStop(0.45, "rgba(236,166,76,0.32)");
      grad.addColorStop(0.72, "rgba(255,197,102,0.56)");
      grad.addColorStop(1, "rgba(197,129,48,0.08)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(startX, baseline);
      ctx.lineTo(endX, baseline);
      ctx.stroke();

      for (let i = 0; i < bars; i++) {
        const x = startX + i * gap;
        const n1 = Math.sin(i * 0.19 + t * 2.1);
        const n2 = Math.sin(i * 0.047 - t * 1.2);
        const n3 = Math.sin(i * 0.31 + t * 0.6);

        const centreBias = Math.exp(-Math.pow((i / bars - 0.66) * 2.25, 2));
        const cursorBias = Math.exp(-Math.pow((i / bars - mouseX) * 4.2, 2));
        const organic = Math.abs(n1 * 0.55 + n2 * 0.35 + n3 * 0.2);

        const amp = (18 + 155 * organic * (0.28 + centreBias + cursorBias * 0.55))
          * pulse * cursorBoost * scrollBoost * (1.08 - mouseY * 0.35);

        const alpha = 0.12 + Math.min(0.55, amp / 280);
        const barGrad = ctx.createLinearGradient(x, baseline - amp, x, baseline + amp);
        barGrad.addColorStop(0, `rgba(255,184,82,${alpha * 0.28})`);
        barGrad.addColorStop(0.5, `rgba(255,218,141,${alpha})`);
        barGrad.addColorStop(1, `rgba(194,111,32,${alpha * 0.22})`);

        ctx.strokeStyle = barGrad;
        ctx.lineWidth = Math.max(1, gap * 0.28);
        ctx.beginPath();
        ctx.moveTo(x, baseline - amp * 0.5);
        ctx.lineTo(x, baseline + amp * 0.5);
        ctx.stroke();
      }

      rafId = requestAnimationFrame(draw);
    }

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    resize();
    updateScroll();

    if (prefersReducedMotion) {
      draw();
      cancelAnimationFrame(rafId);
    } else {
      draw();
    }

    window.addEventListener("resize", resize);
    window.addEventListener("scroll", updateScroll, { passive: true });
    hero.addEventListener("pointermove", pointerMove, { passive: true });
  })();

document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());

const burger = document.getElementById('burger');
const drawer = document.getElementById('drawer');
if (burger && drawer) {
  burger.addEventListener('click', () => {
    drawer.classList.toggle('open');
    burger.textContent = drawer.classList.contains('open') ? '✕' : '☰';
  });
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    drawer.classList.remove('open');
    burger.textContent = '☰';
  }));
}

// Scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Live Discord stats (home page)
async function fetchDiscordStats() {
  const m = document.getElementById('member-count');
  const o = document.getElementById('online-count');
  if (!m || !o) return;
  try {
    const res = await fetch('https://discord.com/api/v9/invites/jNrBh8EbQ?with_counts=true');
    if (!res.ok) throw new Error();
    const data = await res.json();
    if (typeof data.approximate_member_count === 'number') m.textContent = data.approximate_member_count.toLocaleString();
    if (typeof data.approximate_presence_count === 'number') o.textContent = data.approximate_presence_count.toLocaleString();
  } catch {
    m.textContent = '261+';
    o.textContent = '—';
  }
}
fetchDiscordStats();
setInterval(fetchDiscordStats, 5 * 60 * 1000);

// Background
(function () {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles = [], orbs = [], bolts = [];
  function resize() { w = canvas.width = innerWidth; h = canvas.height = innerHeight; }
  addEventListener('resize', resize); resize();

  class P {
    constructor(layer) { this.layer = layer; this.reset(true); }
    reset(init) {
      this.x = Math.random() * w;
      this.y = init ? Math.random() * h : h + 5;
      const s = this.layer === 0 ? 0.4 : this.layer === 1 ? 0.7 : 1;
      this.size = (Math.random() * 1.6 + 0.3) * s;
      this.vy = -(Math.random() * 0.22 + 0.05) * s;
      this.vx = (Math.random() - 0.5) * 0.12 * s;
      this.a = (Math.random() * 0.3 + 0.06) * (this.layer === 2 ? 1 : 0.55);
      this.t = Math.random() * Math.PI * 2;
    }
    update() {
      this.x += this.vx; this.y += this.vy; this.t += 0.02;
      if (this.y < -10 || this.x < -20 || this.x > w + 20) this.reset(false);
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(192,132,252,${this.a * (0.7 + 0.3 * Math.sin(this.t))})`;
      ctx.fill();
    }
  }
  class Orb {
    constructor() {
      this.x = Math.random() * w; this.y = Math.random() * h;
      this.r = Math.random() * 160 + 100;
      this.vx = (Math.random() - 0.5) * 0.1; this.vy = (Math.random() - 0.5) * 0.07;
      this.a = Math.random() * 0.055 + 0.025; this.ph = Math.random() * Math.PI * 2;
    }
    update() {
      this.x += this.vx; this.y += this.vy; this.ph += 0.004;
      if (this.x < -this.r) this.x = w + this.r;
      if (this.x > w + this.r) this.x = -this.r;
      if (this.y < -this.r) this.y = h + this.r;
      if (this.y > h + this.r) this.y = -this.r;
    }
    draw() {
      const a = this.a * (0.85 + 0.15 * Math.sin(this.ph));
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
      g.addColorStop(0, `rgba(168,85,247,${a})`);
      g.addColorStop(0.5, `rgba(126,34,206,${a * 0.35})`);
      g.addColorStop(1, 'rgba(5,2,8,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2); ctx.fill();
    }
  }
  function createBolt() {
    if (Math.random() > 0.012) return;
    const segs = []; let x = Math.random() * w, y = 0;
    segs.push({ x, y });
    while (y < h * 0.5) { x += (Math.random() - 0.5) * 70; y += Math.random() * 35 + 18; segs.push({ x, y }); }
    bolts.push({ segs, life: 1 });
  }
  function drawBolts() {
    bolts = bolts.filter(b => b.life > 0);
    bolts.forEach(b => {
      ctx.beginPath();
      ctx.moveTo(b.segs[0].x, b.segs[0].y);
      for (let i = 1; i < b.segs.length; i++) ctx.lineTo(b.segs[i].x, b.segs[i].y);
      ctx.strokeStyle = `rgba(216,180,254,${0.5 * b.life})`;
      ctx.lineWidth = 1.5; ctx.shadowColor = '#a855f7'; ctx.shadowBlur = 14;
      ctx.stroke(); ctx.shadowBlur = 0;
      b.life -= 0.035;
    });
  }
  for (let i = 0; i < 40; i++) particles.push(new P(0));
  for (let i = 0; i < 45; i++) particles.push(new P(1));
  for (let i = 0; i < 25; i++) particles.push(new P(2));
  for (let i = 0; i < 6; i++) orbs.push(new Orb());

  function loop() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { ctx.clearRect(0, 0, w, h); return; }
    requestAnimationFrame(loop);
    ctx.clearRect(0, 0, w, h);
    const amb = ctx.createRadialGradient(w * 0.5, h * 0.2, 0, w * 0.5, h * 0.2, w * 0.7);
    amb.addColorStop(0, 'rgba(126,34,206,0.18)');
    amb.addColorStop(0.4, 'rgba(88,28,135,0.08)');
    amb.addColorStop(1, 'rgba(5,2,8,0)');
    ctx.fillStyle = amb; ctx.fillRect(0, 0, w, h);
    orbs.forEach(o => { o.update(); o.draw(); });
    particles.forEach(p => { p.update(); p.draw(); });
    createBolt(); drawBolts();
  }
  requestAnimationFrame(loop);
})();

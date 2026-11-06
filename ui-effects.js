/**
 * OTF — onythefamily | Ambient Weather Effects & Entry Sequence
 */

(() => {
  'use strict';

  // 1. Entry Sequence
  function setupEntrySequence() {
    const hasSeenIntro = sessionStorage.getItem('otf_seen_intro');
    let entrySeq = document.getElementById('entrySequence');
    
    if (!entrySeq) {
      entrySeq = document.createElement('div');
      entrySeq.className = 'entry-sequence';
      entrySeq.id = 'entrySequence';
      entrySeq.innerHTML = `
        <div class="entry-content">
          <div class="entry-badge"><img src="otf-logo.png" alt="OTF" style="width: 78%; height: 78%; object-fit: contain;"></div>
          <div class="entry-brand">onythefamily</div>
          <div class="entry-sub">LOYALTY OVER ROYALTY</div>
          <div class="entry-line"></div>
        </div>
      `;
      document.body.appendChild(entrySeq);
    }

    const dismissTime = hasSeenIntro ? 500 : 1300;
    setTimeout(() => {
      entrySeq.classList.add('fade-out');
      sessionStorage.setItem('otf_seen_intro', '1');
      setTimeout(() => {
        entrySeq.remove();
      }, 600);
    }, dismissTime);

    entrySeq.addEventListener('click', () => {
      entrySeq.classList.add('fade-out');
      sessionStorage.setItem('otf_seen_intro', '1');
      setTimeout(() => entrySeq.remove(), 600);
    });
  }

  // 2. Weather Canvas Particles (Gold Embers, Snow, Ash)
  function setupWeatherCanvas() {
    let canvas = document.getElementById('weatherCanvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'weatherCanvas';
      document.body.prepend(canvas);
    }

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const settings = window.OTF_DATA ? window.OTF_DATA.getSettings() : {};
    const effect = settings.weatherEffect || "embers";

    if (effect === "off") return;

    const particleCount = effect === "snow" ? 75 : 55;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.6,
        speedX: (Math.random() - 0.5) * 0.8,
        speedY: effect === "embers" ? -(Math.random() * 1.2 + 0.3) : (Math.random() * 1.5 + 0.5),
        opacity: Math.random() * 0.7 + 0.2,
        pulse: Math.random() * 0.03 + 0.01
      });
    }

    function render() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity += Math.sin(Date.now() * 0.002 + i) * 0.005;

        // Boundaries wrap
        if (effect === "embers") {
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
        } else {
          if (p.y > height + 10) {
            p.y = -10;
            p.x = Math.random() * width;
          }
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

        if (effect === "embers") {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.15, Math.min(0.85, p.opacity))})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = "rgba(255, 255, 255, 0.45)";
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(0.7, p.opacity))})`;
          ctx.shadowBlur = 0;
        }

        ctx.fill();
      }

      requestAnimationFrame(render);
    }

    render();
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupEntrySequence();
    setupWeatherCanvas();
  });
})();


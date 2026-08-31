import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ThreeScene from '@/components/features/ThreeScene';

// Load Three.js from CDN
const threeScript = document.createElement('script');
threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
document.head.appendChild(threeScript);

export default function Index() {
  const navigate = useNavigate();
  const [threeLoaded, setThreeLoaded] = useState(!!window.THREE);
  const [visible, setVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [counts, setCounts] = useState({ m: 0, c: 0, r: 0, s: 0 });

  useEffect(() => {
    const check = setInterval(() => {
      if (window.THREE) { setThreeLoaded(true); clearInterval(check); }
    }, 100);
    return () => clearInterval(check);
  }, []);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  useEffect(() => {
    if (!statsRef.current) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        animCounter(setCounts, 'modules', 28, 1200);
        animCounter(setCounts, 'codes', 3, 800);
        animCounter(setCounts, 'report', 21, 1000);
        animCounter(setCounts, 'secs', 30, 1100);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  function animCounter(setter: React.Dispatch<React.SetStateAction<{ m: number; c: number; r: number; s: number }>>, key: string, end: number, dur: number) {
    const start = Date.now();
    const keyMap: Record<string, keyof typeof counts> = { modules: 'm', codes: 'c', report: 'r', secs: 's' };
    const k = keyMap[key];
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / dur, 1);
      const val = Math.round(end * progress);
      setter(prev => ({ ...prev, [k]: val }));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Three.js canvas */}
      {threeLoaded && <ThreeScene />}

      {/* Hero overlay */}
      <div className="landing-hero-overlay" style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }} />

      {/* HERO SECTION */}
      <section style={{ minHeight: '100vh', position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px 60px' }}>
        <div style={{ maxWidth: 680, width: '100%', textAlign: 'center' }}>

          {/* Eyebrow */}
          <div style={{
            opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.7s ease 0.2s', marginBottom: 18,
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#0969DA', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              ★ LTTS Engineering Intelligence Hackathon 2026
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s ease 0.4s',
            fontSize: 'clamp(38px, 7vw, 64px)', fontWeight: 800, color: '#1F2328',
            lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 16,
          }}>
            Struct<span className="gradient-text">AI</span> Base<span style={{ color: '#0969DA' }}>Plate</span>
          </h1>

          {/* Sub-headline */}
          <p style={{
            opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.7s ease 0.6s',
            fontSize: 'clamp(15px, 2.5vw, 20px)', color: '#656D76', lineHeight: 1.65, marginBottom: 28,
          }}>
            Premium AI Copilot for Structural Steel Base Plate Design.<br />
            Real-time validation · Step-by-step calculations · Code-compliant.
          </p>

          {/* Code pills */}
          <div style={{
            opacity: visible ? 1 : 0, transform: visible ? 'scale(1)' : 'scale(0.9)',
            transition: 'all 0.6s ease 0.8s',
            display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 32,
          }}>
            {['AISC 360-22', 'IS 800:2007', 'ACI 318-19', 'ASCE 7-22', 'IS 456:2000'].map(code => (
              <span key={code} className="code-pill">📖 {code}</span>
            ))}
          </div>

          {/* CTA buttons */}
          <div style={{
            opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(15px)',
            transition: 'all 0.6s ease 1.0s',
            display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 28,
          }}>
            <button
              onClick={() => navigate('/design')}
              className="btn-eng-primary"
              style={{ padding: '14px 36px', fontSize: 16, borderRadius: 10, boxShadow: '0 8px 24px rgba(9,105,218,0.3)' }}>
              Start New Design →
            </button>
            <a href="#features" style={{ textDecoration: 'none' }}>
              <button className="btn-eng-secondary" style={{ padding: '14px 24px', fontSize: 15, borderRadius: 10 }}>
                Learn More ↓
              </button>
            </a>
          </div>

          {/* Version badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <span className="status-badge badge-pass">v4.0 FINAL</span>
            <span style={{ fontSize: 12, color: '#8C959F' }}>RC-1 through RC-15 — All reviewer comments integrated</span>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="bounce-scroll" style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', color: '#8C959F', textAlign: 'center', fontSize: 12 }}>
          <div style={{ marginBottom: 4 }}>↓ Scroll to explore</div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section ref={statsRef} style={{ padding: '56px 24px', background: 'rgba(255,255,255,0.96)', borderTop: '1px solid #EAEEF2', borderBottom: '1px solid #EAEEF2', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { val: counts.m,  suffix: '',  label: 'Python Modules' },
              { val: counts.c,  suffix: '',  label: 'Design Codes' },
              { val: counts.r,  suffix: '',  label: 'Report Sections' },
              { val: counts.s,  suffix: 's', label: 'Design Time' },
            ].map((stat, i) => (
              <div key={i}>
                <div style={{ fontSize: 40, fontWeight: 800, color: '#0969DA', lineHeight: 1 }}>
                  {stat.val}{stat.suffix === 's' ? 's' : ''}
                </div>
                <div style={{ fontSize: 13, color: '#656D76', marginTop: 6 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" style={{ padding: '72px 24px', background: 'rgba(246,248,250,0.97)', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: '#1F2328', marginBottom: 8 }}>Engineering Intelligence, Delivered</h2>
            <p style={{ fontSize: 15, color: '#656D76' }}>Every reviewer comment addressed. Every calculation transparent. Every formula traceable.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {[
              {
                icon: '✓', iconBg: '#DDF4FF', iconColor: '#0969DA',
                title: 'Real-Time Validation',
                desc: 'Every field validates on blur with instant feedback. No silent auto-corrections — only explicit warnings with override confirmations (RC-1, RC-2).',
                pills: ['RC-1 Blur Validation', 'RC-2 No Silent Fix'],
              },
              {
                icon: '⚡', iconBg: '#DAFBE1', iconColor: '#1A7F37',
                title: 'Dual Code Path',
                desc: 'AISC 360-22 LRFD/ASD and IS 800:2007 LSM with genuinely different Pedestal vs Slab calculation paths per ACI 318-19 Chapter 17.',
                pills: ['RC-10 Ped vs Slab', 'RC-5 Unit Auto-Switch'],
              },
              {
                icon: '📊', iconBg: '#FFF8C5', iconColor: '#9A6700',
                title: 'Full Traceability',
                desc: 'Step-by-step calculation sheets with formula name, equation, code clause, and all intermediate values. Zero black boxes.',
                pills: ['RC-12 Formula Trace', 'RC-14 Step-by-Step'],
              },
            ].map((card, i) => (
              <div key={i} className="feature-card" style={{ padding: 22, borderRadius: 12, background: '#FFFFFF', border: '1px solid #EAEEF2' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, fontSize: 18, color: card.iconColor }}>
                  {card.icon}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1F2328', marginBottom: 8 }}>{card.title}</h3>
                <p style={{ fontSize: 13, color: '#656D76', lineHeight: 1.6, marginBottom: 12 }}>{card.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {card.pills.map(p => <span key={p} className="code-pill" style={{ fontSize: 10 }}>{p}</span>)}
                </div>
              </div>
            ))}
          </div>

          {/* Second row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { icon: '📋', iconBg: '#DDF4FF', title: 'ASCE 7-22 Load Combinations', desc: '7 LRFD combos + 7 ASD combos auto-populated on code selection. IS 875/IS 1893 combos for Indian code. Governing combo auto-highlighted. Sign convention +P/−P (RC-3, RC-4).' },
              { icon: '🛡', iconBg: '#FFEBE9', title: '5-Level Warning System', desc: 'INFO → CAUTION → WARNING → CRITICAL → REDESIGN REQUIRED. Every warning shows code clause, what failed, and specific fix recommendations (RC-13).' },
            ].map((card, i) => (
              <div key={i} className="feature-card" style={{ padding: 20, borderRadius: 12, background: '#FFFFFF', border: '1px solid #EAEEF2', display: 'flex', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>
                  {card.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1F2328', marginBottom: 5 }}>{card.title}</h3>
                  <p style={{ fontSize: 12, color: '#656D76', lineHeight: 1.6 }}>{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RC CHECKLIST */}
      <section style={{ padding: '64px 24px', background: 'rgba(255,255,255,0.96)', borderTop: '1px solid #EAEEF2', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1F2328', marginBottom: 6 }}>All Reviewer Comments Addressed</h2>
            <p style={{ fontSize: 14, color: '#656D76' }}>RC-1 through RC-15 — From 50% to 100%</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {[
              ['RC-1', 'Real-time blur validation'],
              ['RC-2', 'No silent plate auto-adjust'],
              ['RC-3', 'Sign convention +P/−P'],
              ['RC-4', 'Load combo auto-fill'],
              ['RC-5', 'Unit auto-switch on code'],
              ['RC-6', 'Section dims lock'],
              ['RC-7', 'Column type ↔ section linked'],
              ['RC-8', 'Material defaults pre-selected'],
              ['RC-9', 'Tabs reorganised by function'],
              ['RC-10', 'Pedestal vs Slab differ'],
              ['RC-11', '3D landing page scene'],
              ['RC-12', 'Formula traceability'],
              ['RC-13', '5-level warning system'],
              ['RC-14', 'Step-by-step calc sheet'],
              ['RC-15', 'ASCE 7-22 load combos'],
            ].map(([rc, label]) => (
              <div key={rc} className="check-item-pass" style={{ fontSize: 12 }}>
                <span style={{ color: '#1A7F37', fontSize: 13 }}>✓</span>
                <div><strong>{rc}</strong> — {label}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <button onClick={() => navigate('/design')} className="btn-eng-primary" style={{ padding: '14px 44px', fontSize: 16, borderRadius: 10 }}>
              Open Design Tool →
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '28px 24px', textAlign: 'center', background: 'rgba(255,255,255,0.96)', borderTop: '1px solid #EAEEF2', position: 'relative', zIndex: 10 }}>
        <p style={{ fontSize: 13, color: '#8C959F' }}>
          StructAI BasePlate v4.0 · LTTS Engineering Intelligence Hackathon 2026<br />
          AISC 360-22 | IS 800:2007 | ACI 318-19 | ASCE 7-22 | IS 456:2000
        </p>
      </footer>
    </div>
  );
}

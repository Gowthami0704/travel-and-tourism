import React, { useEffect, useRef } from 'react';

/**
 * Animated Adventure Dark Background
 * Features:
 * - Dynamic starry sky with glowing golden fireflies / ember drift
 * - Periodic shooting stars / meteor streaks across the night sky
 * - Breathing Aurora Borealis glow waves
 * - Smooth layered mountain silhouettes
 * - Drifting atmospheric mist & elevation topo lines
 */
export default function AdventureBackground({ className = '' }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let width = (canvas.width = canvas.parentElement.offsetWidth);
        let height = (canvas.height = canvas.parentElement.offsetHeight);

        const handleResize = () => {
            if (!canvas || !canvas.parentElement) return;
            width = canvas.width = canvas.parentElement.offsetWidth;
            height = canvas.height = canvas.parentElement.offsetHeight;
        };
        window.addEventListener('resize', handleResize);

        // --- 1. FIREFLIES / STAR PARTICLES ---
        const particleCount = Math.min(55, Math.floor(width / 25));
        const particles = Array.from({ length: particleCount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2 + 0.8,
            baseAlpha: Math.random() * 0.6 + 0.2,
            alpha: Math.random() * 0.6 + 0.2,
            flashSpeed: 0.015 + Math.random() * 0.025,
            flashPhase: Math.random() * Math.PI * 2,
            vx: (Math.random() - 0.5) * 0.35,
            vy: -0.2 - Math.random() * 0.45, // slow upward drift
            color: Math.random() > 0.4 ? 'rgba(251, 191, 36,' : (Math.random() > 0.5 ? 'rgba(52, 211, 153,' : 'rgba(224, 231, 255,')
        }));

        // --- 2. SHOOTING STARS / METEORS ---
        const meteors = [];
        const createMeteor = () => {
            meteors.push({
                x: Math.random() * width * 0.8 + width * 0.1,
                y: Math.random() * (height * 0.35),
                length: Math.random() * 80 + 60,
                speed: Math.random() * 7 + 8,
                angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2, // ~45 deg downward
                alpha: 1,
                decay: 0.02 + Math.random() * 0.015,
                thickness: Math.random() * 1.5 + 1.2,
            });
        };

        let meteorTimer = 0;
        let nextMeteorDelay = 120 + Math.random() * 180; // trigger every 2-4 seconds

        // --- RENDER LOOP ---
        const render = () => {
            ctx.clearRect(0, 0, width, height);

            // Draw & Update Fireflies / Embers
            particles.forEach((p) => {
                p.flashPhase += p.flashSpeed;
                p.alpha = p.baseAlpha + Math.sin(p.flashPhase) * 0.3;
                p.alpha = Math.max(0.1, Math.min(1, p.alpha));

                p.x += p.vx + Math.sin(p.flashPhase * 0.5) * 0.2;
                p.y += p.vy;

                // Wrap around edges
                if (p.y < 0) {
                    p.y = height + 10;
                    p.x = Math.random() * width;
                }
                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;

                // Outer glow
                ctx.save();
                ctx.beginPath();
                const glowGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3.5);
                glowGradient.addColorStop(0, `${p.color} ${p.alpha})`);
                glowGradient.addColorStop(1, `${p.color} 0)`);
                ctx.fillStyle = glowGradient;
                ctx.arc(p.x, p.y, p.radius * 3.5, 0, Math.PI * 2);
                ctx.fill();

                // Bright core
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `${p.color} ${Math.min(1, p.alpha + 0.2)})`;
                ctx.fill();
                ctx.restore();
            });

            // Trigger & Update Shooting Stars
            meteorTimer++;
            if (meteorTimer > nextMeteorDelay) {
                createMeteor();
                meteorTimer = 0;
                nextMeteorDelay = 180 + Math.random() * 240;
            }

            for (let i = meteors.length - 1; i >= 0; i--) {
                const m = meteors[i];
                m.x += Math.cos(m.angle) * m.speed;
                m.y += Math.sin(m.angle) * m.speed;
                m.alpha -= m.decay;

                if (m.alpha <= 0 || m.x > width || m.y > height) {
                    meteors.splice(i, 1);
                    continue;
                }

                ctx.save();
                ctx.strokeStyle = `rgba(253, 224, 71, ${m.alpha})`;
                ctx.lineWidth = m.thickness;
                ctx.lineCap = 'round';

                const tailX = m.x - Math.cos(m.angle) * m.length;
                const tailY = m.y - Math.sin(m.angle) * m.length;

                const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
                grad.addColorStop(0, `rgba(255, 255, 255, ${m.alpha})`);
                grad.addColorStop(0.3, `rgba(251, 191, 36, ${m.alpha * 0.8})`);
                grad.addColorStop(1, 'rgba(251, 191, 36, 0)');

                ctx.strokeStyle = grad;
                ctx.beginPath();
                ctx.moveTo(m.x, m.y);
                ctx.lineTo(tailX, tailY);
                ctx.stroke();
                ctx.restore();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {/* Deep Atmospheric Midnight Gradients */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#040711] via-[#070D1C] to-[#0A0F1E]" />

            {/* Breathing Aurora Glow Layer 1 - Emerald Peak Aura */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[900px] h-[580px] bg-gradient-to-tr from-emerald-900/35 via-teal-600/20 to-amber-500/15 rounded-full blur-3xl animate-pulse duration-[6000ms]" />

            {/* Breathing Aurora Glow Layer 2 - Cyan Cosmic Accent */}
            <div className="absolute top-10 -right-24 w-[600px] h-[600px] bg-gradient-to-bl from-cyan-900/30 via-indigo-900/20 to-transparent rounded-full blur-3xl animate-pulse duration-[8000ms] delay-1000" />

            {/* Breathing Aurora Glow Layer 3 - Golden Sunrise Ember Glow */}
            <div className="absolute top-1/3 -left-32 w-[650px] h-[650px] bg-gradient-to-br from-amber-600/15 via-emerald-900/25 to-transparent rounded-full blur-3xl animate-pulse duration-[7000ms] delay-700" />

            {/* HTML5 Canvas for dynamic fireflies & shooting stars */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

            {/* Topographic Elevation Map Subtle Grid Lines */}
            <svg
                className="absolute inset-0 w-full h-full opacity-10"
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                height="100%"
            >
                <defs>
                    <pattern id="topoGrid" width="70" height="70" patternUnits="userSpaceOnUse">
                        <path d="M 70 0 L 0 0 0 70" fill="none" stroke="#FCD34D" strokeWidth="0.5" strokeOpacity="0.4" />
                        <circle cx="35" cy="35" r="1.5" fill="#34D399" opacity="0.6" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#topoGrid)" />
            </svg>

            {/* Drifting Mist Fog Layer */}
            <div
                className="absolute inset-x-0 bottom-12 h-64 opacity-25 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(52, 211, 153, 0.25), transparent 70%)',
                    filter: 'blur(30px)',
                    animation: 'drift 18s ease-in-out infinite alternate',
                }}
            />

            {/* Distant Mountain Peak Layer (Smooth Silhouette) */}
            <svg
                className="absolute bottom-0 w-full h-72 sm:h-88 md:h-[420px] opacity-45"
                viewBox="0 0 1440 380"
                preserveAspectRatio="none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M0 240 L180 130 L380 250 L620 80 L880 220 L1120 110 L1320 240 L1440 170 L1440 380 L0 380 Z"
                    fill="url(#mountainGradFar)"
                />
                <defs>
                    <linearGradient id="mountainGradFar" x1="50%" y1="0%" x2="50%" y2="100%">
                        <stop offset="0%" stopColor="#054534" stopOpacity="0.5" />
                        <stop offset="60%" stopColor="#091E22" stopOpacity="0.85" />
                        <stop offset="100%" stopColor="#070B14" stopOpacity="0.98" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Midground Mountain Ridge Layer */}
            <svg
                className="absolute bottom-0 w-full h-52 sm:h-72 md:h-88 opacity-75"
                viewBox="0 0 1440 320"
                preserveAspectRatio="none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M0 200 L240 70 L480 210 L760 50 L1040 190 L1280 90 L1440 180 L1440 320 L0 320 Z"
                    fill="url(#mountainGradMid)"
                />
                <defs>
                    <linearGradient id="mountainGradMid" x1="50%" y1="0%" x2="50%" y2="100%">
                        <stop offset="0%" stopColor="#0D1B2A" stopOpacity="0.85" />
                        <stop offset="40%" stopColor="#062E23" stopOpacity="0.92" />
                        <stop offset="100%" stopColor="#070B14" stopOpacity="1" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Foreground Fog & Vignette to blend into page */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E1A] via-transparent to-[#040711]/60" />
            <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-[#0A0E1A] via-[#0A0E1A]/80 to-transparent" />
        </div>
    );
}

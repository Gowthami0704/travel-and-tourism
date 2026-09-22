import React, { useEffect, useRef, useState } from 'react';

export default function SmartCursor() {
    const dotRef = useRef(null);
    const ringRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const [hoverType, setHoverType] = useState('default');
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Disable on touch devices
        if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
            return;
        }

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let ringX = mouseX;
        let ringY = mouseY;
        let animId;

        const onMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (!isVisible) setIsVisible(true);

            if (dotRef.current) {
                dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
            }
        };

        const onMouseLeave = () => setIsVisible(false);
        const onMouseEnter = () => setIsVisible(true);

        const handleElementHover = (e) => {
            const target = e.target.closest('a, button, input, select, textarea, [role="button"], .magnetic-hover');
            if (target) {
                setIsHovered(true);
                if (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button' || target.classList.contains('magnetic-hover')) {
                    setHoverType('button');
                } else if (target.tagName === 'A') {
                    setHoverType('link');
                } else if (['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)) {
                    setHoverType('input');
                } else {
                    setHoverType('default');
                }
            } else {
                setIsHovered(false);
                setHoverType('default');
            }
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('mouseover', handleElementHover, { passive: true });
        document.addEventListener('mouseleave', onMouseLeave);
        document.addEventListener('mouseenter', onMouseEnter);

        // Smooth Lerp loop for the follower ring
        const lerp = (start, end, factor) => start + (end - start) * factor;

        const render = () => {
            ringX = lerp(ringX, mouseX, 0.18);
            ringY = lerp(ringY, mouseY, 0.18);

            if (ringRef.current) {
                ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
            }

            animId = requestAnimationFrame(render);
        };
        render();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseover', handleElementHover);
            document.removeEventListener('mouseleave', onMouseLeave);
            document.removeEventListener('mouseenter', onMouseEnter);
        };
    }, [isVisible]);

    return (
        <div className={`pointer-events-none fixed inset-0 z-[9999] overflow-hidden transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'} hidden md:block`}>
            {/* Center Precision Dot */}
            <div
                ref={dotRef}
                className={`fixed top-0 left-0 -ml-1 -mt-1 w-2 h-2 rounded-full transition-colors duration-200 ${
                    isHovered ? 'bg-[#D4A574] scale-150' : 'bg-[#D4A574]'
                }`}
                style={{
                    willChange: 'transform',
                    boxShadow: '0 0 8px rgba(212, 165, 116, 0.8)',
                }}
            />

            {/* Fluid Magnetic Follower Ring */}
            <div
                ref={ringRef}
                className={`fixed top-0 left-0 rounded-full border border-[#D4A574]/60 transition-all duration-300 ease-out flex items-center justify-center ${
                    hoverType === 'button'
                        ? '-ml-5 -mt-5 w-10 h-10 bg-[#1B4332]/40 border-gold backdrop-blur-[1px] scale-125'
                        : hoverType === 'link'
                        ? '-ml-4 -mt-4 w-8 h-8 bg-gold/20 border-gold scale-110'
                        : hoverType === 'input'
                        ? '-ml-3 -mt-3 w-6 h-6 border-cyan-400 bg-cyan-400/10'
                        : '-ml-3 -mt-3 w-6 h-6 bg-transparent'
                }`}
                style={{
                    willChange: 'transform',
                    mixBlendMode: 'normal',
                }}
            />
        </div>
    );
}

import React, { useEffect, useRef } from 'react';
import { Renderer, Camera, Transform, Geometry, Program, Mesh } from 'ogl';

export default function Galaxy({
    density = 1,
    glowIntensity = 0.35,
    hueShift = 140,
    starSpeed = 0.6,
    mouseRepulsion = true,
    mouseInteraction = true,
    className = '',
}) {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let animationFrameId;
        const renderer = new Renderer({ alpha: true, depth: false, antialias: true });
        const gl = renderer.gl;
        gl.clearColor(0, 0, 0, 0);

        const canvas = gl.canvas;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        container.appendChild(canvas);

        const camera = new Camera(gl, { fov: 45 });
        camera.position.z = 5;

        function resize() {
            if (!container) return;
            const width = container.clientWidth || window.innerWidth;
            const height = container.clientHeight || window.innerHeight;
            renderer.setSize(width, height);
            camera.perspective({ aspect: width / height });
        }
        window.addEventListener('resize', resize);
        resize();

        // Generate stars
        const count = Math.floor(1200 * density);
        const positions = new Float32Array(count * 3);
        const randoms = new Float32Array(count * 4);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // Spiral arms distribution + spherical cluster
            const r = Math.pow(Math.random(), 1.5) * 3.5;
            const theta = Math.random() * Math.PI * 2;
            const phi = (Math.random() - 0.5) * 1.2;

            positions[i * 3 + 0] = Math.cos(theta) * r;
            positions[i * 3 + 1] = Math.sin(phi) * (r * 0.4);
            positions[i * 3 + 2] = Math.sin(theta) * r;

            randoms[i * 4 + 0] = Math.random();
            randoms[i * 4 + 1] = Math.random();
            randoms[i * 4 + 2] = Math.random();
            randoms[i * 4 + 3] = (Math.random() * 0.8 + 0.2);

            // Palette: Gold (#D4A574), Emerald/Forest Green (#10B981), Cyan, Royal Gold
            const colorChoice = Math.random();
            if (colorChoice < 0.4) {
                // Gold / Amber
                colors[i * 3 + 0] = 0.83; // 212/255
                colors[i * 3 + 1] = 0.65; // 165/255
                colors[i * 3 + 2] = 0.45; // 116/255
            } else if (colorChoice < 0.75) {
                // Forest Green / Teal
                colors[i * 3 + 0] = 0.15;
                colors[i * 3 + 1] = 0.75;
                colors[i * 3 + 2] = 0.55;
            } else {
                // Soft Starlight Pearl
                colors[i * 3 + 0] = 0.95;
                colors[i * 3 + 1] = 0.95;
                colors[i * 3 + 2] = 1.0;
            }
        }

        const geometry = new Geometry(gl, {
            position: { size: 3, data: positions },
            random: { size: 4, data: randoms },
            color: { size: 3, data: colors },
        });

        const vertex = /* glsl */ `
            attribute vec3 position;
            attribute vec4 random;
            attribute vec3 color;

            uniform mat4 modelViewMatrix;
            uniform mat4 projectionMatrix;
            uniform float uTime;
            uniform vec2 uMouse;
            uniform float uRepulsion;

            varying vec4 vRandom;
            varying vec3 vColor;
            varying float vDistance;

            void main() {
                vRandom = random;
                vColor = color;

                vec3 pos = position;

                // Galaxy orbital rotation
                float angle = uTime * (0.15 + random.x * 0.05);
                float cosA = cos(angle);
                float sinA = sin(angle);
                float x = pos.x * cosA - pos.z * sinA;
                float z = pos.x * sinA + pos.z * cosA;
                pos.x = x;
                pos.z = z;

                // Subtle wave
                pos.y += sin(uTime * 1.5 + random.y * 6.28) * 0.08;

                // Mouse interaction
                if (uRepulsion > 0.0) {
                    vec2 screenPos = pos.xy / 2.0;
                    float dist = distance(screenPos, uMouse);
                    if (dist < 0.8) {
                        vec2 dir = normalize(screenPos - uMouse);
                        float force = (0.8 - dist) * 0.4;
                        pos.x += dir.x * force;
                        pos.y += dir.y * force;
                    }
                }

                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                gl_PointSize = (random.w * 32.0 / -mvPosition.z) * (1.0 + sin(uTime * 2.0 + random.z * 6.28) * 0.3);
                vDistance = -mvPosition.z;
            }
        `;

        const fragment = /* glsl */ `
            precision highp float;

            varying vec4 vRandom;
            varying vec3 vColor;
            varying float vDistance;
            uniform float uGlow;

            void main() {
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center);
                if (dist > 0.5) discard;

                float core = smoothstep(0.5, 0.0, dist);
                float glow = exp(-dist * 4.0) * uGlow;
                float alpha = (core * 0.8 + glow * 1.2) * (1.0 - smoothstep(2.0, 7.0, vDistance));

                gl_FragColor = vec4(vColor + vec3(glow * 0.5), alpha);
            }
        `;

        const program = new Program(gl, {
            vertex,
            fragment,
            uniforms: {
                uTime: { value: 0 },
                uMouse: { value: [0, 0] },
                uRepulsion: { value: mouseRepulsion ? 1.0 : 0.0 },
                uGlow: { value: glowIntensity },
            },
            transparent: true,
            depthTest: false,
        });

        const scene = new Transform();
        const mesh = new Mesh(gl, { geometry, program });
        mesh.setParent(scene);

        // Mouse move
        const targetMouse = [0, 0];
        function onMouseMove(e) {
            if (!mouseInteraction) return;
            const rect = container.getBoundingClientRect();
            targetMouse[0] = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            targetMouse[1] = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        }
        window.addEventListener('mousemove', onMouseMove);

        let lastTime = performance.now();
        function update(now) {
            animationFrameId = requestAnimationFrame(update);
            const delta = (now - lastTime) * 0.001;
            lastTime = now;

            program.uniforms.uTime.value += delta * starSpeed;
            // Smooth mouse interpolation
            program.uniforms.uMouse.value[0] += (targetMouse[0] - program.uniforms.uMouse.value[0]) * 0.08;
            program.uniforms.uMouse.value[1] += (targetMouse[1] - program.uniforms.uMouse.value[1]) * 0.08;

            scene.rotation.y = program.uniforms.uTime.value * 0.08;
            scene.rotation.x = Math.sin(program.uniforms.uTime.value * 0.05) * 0.15 + 0.3;

            renderer.render({ scene, camera });
        }
        animationFrameId = requestAnimationFrame(update);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouseMove);
            if (canvas && canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
            }
        };
    }, [density, glowIntensity, hueShift, starSpeed, mouseRepulsion, mouseInteraction]);

    return (
        <div
            ref={containerRef}
            className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
            style={{ zIndex: 0 }}
        />
    );
}

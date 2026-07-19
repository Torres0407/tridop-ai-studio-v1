import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { TriExpression } from '../types';

interface TriMascotProps {
  expression?: TriExpression;
  speechText?: string;
}

export default function TriMascot({ expression = 'idle', speechText }: TriMascotProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  
  // 3D Tilt and Translation tracking state
  const [motionState, setMotionState] = useState({
    tiltX: 0,
    tiltY: 0,
    translateX: 0,
    translateY: 0,
  });

  // Handle cursor tracking (3D tilt + translation)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const triCenterX = rect.left + rect.width / 2;
      const triCenterY = rect.top + rect.height / 2;

      const dx = e.clientX - triCenterX;
      const dy = e.clientY - triCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // 1. Precise eye offsets (max 10px movement inside the visor)
      const maxEyeOffset = 10;
      const eyeX = distance > 0 ? (dx / distance) * Math.min(distance * 0.05, maxEyeOffset) : 0;
      const eyeY = distance > 0 ? (dy / distance) * Math.min(distance * 0.05, maxEyeOffset) : 0;
      setEyeOffset({ x: eyeX, y: eyeY });

      // 2. 3D Rotation angles (tilt body towards mouse)
      const maxTilt = 22; // degrees
      const tiltX = distance > 0 ? (dx / distance) * Math.min(distance * 0.04, maxTilt) : 0;
      const tiltY = distance > 0 ? (dy / distance) * Math.min(distance * 0.04, maxTilt) : 0;

      // 3. 3D Position translation (literally float/shift towards mouse)
      const maxTranslate = 50; // pixels
      const transX = distance > 0 ? (dx / distance) * Math.min(distance * 0.08, maxTranslate) : 0;
      const transY = distance > 0 ? (dy / distance) * Math.min(distance * 0.08, maxTranslate) : 0;

      setMotionState({
        tiltX: tiltX,
        tiltY: -tiltY, // Invert Y for correct screen tilt rotation
        translateX: transX,
        translateY: transY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Periodic blinking cycle
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
      }, 140);
    }, 4500 + Math.random() * 2500);

    return () => clearInterval(blinkInterval);
  }, []);

  // Decide if Tri is actively waving (disabled by request)
  const isWaving = false;

  // Expression helper states for cross-fading
  const isBlinkActive = isBlinking;
  const isPointingActive = !isBlinking && expression === 'pointing';
  const isExcitedActive = !isBlinking && expression === 'excited';
  const isWinkActive = !isBlinking && expression === 'wink';
  const isThinkingActive = !isBlinking && expression === 'thinking';
  const isTalkingActive = !isBlinking && expression === 'talking';
  const isIdleActive = !isBlinking && !isExcitedActive && !isWinkActive && !isThinkingActive && !isTalkingActive && !isPointingActive;

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center p-4 select-none"
    >
      {/* Dynamic Floating Speech Bubble */}
      {speechText && (
        <div className="absolute -top-16 bg-slate-950/90 border border-cyan-500/35 text-cyan-200 px-4.5 py-3 rounded-2xl text-sm max-w-xs shadow-[0_0_30px_rgba(34,211,238,0.18)] backdrop-blur-md animate-fade-in text-center z-10 font-sans font-medium">
          <div className="relative">
            {speechText}
            {/* Triangular pointer directed down at Tri */}
            <div className="absolute -bottom-[13px] left-1/2 -translate-x-1/2 w-0 h-0 border-8 border-transparent border-t-slate-950/90" />
            <div className="absolute -bottom-[15px] left-1/2 -translate-x-1/2 w-0 h-0 border-8 border-transparent border-t-cyan-500/35 -z-10" />
          </div>
        </div>
      )}

      {/* Outer interactive tilt and translation handler to follow cursor */}
      <div
        style={{
          transform: `perspective(1200px) rotateY(${motionState.tiltX}deg) rotateX(${motionState.tiltY}deg) translate3d(${motionState.translateX}px, ${motionState.translateY}px, 0)`,
          transition: 'transform 0.22s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
        className="relative flex items-center justify-center"
      >
        {/* Inner floating mascot structure */}
        <div
          className="relative w-[380px] h-[450px] md:w-[460px] md:h-[540px] flex items-center justify-center select-none"
          style={{
            animation: 'tri-float 6s ease-in-out infinite',
          }}
        >
        {/* Decorative background planetary orbit rings */}
        <div className="absolute inset-0 border border-cyan-500/10 rounded-full animate-spin duration-[25s] pointer-events-none scale-95" />
        <div className="absolute inset-0 border border-purple-500/5 rounded-full animate-spin duration-[40s] pointer-events-none scale-[1.15]" />

        {/* CSS Keyframes injected directly for pristine cross-platform wave & floating controls */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes tri-hand-wave {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(-28deg); }
          }
          @keyframes tri-body-glow {
            0%, 100% { filter: drop-shadow(0 0 10px rgba(34, 211, 238, 0.6)) drop-shadow(0 0 3px rgba(168, 85, 247, 0.4)); opacity: 0.9; }
            50% { filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.9)) drop-shadow(0 0 6px rgba(34, 211, 238, 0.6)); opacity: 1; }
          }
          @keyframes left-arm-idle {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(3px) rotate(-4deg); }
          }
          @keyframes right-arm-idle {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(3px) rotate(4deg); }
          }
          @keyframes plasma-flicker {
            0%, 100% { transform: scaleY(1) scaleX(1); opacity: 0.85; filter: drop-shadow(0 0 10px #22d3ee); }
            30% { transform: scaleY(1.2) scaleX(0.95); opacity: 1; filter: drop-shadow(0 0 16px #38bdf8); }
            70% { transform: scaleY(0.85) scaleX(1.05); opacity: 0.75; filter: drop-shadow(0 0 8px #a855f7); }
          }
          @keyframes plasma-pulsate {
            0%, 100% { opacity: 0.2; transform: scale(0.95); }
            50% { opacity: 0.5; transform: scale(1.1); }
          }
        `}} />

        {/* High-fidelity Vector Robot SVG Chassis */}
        <svg
          viewBox="0 0 110 135"
          className="w-[340px] h-[410px] md:w-[420px] md:h-[500px] drop-shadow-[0_15px_40px_rgba(3,0,20,0.85)] filter"
        >
          {/* Floor ground shadow for immersive 3D depth */}
          <ellipse cx="55" cy="126" rx="22" ry="4" fill="rgba(0,0,0,0.55)" />

          {/* Defining color palettes and metal gradients */}
          <defs>
            {/* 3D Curved Metal Armor Gradient (Specular light -> diffuse -> core shadow -> rim reflection) */}
            <linearGradient id="armor3dGrad" x1="15%" y1="0%" x2="85%" y2="100%">
              <stop offset="0%" stopColor="#4338ca" />
              <stop offset="15%" stopColor="#1e1b4b" />
              <stop offset="65%" stopColor="#0f172a" />
              <stop offset="90%" stopColor="#020617" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            {/* Glowing neon purple antennae gradient */}
            <linearGradient id="purpleGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#581c87" />
            </linearGradient>

            {/* Cyan digital energy piping */}
            <linearGradient id="cyanGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>

            {/* High-fidelity 3D metallic gold gradient */}
            <linearGradient id="goldAccent3D" x1="15%" y1="0%" x2="85%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="30%" stopColor="#fbbf24" />
              <stop offset="75%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>

            {/* Cylindrical 3D metallic shading for neck/joints */}
            <linearGradient id="jointCylinder" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="25%" stopColor="#334155" />
              <stop offset="50%" stopColor="#475569" />
              <stop offset="75%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* 3D Curved Visor Glass Gradient with rich depth */}
            <linearGradient id="visor3dGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="20%" stopColor="#090514" />
              <stop offset="80%" stopColor="#020108" />
              <stop offset="100%" stopColor="#1b1136" />
            </linearGradient>

            {/* 3D Sphere Spherical Shader - Cyan */}
            <radialGradient id="sphereCyan3D" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#e0f7fa" />
              <stop offset="25%" stopColor="#22d3ee" />
              <stop offset="75%" stopColor="#0891b2" />
              <stop offset="100%" stopColor="#0c4a6e" />
            </radialGradient>

            {/* 3D Sphere Spherical Shader - Purple */}
            <radialGradient id="spherePurple3D" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fae8ff" />
              <stop offset="25%" stopColor="#c084fc" />
              <stop offset="75%" stopColor="#7e22ce" />
              <stop offset="100%" stopColor="#4c1d95" />
            </radialGradient>

            {/* 3D Plasma Thrust Flame Gradient */}
            <radialGradient id="plasmaGlow" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#22d3ee" />
              <stop offset="65%" stopColor="#a855f7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </radialGradient>

            {/* Deep chassis shadow */}
            <linearGradient id="shadowGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#020617" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* ========================================================= */}
          {/* PART 1: LEFT ARM AND HAND */}
          {/* ========================================================= */}
          <g 
            id="tri-left-arm"
            style={{
              transformOrigin: '22px 75px',
              animation: expression === 'pointing' ? 'none' : 'left-arm-idle 4s ease-in-out infinite',
            }}
          >
            {/* Shoulder Joint Capsule Shell */}
            <circle cx="22" cy="75" r="5.5" fill="url(#jointCylinder)" stroke="#475569" strokeWidth="0.5" />
            <circle cx="22" cy="75" r="3.5" fill="url(#sphereCyan3D)" />

            {expression === 'pointing' ? (
              <g>
                {/* Arm raised up & reaching out to the left */}
                <path 
                  d="M 22,75 Q 0,68 -12,65" 
                  fill="none" 
                  stroke="url(#armor3dGrad)" 
                  strokeWidth="5.5" 
                  strokeLinecap="round" 
                />
                {/* Arm highlights */}
                <path 
                  d="M 22,75 Q 0,68 -12,65" 
                  fill="none" 
                  stroke="#38bdf8" 
                  strokeWidth="1" 
                  strokeLinecap="round" 
                />
                {/* Glowing wrist joint */}
                <circle cx="-12" cy="65" r="3.5" fill="url(#sphereCyan3D)" style={{ filter: 'drop-shadow(0 0 5px #22d3ee)' }} />
                {/* Hand pointing left (index finger pointing left, others curled) */}
                <path 
                  d="M -12,65 L -26,62 C -28,62 -28,64 -26,64 L -16,65 C -14,65 -14,67 -16,67 L -20,67 C -21,67 -21,69 -20,69 L -16,69 Z" 
                  fill="url(#armor3dGrad)" 
                  stroke="#38bdf8" 
                  strokeWidth="0.8" 
                />
              </g>
            ) : (
              <g>
                {/* Capsule Arm Segment with 3D Bevel highlight and Cylindrical Metal look */}
                <rect x="14" y="75" width="7" height="22" rx="3.5" fill="url(#armor3dGrad)" stroke="#38bdf8" strokeWidth="0.8" />
                {/* Specular overlay on arm */}
                <rect x="15" y="76" width="2" height="20" rx="1" fill="#ffffff" opacity="0.12" />
                {/* Glowing 3D wrist joint */}
                <circle cx="17.5" cy="97" r="3" fill="url(#sphereCyan3D)" />
                {/* Cute digital hand / claw with 3 fingers in 3D */}
                <path 
                  d="M 14,99 L 14,107 C 14,109 16,109 17.5,106.5 C 19,109 21,109 21,107 L 21,99 Z" 
                  fill="url(#armor3dGrad)" 
                  stroke="#38bdf8" 
                  strokeWidth="0.8" 
                />
              </g>
            )}
          </g>

          {/* ========================================================= */}
          {/* PART 2: RIGHT ARM AND HAND (WITH WAVING CAPABILITY) */}
          {/* ========================================================= */}
          <g 
            id="tri-right-arm"
            style={{
              transformOrigin: '88px 75px',
              // Apply active waving rotation when state is active, otherwise float gently
              animation: isWaving 
                ? 'tri-hand-wave 0.5s ease-in-out infinite' 
                : 'right-arm-idle 4s ease-in-out infinite',
            }}
          >
            {/* Shoulder Joint Capsule Shell */}
            <circle cx="88" cy="75" r="5.5" fill="url(#jointCylinder)" stroke="#475569" strokeWidth="0.5" />
            <circle cx="88" cy="75" r="3.5" fill="url(#sphereCyan3D)" />

            {isWaving ? (
              // Raised waving arm configuration
              <g>
                {/* Arm raised up to the side in 3D */}
                <path 
                  d="M 88,75 Q 104,58 98,42" 
                  fill="none" 
                  stroke="url(#armor3dGrad)" 
                  strokeWidth="6" 
                  strokeLinecap="round" 
                />
                {/* Arm highlights */}
                <path 
                  d="M 88,75 Q 104,58 98,42" 
                  fill="none" 
                  stroke="#38bdf8" 
                  strokeWidth="1" 
                  strokeLinecap="round" 
                />
                {/* Glowing neon purple wrist joint in 3D */}
                <circle cx="98" cy="42" r="3.5" fill="url(#spherePurple3D)" style={{ filter: 'drop-shadow(0 0 5px #a855f7)' }} />
                {/* Cute 3-fingered waving digital hand in 3D */}
                <path 
                  d="M 94,39 L 90,29 C 89,27 91.5,25 93.5,28.5 C 95,25 97.5,25.5 98,29 C 100.5,25 103,27.5 101,31 L 101,39 Z" 
                  fill="url(#armor3dGrad)" 
                  stroke="#c084fc" 
                  strokeWidth="0.8" 
                />
              </g>
            ) : (
              // Relaxed resting arm configuration
              <g>
                {/* Capsule Arm Segment with 3D Bevel highlight and Cylindrical Metal look */}
                <rect x="89" y="75" width="7" height="22" rx="3.5" fill="url(#armor3dGrad)" stroke="#38bdf8" strokeWidth="0.8" />
                {/* Specular overlay on arm */}
                <rect x="90" y="76" width="2" height="20" rx="1" fill="#ffffff" opacity="0.12" />
                {/* Glowing 3D wrist joint */}
                <circle cx="92.5" cy="97" r="3" fill="url(#sphereCyan3D)" />
                {/* Waving/Resting Claw hand in 3D */}
                <path 
                  d="M 89,99 L 89,107 C 89,109 91,109 92.5,106.5 C 94,109 96,109 96,107 L 96,99 Z" 
                  fill="url(#armor3dGrad)" 
                  stroke="#38bdf8" 
                  strokeWidth="0.8" 
                />
              </g>
            )}
          </g>

          {/* ========================================================= */}
          {/* PART 3: OVAL BODY (TORSO) */}
          {/* ========================================================= */}
          <g id="tri-body">
            {/* Plasma Levitation Thruster System (Gives floating real-world physical justification) */}
            <g id="levitation-thruster">
              {/* Outer Pulsating Thruster Plasma Corona */}
              <ellipse cx="55" cy="116" rx="14" ry="4" fill="url(#plasmaGlow)" opacity="0.4" style={{ animation: 'plasma-pulsate 2s ease-in-out infinite' }} />
              {/* High-energy plasma flame jet */}
              <path 
                d="M 50,113 Q 55,133 60,113 Z" 
                fill="url(#plasmaGlow)" 
                style={{ 
                  animation: 'plasma-flicker 0.3s ease-in-out infinite',
                  transformOrigin: '55px 113px' 
                }} 
              />
              {/* Detailed 3D Thruster Nozzle Nozzle */}
              <path 
                d="M 46,112 L 64,112 L 60,117 L 50,117 Z" 
                fill="url(#jointCylinder)" 
                stroke="#1e293b" 
                strokeWidth="0.8" 
              />
              {/* Glowing internal engine ring */}
              <ellipse cx="55" cy="113" rx="6" ry="1.5" fill="#22d3ee" />
            </g>

            {/* Floating holographic neck ring */}
            <ellipse cx="55" cy="65" rx="14" ry="4.5" fill="none" stroke="url(#cyanGlow)" strokeWidth="1.5" />
            <ellipse cx="55" cy="65" rx="18" ry="6" fill="none" stroke="rgba(34, 211, 238, 0.15)" strokeWidth="1" />

            {/* Oval Torso Base (Rounded futuristic capsule body with 3D highlight & shading) */}
            <rect
              x="26"
              y="66"
              width="58"
              height="48"
              rx="24"
              fill="url(#armor3dGrad)"
              stroke="url(#cyanGlow)"
              strokeWidth="1.2"
            />

            {/* 3D Curved Specular Highlight across body shell */}
            <path 
              d="M 30,85 C 30,73 40,68 54,68 C 42,70 34,76 34,88 C 34,94 30,90 30,85 Z" 
              fill="#ffffff" 
              opacity="0.1" 
            />

            {/* Custom Glowing 3D Reactor Core representing the Tridop symbol (triangle within hexagon) */}
            <g id="reactor-core">
              {/* 3D Dark Hexagon Socket backing */}
              <polygon 
                points="55,75 65,80 65,92 55,97 45,92 45,80" 
                fill="#02000a" 
                stroke="#0f172a" 
                strokeWidth="2" 
              />
              {/* Outer Glowing Hexagon border */}
              <polygon 
                points="55,76 64,81 64,91 55,96 46,91 46,81" 
                fill="#050312" 
                stroke="#a855f7" 
                strokeWidth="1.5" 
                style={{ animation: 'tri-body-glow 3s ease-in-out infinite' }}
              />
              {/* Inner glowing faceted 3D core crystal (Triangle layers) */}
              <polygon 
                points="55,80 61,90 49,90" 
                fill="#22d3ee" 
                opacity="0.5"
                style={{ filter: 'drop-shadow(0 0 8px #06b6d4)' }}
              />
              <polygon 
                points="55,82 59,89 51,89" 
                fill="#ffffff" 
                opacity="0.85"
              />
              {/* Inner glowing core accent */}
              <circle cx="55" cy="87" r="1.5" fill="#e0f7fa" />
            </g>

            {/* High-tech status battery/load segments in 3D */}
            <g id="body-metrics" opacity="0.9">
              {/* Left power node */}
              <circle cx="36" cy="86" r="1.5" fill="url(#sphereCyan3D)" />
              <rect x="34" y="90" width="4" height="1.5" rx="0.5" fill="#1e293b" />
              <rect x="34" y="90" width="2.5" height="1.5" rx="0.5" fill="#22d3ee" />
              
              {/* Right power node */}
              <circle cx="74" cy="86" r="1.5" fill="url(#spherePurple3D)" />
              <rect x="72" y="90" width="4" height="1.5" rx="0.5" fill="#1e293b" />
              <rect x="72" y="90" width="2.5" height="1.5" rx="0.5" fill="#c084fc" />
            </g>

            {/* Elegant 3D golden brand trims on collar */}
            <path d="M 40,68 L 70,68" stroke="url(#goldAccent3D)" strokeWidth="1.8" strokeLinecap="round" />
          </g>

          {/* ========================================================= */}
          {/* PART 4: HEAD (WITH VISOR, EYES, AND ANTENNAE) */}
          {/* ========================================================= */}
          <g id="tri-head">
            {/* Side Antennae (Ears) with glowing 3D spherical power caps */}
            {/* Left Antenna */}
            <rect x="18" y="22" width="4.5" height="12" rx="2" fill="url(#jointCylinder)" stroke="#334155" strokeWidth="0.5" />
            <circle cx="20.25" cy="18" r="3" fill="url(#spherePurple3D)" style={{ filter: 'drop-shadow(0 0 5px #c084fc)' }} />
            <circle cx="19.25" cy="17" r="0.8" fill="#ffffff" opacity="0.75" /> {/* Specular highlight dot */}

            {/* Right Antenna */}
            <rect x="87.5" y="22" width="4.5" height="12" rx="2" fill="url(#jointCylinder)" stroke="#334155" strokeWidth="0.5" />
            <circle cx="89.75" cy="18" r="3" fill="url(#spherePurple3D)" style={{ filter: 'drop-shadow(0 0 5px #c084fc)' }} />
            <circle cx="88.75" cy="17" r="0.8" fill="#ffffff" opacity="0.75" /> {/* Specular highlight dot */}

            {/* Neck connection pillar - 3D hydraulic vertical joint discs */}
            <ellipse cx="55" cy="62" rx="8" ry="2.5" fill="url(#jointCylinder)" stroke="#475569" strokeWidth="0.5" />
            <ellipse cx="55" cy="58" rx="7" ry="2.2" fill="url(#jointCylinder)" stroke="#475569" strokeWidth="0.5" />
            <ellipse cx="55" cy="54" rx="6" ry="2" fill="url(#jointCylinder)" stroke="#475569" strokeWidth="0.5" />

            {/* Main digital metal head piece in 3D */}
            <rect
              x="23"
              y="11"
              width="64"
              height="44"
              rx="22"
              fill="url(#armor3dGrad)"
              stroke="url(#cyanGlow)"
              strokeWidth="1.2"
            />

            {/* 3D Curved Specular Forehead highlight shape */}
            <path 
              d="M 28,26 C 28,16 38,13 55,13 C 40,15 32,21 32,32 C 32,34 28,30 28,26 Z" 
              fill="#ffffff" 
              opacity="0.12" 
            />

            {/* Visor internal screen layer (Polished dark glass bubble) */}
            <rect
              x="29"
              y="17"
              width="52"
              height="32"
              rx="16"
              fill="url(#visor3dGrad)"
              stroke="#1e1b4b"
              strokeWidth="1.5"
            />

            {/* Glass Lens Highlight Overlay - Curved diagonal glossy reflection */}
            <path 
              d="M 31,23 C 35,19 45,18 55,20 C 44,22 36,26 31,31 Z" 
              fill="#ffffff" 
              opacity="0.16" 
            />
            {/* Upper lens edge specular white glow */}
            <ellipse cx="55" cy="18.5" rx="14" ry="0.8" fill="#ffffff" opacity="0.18" />

            {/* Screen background glowing matrix shadow */}
            <rect
              x="30"
              y="18"
              width="50"
              height="30"
              rx="15"
              fill="none"
              stroke="rgba(34, 211, 238, 0.12)"
              strokeWidth="1.5"
            />

            {/* Digital mouth soundwave bar */}
            <g id="mouth-status">
              {/* Talking Mouth */}
              <motion.path
                id="mouth-talking"
                d="M 50,42 Q 55,46 60,42"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="2"
                strokeLinecap="round"
                className="animate-pulse"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: expression === 'talking' ? 1 : 0, scale: expression === 'talking' ? 1 : 0.8 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                style={{ transformOrigin: "55px 42px" }}
              />

              {/* Excited Mouth */}
              <motion.path
                id="mouth-excited"
                d="M 51,41 Q 55,45 59,41"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: expression === 'excited' ? 1 : 0, scale: expression === 'excited' ? 1 : 0.8 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                style={{ transformOrigin: "55px 42px" }}
              />

              {/* Idle Mouth */}
              <motion.rect
                id="mouth-idle"
                x="51"
                y="42"
                width="8"
                height="1.8"
                rx="0.9"
                fill="#1e1b4b"
                initial={{ opacity: 0 }}
                animate={{ opacity: (expression !== 'talking' && expression !== 'excited') ? 1 : 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                style={{ transformOrigin: "55px 42px" }}
              />
            </g>

            {/* Digital floating eyes */}
            {/* 1. Blink Layer */}
            <motion.g
              id="eye-blink-layer"
              initial={{ opacity: 0, scaleY: 0.1 }}
              animate={{ 
                opacity: isBlinkActive ? 1 : 0,
                scaleY: isBlinkActive ? 1 : 0.1
              }}
              transition={{ duration: 0.1, ease: "easeOut" }}
              style={{ transformOrigin: "55px 33px" }}
            >
              <rect
                x={36}
                y={33}
                width="10"
                height="2.5"
                rx="1"
                fill="#22d3ee"
                style={{ filter: 'drop-shadow(0 0 10px rgba(34,211,238,0.8))' }}
              />
              <rect
                x={64}
                y={33}
                width="10"
                height="2.5"
                rx="1"
                fill="#22d3ee"
                style={{ filter: 'drop-shadow(0 0 10px rgba(34,211,238,0.8))' }}
              />
            </motion.g>

            {/* 2. Excited Layer */}
            <motion.g
              id="eye-excited-layer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: isExcitedActive ? 1 : 0,
                scale: isExcitedActive ? 1 : 0.8 
              }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              style={{ transformOrigin: "55px 33px" }}
            >
              <path
                d="M 33,37 Q 41,25 45,37"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="3.5"
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 6px rgba(34,211,238,0.9))' }}
              />
              <path
                d="M 61,37 Q 69,25 73,37"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="3.5"
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 6px rgba(34,211,238,0.9))' }}
              />
            </motion.g>

            {/* 3. Wink Layer */}
            <motion.g
              id="eye-wink-layer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: isWinkActive ? 1 : 0,
                scale: isWinkActive ? 1 : 0.8 
              }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              style={{ transformOrigin: "55px 33px" }}
            >
              <circle
                cx={41 + eyeOffset.x}
                cy={33 + eyeOffset.y}
                r="6"
                fill="#22d3ee"
                style={{
                  filter: 'drop-shadow(0 0 6px rgba(34,211,238,0.85))',
                }}
              />
              <path
                d="M 61,35 Q 67,27 73,35"
                fill="none"
                stroke="#c084fc"
                strokeWidth="3.5"
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 6px rgba(192,132,252,0.9))' }}
              />
            </motion.g>

            {/* 4. Thinking Layer */}
            <motion.g
              id="eye-thinking-layer"
              initial={{ opacity: 0, scaleY: 0.5 }}
              animate={{ 
                opacity: isThinkingActive ? 1 : 0,
                scaleY: isThinkingActive ? 1 : 0.5 
              }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              style={{ transformOrigin: "55px 33px" }}
            >
              <rect
                x={35 + eyeOffset.x}
                y={32 + eyeOffset.y}
                width="12"
                height="4"
                rx="2"
                fill="#a855f7"
                style={{
                  filter: 'drop-shadow(0 0 6px #a855f7)',
                }}
              />
              <rect
                x={63 + eyeOffset.x}
                y={32 + eyeOffset.y}
                width="12"
                height="4"
                rx="2"
                fill="#a855f7"
                style={{
                  filter: 'drop-shadow(0 0 6px #a855f7)',
                }}
              />
            </motion.g>

            {/* 5. Talking Layer */}
            <motion.g
              id="eye-talking-layer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: isTalkingActive ? 1 : 0,
                scale: isTalkingActive ? 1 : 0.8 
              }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              style={{ transformOrigin: "55px 33px" }}
            >
              <rect
                x={37 + eyeOffset.x / 1.5}
                y={27 + eyeOffset.y / 1.5}
                width="8"
                height="13"
                rx="4"
                fill="#38bdf8"
                className="animate-pulse"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(56,189,248,0.9))',
                }}
              />
              <rect
                x={65 + eyeOffset.x / 1.5}
                y={27 + eyeOffset.y / 1.5}
                width="8"
                height="13"
                rx="4"
                fill="#38bdf8"
                className="animate-pulse"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(56,189,248,0.9))',
                }}
              />
            </motion.g>

            {/* 6. Idle Layer */}
            <motion.g
              id="eye-idle-layer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: (isIdleActive || isPointingActive) ? 1 : 0,
                scale: (isIdleActive || isPointingActive) ? 1 : 0.8 
              }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              style={{ transformOrigin: "55px 33px" }}
            >
              <circle
                cx={41 + eyeOffset.x}
                cy={33 + eyeOffset.y}
                r="5.5"
                fill="#22d3ee"
                style={{
                  filter: 'drop-shadow(0 0 7px rgba(34,211,238,0.9))',
                }}
              />
              <circle
                cx={69 + eyeOffset.x}
                cy={33 + eyeOffset.y}
                r="5.5"
                fill="#22d3ee"
                style={{
                  filter: 'drop-shadow(0 0 7px rgba(34,211,238,0.9))',
                }}
              />
            </motion.g>
          </g>

        </svg>

        {/* Floating holographic neon laser particles beneath Tri */}
        <div className="absolute bottom-6 w-24 h-1 bg-cyan-500/25 blur-[3px] rounded-full animate-pulse" />
        <div className="absolute bottom-4 w-12 h-0.5 bg-purple-500/15 blur-[2px] rounded-full animate-pulse" />
      </div>
    </div>
  </div>
  );
}

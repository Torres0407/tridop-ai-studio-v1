import React, { useEffect, useState } from 'react';

interface TypewriterProps {
  lines: string[];
  delayBetweenLines?: number;
  speed?: number;
  onComplete?: () => void;
}

export default function Typewriter({
  lines,
  delayBetweenLines = 800,
  speed = 40,
  onComplete,
}: TypewriterProps) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');

  useEffect(() => {
    if (lines.length === 0) return;

    if (currentLineIndex < lines.length) {
      const fullText = lines[currentLineIndex];
      let charIndex = 0;
      setCurrentText('');

      const typingInterval = setInterval(() => {
        if (charIndex < fullText.length) {
          setCurrentText((prev) => prev + fullText.charAt(charIndex));
          charIndex++;
        } else {
          clearInterval(typingInterval);
          // Line typing complete
          setTimeout(() => {
            setVisibleLines((prev) => [...prev, fullText]);
            setCurrentText('');
            setCurrentLineIndex((prev) => prev + 1);
          }, delayBetweenLines);
        }
      }, speed);

      return () => clearInterval(typingInterval);
    } else {
      // All lines typed
      if (onComplete) {
        onComplete();
      }
    }
  }, [currentLineIndex, lines, delayBetweenLines, speed]);

  return (
    <div className="space-y-4 font-sans">
      {visibleLines.map((line, index) => (
        <p
          key={index}
          className={`text-xl md:text-2xl leading-relaxed font-light ${
            index === 0
              ? 'text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 mb-6'
              : 'text-slate-300'
          }`}
        >
          {index > 0 && <span className="text-cyan-400 mr-3 font-semibold">✦</span>}
          {line}
        </p>
      ))}
      
      {currentLineIndex < lines.length && (
        <p
          className={`text-xl md:text-2xl font-light inline-block ${
            currentLineIndex === 0
              ? 'text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 mb-6'
              : 'text-slate-300'
          }`}
        >
          {currentLineIndex > 0 && <span className="text-cyan-400 mr-3 font-semibold">✦</span>}
          {currentText}
          <span className="inline-block w-1.5 h-6 ml-1 bg-cyan-400 animate-pulse glow-cyan" />
        </p>
      )}
    </div>
  );
}

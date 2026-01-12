import { useMemo } from "react";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  minOpacity: number;
  maxOpacity: number;
  blur?: number;
}

export const StarBackground = () => {
  const stars = useMemo<Star[]>(() => {
    const starCount = 250;
    return Array.from({ length: starCount }, (_, i) => {
      const isLarge = Math.random() > 0.85;
      return {
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: isLarge ? Math.random() * 3 + 2 : Math.random() * 2 + 0.5,
        duration: Math.random() * 4 + 2,
        delay: Math.random() * 5,
        minOpacity: Math.random() * 0.3 + 0.2,
        maxOpacity: Math.random() * 0.6 + 0.4,
        blur: isLarge ? Math.random() * 2 + 0.5 : 0,
      };
    });
  }, []);

  return (
    <div className="stars-container">
      {/* Ambient gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40 pointer-events-none" />
      
      {/* Radial gradient orbs for depth */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] opacity-30 animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-white/3 rounded-full blur-[100px] opacity-20 animate-pulse-slow pointer-events-none" style={{ animationDelay: '2s' }} />
      
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            "--duration": `${star.duration}s`,
            "--delay": `${star.delay}s`,
            "--min-opacity": star.minOpacity,
            "--max-opacity": star.maxOpacity,
            filter: star.blur ? `blur(${star.blur}px)` : 'none',
            boxShadow: star.size > 2 ? `0 0 ${star.size * 2}px rgba(255,255,255,0.5)` : 'none',
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};


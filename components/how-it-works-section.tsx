"use client";

import { Play } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

function YouTubeVideo({ videoId, title }: { videoId: string; title: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
    setIsLoaded(true);
  };

  return (
    <div className="mb-12 md:mb-16 px-4 md:px-0">
      <div className="relative w-full aspect-video max-w-3xl mx-auto group rounded-lg overflow-hidden shadow-lg">
        {!isPlaying && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-gray-900/70 to-gray-800/70 backdrop-blur-[2px]">
            <button 
              onClick={handlePlay}
              className="group-hover:scale-105 active:scale-95 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-white/30 rounded-full"
              aria-label={`Play video: ${title}`}
            >
              <div className="w-14 h-14 md:w-16 md:h-16 bg-white/95 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all duration-200">
                <Play className="w-5 h-5 md:w-6 md:h-6 text-gray-900 ml-0.5 fill-gray-900" />
              </div>
            </button>
          </div>
        )}
        
        {/* YouTube Thumbnail for preview */}
        {!isLoaded && (
          <Image
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt={title}
            fill
            className="object-cover"
            priority
            onError={(e) => {
              // Fallback to medium resolution thumbnail
              e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
            }}
          />
        )}
        
        {/* YouTube Embed with minimal display */}
        {isPlaying && (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&showinfo=0&color=white&iv_load_policy=3&playsinline=1&controls=1&fs=1`}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        )}
        
        {/* Subtle border overlay */}
        <div className="absolute inset-0 ring-1 ring-black/10 ring-inset pointer-events-none rounded-lg" />
      </div>
    </div>
  );
}

// Ripple effect component for desktop click animations
function RippleEffect({ x, y, active, onComplete }: { 
  x: number; 
  y: number; 
  active: boolean; 
  onComplete: () => void; 
}) {
  useEffect(() => {
    if (active) {
      const timer = setTimeout(onComplete, 800);
      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <div
      className="absolute pointer-events-none rounded-full animate-ping"
      style={{
        left: x - 100,
        top: y - 100,
        width: 200,
        height: 200,
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(147, 51, 234, 0.3) 50%, rgba(236, 72, 153, 0.2) 100%)',
        animation: 'ripple 800ms ease-out forwards',
      }}
    />
  );
}

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [animateTiles, setAnimateTiles] = useState(false);
  const [rippleEffect, setRippleEffect] = useState<{x: number, y: number, active: boolean} | null>(null);

  // Intersection Observer for mobile scroll effects
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setAnimateTiles(true);
          setHasAnimated(true);
        }
      },
      { 
        threshold: 0.3,
        rootMargin: '-10% 0px -10% 0px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  // Handle desktop click effects
  const handleTileClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    setRippleEffect({ x, y, active: true });
  };

  const clearRipple = () => {
    setRippleEffect(null);
  };

  return (
    <>
      <style jsx>{`
        @keyframes colorBurst {
          0% { 
            transform: scale(1); 
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
            background: rgb(255 255 255 / 0);
          }
          30% { 
            transform: scale(1.03); 
            box-shadow: 0 0 20px 10px rgba(59, 130, 246, 0.3);
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(147, 51, 234, 0.08));
          }
          60% {
            transform: scale(1.02);
            background: linear-gradient(135deg, rgba(147, 51, 234, 0.06), rgba(236, 72, 153, 0.06));
          }
          100% { 
            transform: scale(1); 
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
            background: rgb(255 255 255 / 0);
          }
        }
        
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 0.8;
          }
          50% {
            opacity: 0.4;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }
        
        .tile-animate-1 { 
          animation: colorBurst 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 0ms; 
        }
        .tile-animate-2 { 
          animation: colorBurst 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 200ms; 
        }
        .tile-animate-3 { 
          animation: colorBurst 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 400ms; 
        }

        .tile-clickable {
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .tile-clickable:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        @media (prefers-reduced-motion: reduce) {
          .tile-animate-1, .tile-animate-2, .tile-animate-3, .tile-clickable {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
      
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Build Dapps in 3 Simple Steps
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered template eliminates complexity. Focus on your vision, not infrastructure.
            </p>
          </div>

          {/* YouTube Video Section */}
          <YouTubeVideo 
            videoId="-x-Nxt1J5LI" 
            title="How to Build Dapps with Vercel & Supabase - Clone, Configure, Customize"
          />

          <div ref={sectionRef} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                number: 1,
                title: "Clone",
                description: "Start with our production-ready Web3 template. One-click clone from GitHub gets you up and running instantly."
              },
              {
                number: 2,
                title: "Configure", 
                description: "Set up Supabase database and configure Web3 credentials. Our AI handles complex integrations automatically."
              },
              {
                number: 3,
                title: "Customize",
                description: "Use AI-powered Rules and Prompt enhancement to transform your Dapp into a production-grade custom application."
              }
            ].map((step) => (
              <div 
                key={step.number}
                className={`text-center relative overflow-hidden rounded-lg p-6 ${
                  animateTiles ? `tile-animate-${step.number}` : ''
                } tile-clickable md:cursor-pointer`}
                onClick={handleTileClick}
              >
                {rippleEffect && rippleEffect.active && (
                  <RippleEffect 
                    x={rippleEffect.x} 
                    y={rippleEffect.y} 
                    active={rippleEffect.active}
                    onComplete={clearRipple}
                  />
                )}
                
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-primary-foreground relative z-10">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-4 relative z-10">{step.title}</h3>
                <p className="text-muted-foreground mb-6 relative z-10">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

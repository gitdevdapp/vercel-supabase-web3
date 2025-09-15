"use client";

import { Info, Play } from "lucide-react";
import { useState } from "react";

function YouTubeVideo({ videoId, title }: { videoId: string; title: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
    setIsLoaded(true);
  };

  return (
    <div className="mb-12 md:mb-16 px-4 md:px-0">
      <div className="relative w-full aspect-video max-w-4xl mx-auto group rounded-lg overflow-hidden shadow-2xl">
        {!isPlaying && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm">
            <button 
              onClick={handlePlay}
              className="group-hover:scale-110 active:scale-95 transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-white/20 rounded-full"
              aria-label={`Play video: ${title}`}
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-2xl hover:shadow-white/20 transition-all duration-300">
                <Play className="w-6 h-6 md:w-8 md:h-8 text-gray-900 ml-1 fill-gray-900" />
              </div>
            </button>
          </div>
        )}
        
        {/* YouTube Thumbnail for preview */}
        {!isLoaded && (
          <img
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to medium resolution thumbnail
              e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
            }}
          />
        )}
        
        {/* YouTube Embed */}
        {isPlaying && (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&showinfo=0&color=white&iv_load_policy=3&playsinline=1`}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        )}
        
        {/* Elegant border overlay */}
        <div className="absolute inset-0 ring-1 ring-white/10 ring-inset pointer-events-none rounded-lg" />
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Build dApps in 3 Simple Steps
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered template eliminates complexity. Focus on your vision, not infrastructure.
          </p>
        </div>

        {/* YouTube Video Section */}
        <YouTubeVideo 
          videoId="-x-Nxt1J5LI" 
          title="How to Build dApps with Vercel & Supabase - Clone, Configure, Customize"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-primary-foreground">
              1
            </div>
            <h3 className="text-xl font-semibold mb-4">Clone</h3>
            <p className="text-muted-foreground mb-6">
              Start with our production-ready Web3 template. One-click clone from GitHub gets you up and running instantly.
            </p>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">TLDR</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Have your favorite IDE (like Cursor) Install for you
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-primary-foreground">
              2
            </div>
            <h3 className="text-xl font-semibold mb-4">Configure</h3>
            <p className="text-muted-foreground mb-6">
              Set up Supabase database and configure Web3 credentials. Our AI handles complex integrations automatically.
            </p>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">TLDR</span>
              </div>
              <p className="text-sm text-muted-foreground">
                5 Minutes of digging around the Vercel and Supabase interfaces is worth it
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-primary-foreground">
              3
            </div>
            <h3 className="text-xl font-semibold mb-4">Customize</h3>
            <p className="text-muted-foreground mb-6">
              Use AI-powered Rules and Prompt enhancement to transform your dApp into a production-grade custom application.
            </p>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">TLDR</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Our workflows make sure your AI doesn't do off the rails
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

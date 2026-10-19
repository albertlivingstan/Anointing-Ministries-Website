'use client';

import Link from 'next/link';
import { Home, BookOpen, Music, Radio, Heart } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-amber-400">
          <Heart className="w-10 h-10 animate-pulse" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-amber-100">Page Not Found</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. Let us guide you back to the sanctuary.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl transition shadow-lg shadow-amber-600/20"
          >
            <Home className="w-4 h-4" />
            Home Sanctuary
          </Link>
          <Link
            href="/bible"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition border border-slate-700"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            Holy Bible
          </Link>
          <Link
            href="/songs"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition border border-slate-700"
          >
            <Music className="w-4 h-4 text-amber-400" />
            Worship Songs
          </Link>
          <Link
            href="/live"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition border border-slate-700"
          >
            <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
            Live Broadcast
          </Link>
        </div>
      </div>
    </div>
  );
}

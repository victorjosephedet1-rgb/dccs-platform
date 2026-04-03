import React from 'react';
import { Zap } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-950 to-cyan-950"></div>
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 text-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center font-black text-white text-3xl mx-auto shadow-2xl shadow-cyan-500/50 animate-pulse">
            V3B
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-cyan-400 rounded-full animate-ping"></div>
          <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
        </div>

        <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent mb-2 tracking-tight">
          V3BMusic.Ai
        </h1>
        <p className="text-cyan-400 text-sm font-medium mb-6 tracking-wider">
          BLOCKCHAIN POWERED MUSIC LICENSING
        </p>

        <div className="flex items-center justify-center space-x-3 mb-4">
          <Zap className="h-5 w-5 text-cyan-400 animate-pulse" />
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <Zap className="h-5 w-5 text-blue-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>

        <p className="text-slate-400 text-sm">Initializing secure payment network...</p>
      </div>
    </div>
  );
}
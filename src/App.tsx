import React from 'react';
import GameContainer from './components/Game/GameContainer';

function App() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-slate-50 via-slate-50 to-amber-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-amber-100 bg-gradient-to-r from-white via-amber-50/70 to-white backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-800">
              Bagh Chal
            </h1>
            <p className="text-xs md:text-sm text-slate-600">
              Traditional Nepali strategy board game
            </p>
          </div>

          <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            <span>🐅 Tigers</span>
            <span className="text-amber-400">vs</span>
            <span>🐐 Goats</span>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-5 md:py-6">
        <GameContainer />
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-100 bg-white/90 text-slate-500 text-center py-3 text-xs md:text-sm">
        <p>React + TypeScript • Smart AI</p>
      </footer>
    </div>
  );
}

export default App;

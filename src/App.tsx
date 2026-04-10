import React from 'react';
import GameContainer from './components/Game/GameContainer';

function App() {
  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-center">
            🐅 Bagh Chal - Tiger vs Goat 🐐
          </h1>
          <p className="text-center text-sm md:text-base mt-1 text-orange-100">
            Traditional Nepali Strategy Board Game
          </p>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8">
        <GameContainer />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 text-center py-4 text-sm">
        <p>Built with React + TypeScript + Smart AI</p>
      </footer>
    </div>
  );
}

export default App;

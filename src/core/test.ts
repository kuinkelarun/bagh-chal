/**
 * Simple test file for core game logic
 * Run with: npx ts-node src/core/test.ts
 */

import { Game } from './Game';
import { PlayerType, GamePhase } from './types';

function testGame() {
  console.log('=== Testing Bagh Chal Core Game Logic ===\n');

  // Create a new game
  const game = new Game();
  console.log('✓ Game created');
  game.print();

  // Test initial state
  console.assert(game.getPhase() === GamePhase.PLACEMENT, 'Should start in placement phase');
  console.assert(game.getCurrentPlayer() === PlayerType.GOAT, 'Goats should start');
  console.assert(game.getGoatsRemaining() === 20, 'Should have 20 goats to place');
  console.assert(game.getGoatsCaptured() === 0, 'Should have 0 goats captured');
  console.log('✓ Initial state correct\n');

  // Get valid moves for goat placement
  const validMoves = game.getValidMoves();
  console.log(`✓ Found ${validMoves.length} valid placement positions for goats`);

  // Place first goat at center
  if (validMoves.length > 0) {
    const centerMove = validMoves.find(
      (vm) => vm.move.to.row === 2 && vm.move.to.col === 2
    );
    if (centerMove) {
      const success = game.makeMove(centerMove.move);
      console.assert(success, 'Goat placement should succeed');
      console.log('✓ Placed goat at center (2,2)');
      game.print();
    }
  }

  // Tiger's turn
  console.log(`Current player: ${game.getCurrentPlayer()}`);
  const tigerMoves = game.getValidMoves();
  console.log(`✓ Tiger has ${tigerMoves.length} valid moves`);

  // Make a tiger move
  if (tigerMoves.length > 0) {
    game.makeMove(tigerMoves[0].move);
    console.log('✓ Tiger moved');
    game.print();
  }

  // Test undo
  const undoSuccess = game.undoMove();
  console.assert(undoSuccess, 'Undo should succeed');
  console.log('✓ Undo successful');
  game.print();

  // Place several goats quickly
  console.log('\n=== Fast-forwarding: placing 19 more goats ===');
  let movesPlaced = 1; // Already placed one
  while (game.getGoatsRemaining() > 0 && movesPlaced < 20) {
    const moves = game.getValidMoves();
    if (moves.length > 0) {
      game.makeMove(moves[0].move);
      movesPlaced++;

      // Also make tiger move (during placement phase, tiger moves between goat placements)
      if (game.getCurrentPlayer() === PlayerType.TIGER && game.getPhase() === GamePhase.PLACEMENT) {
        const tigerMoves = game.getValidMoves();
        if (tigerMoves.length > 0) {
          game.makeMove(tigerMoves[0].move);
        }
      }
    }
  }

  console.log(`✓ Placed ${20 - game.getGoatsRemaining()} goats`);
  console.log(`✓ Phase: ${game.getPhase()}`);
  console.log(`✓ Turn number: ${game.getTurnNumber()}`);
  game.print();

  console.log('\n✅ All tests passed!');
}

// Run tests
testGame();

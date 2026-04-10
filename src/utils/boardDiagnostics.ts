/**
 * Board diagnostics utility to verify adjacency map
 */

import { Board } from '@/core/Board';
import { PieceType, Position } from '@/core/types';

/**
 * Test and visualize diagonal connections
 */
export function testDiagonalConnections(): void {
  console.log('=== BAGH CHAL BOARD DIAGONAL CONNECTIONS ===\n');

  const board = new Board();

  // Positions that SHOULD have diagonals (9 total)
  const shouldHaveDiagonals = [
    { row: 0, col: 0, name: 'Top-Left Corner' },
    { row: 0, col: 2, name: 'Top Edge Midpoint' },
    { row: 0, col: 4, name: 'Top-Right Corner' },
    { row: 2, col: 0, name: 'Left Edge Midpoint' },
    { row: 2, col: 2, name: 'Center' },
    { row: 2, col: 4, name: 'Right Edge Midpoint' },
    { row: 4, col: 0, name: 'Bottom-Left Corner' },
    { row: 4, col: 2, name: 'Bottom Edge Midpoint' },
    { row: 4, col: 4, name: 'Bottom-Right Corner' },
  ];

  console.log('Positions with diagonal connections:\n');
  for (const pos of shouldHaveDiagonals) {
    const neighbors = board.getNeighbors(pos);
    const diagonalNeighbors = neighbors.filter((n) => {
      return Math.abs(n.row - pos.row) === 1 && Math.abs(n.col - pos.col) === 1;
    });

    console.log(
      `(${pos.row},${pos.col}) ${pos.name}: ${diagonalNeighbors.length} diagonal connections`
    );
    diagonalNeighbors.forEach((n) => {
      console.log(`  → (${n.row},${n.col})`);
    });
  }

  console.log('\n=== TESTING ALL POSITIONS ===\n');

  // Create visual map
  let hasError = false;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const pos = { row, col };
      const neighbors = board.getNeighbors(pos);
      const diagonalNeighbors = neighbors.filter((n) => {
        return Math.abs(n.row - pos.row) === 1 && Math.abs(n.col - pos.col) === 1;
      });

      const shouldHave = shouldHaveDiagonals.some(
        (p) => p.row === row && p.col === col
      );
      const actuallyHas = diagonalNeighbors.length > 0;

      if (shouldHave !== actuallyHas) {
        console.error(
          `❌ ERROR at (${row},${col}): Should have=${shouldHave}, Actually has=${actuallyHas}`
        );
        hasError = true;
      }
    }
  }

  if (!hasError) {
    console.log('✅ All diagonal connections correct!');
  }

  console.log('\n=== VISUAL BOARD MAP ===\n');
  console.log('Legend: X = Has diagonals, O = No diagonals\n');

  for (let row = 0; row < 5; row++) {
    let rowStr = '';
    for (let col = 0; col < 5; col++) {
      const pos = { row, col };
      const neighbors = board.getNeighbors(pos);
      const hasDiagonals = neighbors.some((n) => {
        return Math.abs(n.row - pos.row) === 1 && Math.abs(n.col - pos.col) === 1;
      });
      rowStr += hasDiagonals ? 'X ' : 'O ';
    }
    console.log(rowStr);
  }

  console.log('\nExpected pattern:');
  console.log('X O X O X');
  console.log('O O O O O');
  console.log('X O X O X');
  console.log('O O O O O');
  console.log('X O X O X');
}

/**
 * Test move generation for a specific position
 */
export function testMovesFromPosition(
  board: Board,
  pos: Position,
  pieceType: PieceType
): void {
  console.log(`\n=== Testing moves from (${pos.row},${pos.col}) ===`);
  console.log(`Piece type: ${pieceType === PieceType.GOAT ? 'Goat' : 'Tiger'}`);

  const neighbors = board.getNeighbors(pos);
  console.log(`Total neighbors: ${neighbors.length}`);

  const horizontalVertical = neighbors.filter(
    (n) => n.row === pos.row || n.col === pos.col
  );
  const diagonal = neighbors.filter(
    (n) => Math.abs(n.row - pos.row) === 1 && Math.abs(n.col - pos.col) === 1
  );

  console.log(`Horizontal/Vertical: ${horizontalVertical.length}`);
  horizontalVertical.forEach((n) => console.log(`  → (${n.row},${n.col})`));

  console.log(`Diagonal: ${diagonal.length}`);
  diagonal.forEach((n) => console.log(`  → (${n.row},${n.col})`));
}

import React, { useState, useEffect } from 'react';
import { PieceType, Position, BOARD_SIZE, Move } from '@/core/types';
import Piece from './Piece';

interface BoardCanvasProps {
  board: PieceType[][];
  onPointClick?: (position: Position) => void;
  highlightedPositions?: Position[];
  selectedPosition?: Position | null;
  lastMove?: Move | null;
}

const BoardCanvas: React.FC<BoardCanvasProps> = ({
  board,
  onPointClick,
  highlightedPositions = [],
  selectedPosition = null,
  lastMove = null,
}) => {
  const [showMoveAnimation, setShowMoveAnimation] = useState(false);

  // Trigger animation when lastMove changes
  useEffect(() => {
    if (lastMove && lastMove.from) {
      setShowMoveAnimation(true);
      const timer = setTimeout(() => {
        setShowMoveAnimation(false);
      }, 1000); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [lastMove]);
  const boardSize = 400; // Base size in pixels
  const padding = 40;
  const viewBoxSize = boardSize + padding * 2;
  const cellSize = boardSize / (BOARD_SIZE - 1);

  // Convert row/col to SVG coordinates
  const toSVGCoords = (row: number, col: number) => ({
    x: padding + col * cellSize,
    y: padding + row * cellSize,
  });

  // Check if position is highlighted
  const isHighlighted = (row: number, col: number) =>
    highlightedPositions.some((p) => p.row === row && p.col === col);

  // Check if position is selected
  const isSelected = (row: number, col: number) =>
    selectedPosition !== null && selectedPosition.row === row && selectedPosition.col === col;

  // Check if point has diagonal connections
  const hasDiagonals = (row: number, col: number): boolean => {
    // Center
    if (row === 2 && col === 2) return true;
    // Corners
    if ((row === 0 || row === 4) && (col === 0 || col === 4)) return true;
    // Edge midpoints
    if ((row === 0 || row === 4) && col === 2) return true;
    if ((col === 0 || col === 4) && row === 2) return true;
    return false;
  };

  // Render grid lines
  const renderLines = () => {
    const lines: JSX.Element[] = [];

    // Horizontal lines
    for (let row = 0; row < BOARD_SIZE; row++) {
      const start = toSVGCoords(row, 0);
      const end = toSVGCoords(row, BOARD_SIZE - 1);
      lines.push(
        <line
          key={`h-${row}`}
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          stroke="#8B4513"
          strokeWidth="2"
        />
      );
    }

    // Vertical lines
    for (let col = 0; col < BOARD_SIZE; col++) {
      const start = toSVGCoords(0, col);
      const end = toSVGCoords(BOARD_SIZE - 1, col);
      lines.push(
        <line
          key={`v-${col}`}
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          stroke="#8B4513"
          strokeWidth="2"
        />
      );
    }

    // Diagonal lines
    const diagonalPoints: Position[] = [
      { row: 0, col: 0 },
      { row: 0, col: 2 },
      { row: 0, col: 4 },
      { row: 2, col: 0 },
      { row: 2, col: 2 },
      { row: 2, col: 4 },
      { row: 4, col: 0 },
      { row: 4, col: 2 },
      { row: 4, col: 4 },
    ];

    diagonalPoints.forEach((point, idx) => {
      if (hasDiagonals(point.row, point.col)) {
        const center = toSVGCoords(point.row, point.col);

        // Draw diagonals from this point
        if (point.row > 0 && point.col > 0) {
          const topLeft = toSVGCoords(point.row - 1, point.col - 1);
          lines.push(
            <line
              key={`d-tl-${idx}`}
              x1={center.x}
              y1={center.y}
              x2={topLeft.x}
              y2={topLeft.y}
              stroke="#8B4513"
              strokeWidth="2"
            />
          );
        }
        if (point.row > 0 && point.col < BOARD_SIZE - 1) {
          const topRight = toSVGCoords(point.row - 1, point.col + 1);
          lines.push(
            <line
              key={`d-tr-${idx}`}
              x1={center.x}
              y1={center.y}
              x2={topRight.x}
              y2={topRight.y}
              stroke="#8B4513"
              strokeWidth="2"
            />
          );
        }
      }
    });

    return lines;
  };

  // Render intersection points
  const renderPoints = () => {
    const points: JSX.Element[] = [];

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const coords = toSVGCoords(row, col);
        const highlighted = isHighlighted(row, col);
        const selected = isSelected(row, col);

        points.push(
          <g key={`point-${row}-${col}`}>
            {/* Highlight circle - improved contrast */}
            {highlighted && (
              <>
                {/* Outer glow */}
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r="20"
                  fill="#10B981"
                  opacity="0.3"
                  className="highlight-valid"
                />
                {/* Inner bright circle */}
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r="16"
                  fill="#22C55E"
                  opacity="0.7"
                  className="highlight-valid"
                />
                {/* Border ring */}
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r="16"
                  fill="none"
                  stroke="#16A34A"
                  strokeWidth="3"
                  opacity="0.9"
                />
              </>
            )}

            {/* Selection circle */}
            {selected && (
              <circle
                cx={coords.x}
                cy={coords.y}
                r="18"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="3"
              />
            )}

            {/* Click target */}
            <circle
              cx={coords.x}
              cy={coords.y}
              r="12"
              fill={board[row][col] === PieceType.EMPTY ? '#CD853F' : 'transparent'}
              stroke="#8B4513"
              strokeWidth="2"
              style={{ cursor: 'pointer' }}
              onClick={() => onPointClick?.({ row, col })}
            />
          </g>
        );
      }
    }

    return points;
  };

  // Render move animation arrow
  const renderMoveAnimation = () => {
    if (!showMoveAnimation || !lastMove || !lastMove.from) return null;

    const from = toSVGCoords(lastMove.from.row, lastMove.from.col);
    const to = toSVGCoords(lastMove.to.row, lastMove.to.col);

    // Calculate angle for arrowhead
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    return (
      <g className="move-animation">
        {/* Shadow/glow effect */}
        <defs>
          <filter id="move-glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Animated path/arrow */}
        <line
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke="#FF6B35"
          strokeWidth="4"
          strokeDasharray="8,4"
          opacity="0.8"
          filter="url(#move-glow)"
          className="move-arrow-line"
        />

        {/* Arrowhead at destination */}
        <g transform={`translate(${to.x}, ${to.y}) rotate(${angle})`}>
          <polygon
            points="0,0 -12,-6 -12,6"
            fill="#FF6B35"
            opacity="0.9"
            filter="url(#move-glow)"
          />
        </g>

        {/* Pulsing circle at source */}
        <circle
          cx={from.x}
          cy={from.y}
          r="12"
          fill="none"
          stroke="#FF6B35"
          strokeWidth="3"
          opacity="0.6"
          className="move-source-pulse"
        />

        {/* Pulsing circle at destination */}
        <circle
          cx={to.x}
          cy={to.y}
          r="18"
          fill="none"
          stroke="#FF6B35"
          strokeWidth="3"
          opacity="0.6"
          className="move-target-pulse"
        />
      </g>
    );
  };

  // Render pieces
  const renderPieces = () => {
    const pieces: JSX.Element[] = [];

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = board[row][col];
        if (piece !== PieceType.EMPTY) {
          const coords = toSVGCoords(row, col);
          pieces.push(
            <Piece
              key={`piece-${row}-${col}`}
              type={piece}
              x={coords.x}
              y={coords.y}
              position={{ row, col }}
              onClick={() => onPointClick?.({ row, col })}
            />
          );
        }
      }
    }

    return pieces;
  };

  return (
    <div className="flex justify-center items-center w-full">
      <svg
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        className="max-w-full h-auto"
        style={{ maxWidth: '600px', minWidth: '300px' }}
      >
        {/* Board background */}
        <rect
          x="0"
          y="0"
          width={viewBoxSize}
          height={viewBoxSize}
          fill="#F5DEB3"
          rx="10"
        />

        {/* Grid lines */}
        <g>{renderLines()}</g>

        {/* Intersection points */}
        <g>{renderPoints()}</g>

        {/* Pieces */}
        <g>{renderPieces()}</g>

        {/* Move animation (shown on top) */}
        {renderMoveAnimation()}
      </svg>
    </div>
  );
};

export default BoardCanvas;

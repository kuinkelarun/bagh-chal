import React from 'react';
import { PieceType, Position } from '@/core/types';

interface PieceProps {
  type: PieceType;
  x: number;
  y: number;
  position: Position;
  onClick?: () => void;
}

const Piece: React.FC<PieceProps> = ({ type, x, y, onClick }) => {
  if (type === PieceType.EMPTY) return null;

  // Different sizes for tigers and goats to distinguish them visually
  const tigerSize = 21; // 25% smaller than original 28
  const goatSize = 18; // 35% smaller than original 28

  if (type === PieceType.TIGER) {
    const size = tigerSize;
    return (
      <g transform={`translate(${x}, ${y})`}>
      <g
        onClick={onClick}
        style={{ cursor: 'pointer' }}
        className="piece-enter piece-smooth-move piece-hover"
      >
        <defs>
          {/* Tiger body gradient */}
          <radialGradient id={`tiger-gradient-${x}-${y}`}>
            <stop offset="0%" stopColor="#FF8C42" />
            <stop offset="70%" stopColor="#FF6B35" />
            <stop offset="100%" stopColor="#E85D2C" />
          </radialGradient>
          {/* Shadow */}
          <filter id={`tiger-shadow-${x}-${y}`}>
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Shadow base */}
        <ellipse
          cx="0"
          cy="2"
          rx={size * 0.9}
          ry={size * 0.3}
          fill="#000"
          opacity="0.15"
        />

        {/* Tiger face base */}
        <ellipse
          cx="0"
          cy="0"
          rx={size}
          ry={size * 0.95}
          fill={`url(#tiger-gradient-${x}-${y})`}
          stroke="#D9540F"
          strokeWidth="2.5"
          filter={`url(#tiger-shadow-${x}-${y})`}
        />

        {/* White chest/muzzle area */}
        <ellipse
          cx="0"
          cy="6"
          rx="18"
          ry="14"
          fill="#FFF8E7"
        />

        {/* Ears */}
        <g>
          {/* Left ear */}
          <ellipse
            cx="-18"
            cy="-18"
            rx="8"
            ry="10"
            fill="#FF6B35"
            stroke="#D9540F"
            strokeWidth="1.5"
          />
          <ellipse
            cx="-18"
            cy="-17"
            rx="4"
            ry="5"
            fill="#FFF8E7"
          />
          {/* Right ear */}
          <ellipse
            cx="18"
            cy="-18"
            rx="8"
            ry="10"
            fill="#FF6B35"
            stroke="#D9540F"
            strokeWidth="1.5"
          />
          <ellipse
            cx="18"
            cy="-17"
            rx="4"
            ry="5"
            fill="#FFF8E7"
          />
        </g>

        {/* Tiger stripes */}
        <g stroke="#2C1810" strokeWidth="2.5" strokeLinecap="round">
          <path d="M -14 -8 Q -12 -4, -14 0" fill="none" />
          <path d="M -20 -2 Q -18 2, -20 6" fill="none" />
          <path d="M 14 -8 Q 12 -4, 14 0" fill="none" />
          <path d="M 20 -2 Q 18 2, 20 6" fill="none" />
          <line x1="-8" y1="-10" x2="-8" y2="-4" />
          <line x1="8" y1="-10" x2="8" y2="-4" />
        </g>

        {/* Eyes */}
        <g>
          {/* Left eye */}
          <ellipse cx="-10" cy="-4" rx="5" ry="6" fill="#FFF" />
          <ellipse cx="-10" cy="-3" rx="3.5" ry="4.5" fill="#1F5C3A" />
          <ellipse cx="-9" cy="-4" rx="2" ry="3" fill="#000" />
          <ellipse cx="-8.5" cy="-5" rx="1.5" ry="2" fill="#FFF" opacity="0.7" />

          {/* Right eye */}
          <ellipse cx="10" cy="-4" rx="5" ry="6" fill="#FFF" />
          <ellipse cx="10" cy="-3" rx="3.5" ry="4.5" fill="#1F5C3A" />
          <ellipse cx="11" cy="-4" rx="2" ry="3" fill="#000" />
          <ellipse cx="11.5" cy="-5" rx="1.5" ry="2" fill="#FFF" opacity="0.7" />
        </g>

        {/* Nose */}
        <path
          d="M -4 4 L 0 7 L 4 4 Q 4 6, 0 8 Q -4 6, -4 4"
          fill="#2C1810"
        />

        {/* Whiskers */}
        <g stroke="#2C1810" strokeWidth="1.5" strokeLinecap="round" opacity="0.7">
          <line x1="-22" y1="2" x2="-30" y2="0" />
          <line x1="-22" y1="5" x2="-30" y2="6" />
          <line x1="22" y1="2" x2="30" y2="0" />
          <line x1="22" y1="5" x2="30" y2="6" />
        </g>

        {/* Mouth */}
        <path
          d="M 0 8 Q -3 10, -5 9 M 0 8 Q 3 10, 5 9"
          stroke="#2C1810"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
      </g>
      </g>
    );
  }

  // Goat
  const size = goatSize;
  return (
    <g transform={`translate(${x}, ${y})`}>
    <g
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      className="piece-enter piece-smooth-move piece-hover"
    >
      <defs>
        {/* Goat body gradient */}
        <radialGradient id={`goat-gradient-${x}-${y}`}>
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#F5F5F5" />
          <stop offset="100%" stopColor="#E0E0E0" />
        </radialGradient>
        {/* Shadow */}
        <filter id={`goat-shadow-${x}-${y}`}>
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.2" />
        </filter>
      </defs>

      {/* Shadow base */}
      <ellipse
        cx="0"
        cy="2"
        rx={size * 0.9}
        ry={size * 0.3}
        fill="#000"
        opacity="0.12"
      />

      {/* Goat head/body — slightly taller face for goat proportions */}
      <ellipse
        cx="0"
        cy="0"
        rx={size * 0.9}
        ry={size}
        fill={`url(#goat-gradient-${x}-${y})`}
        stroke="#8B7355"
        strokeWidth="2.5"
        filter={`url(#goat-shadow-${x}-${y})`}
      />

      {/* Ears — long and droopy, typical goat ears */}
      <g>
        {/* Left ear */}
        <ellipse
          cx="-17"
          cy="-6"
          rx="5"
          ry="11"
          fill="#F0EDE8"
          stroke="#8B7355"
          strokeWidth="1.5"
          transform="rotate(25, -17, -6)"
        />
        <ellipse
          cx="-17"
          cy="-5"
          rx="2.5"
          ry="7"
          fill="#D4C4B0"
          opacity="0.5"
          transform="rotate(25, -17, -5)"
        />
        {/* Right ear */}
        <ellipse
          cx="17"
          cy="-6"
          rx="5"
          ry="11"
          fill="#F0EDE8"
          stroke="#8B7355"
          strokeWidth="1.5"
          transform="rotate(-25, 17, -6)"
        />
        <ellipse
          cx="17"
          cy="-5"
          rx="2.5"
          ry="7"
          fill="#D4C4B0"
          opacity="0.5"
          transform="rotate(-25, 17, -5)"
        />
      </g>

      {/* Horns */}
      <g stroke="#6B5D54" strokeWidth="2.5" fill="none" strokeLinecap="round">
        {/* Left horn */}
        <path
          d="M -10 -18 Q -16 -28, -12 -32 Q -10 -33, -8 -28"
          fill="#8B7355"
          stroke="#6B5D54"
          strokeWidth="2"
        />
        <path d="M -10 -22 Q -13 -26, -11 -30" stroke="#D4C4B0" strokeWidth="1" />

        {/* Right horn */}
        <path
          d="M 10 -18 Q 16 -28, 12 -32 Q 10 -33, 8 -28"
          fill="#8B7355"
          stroke="#6B5D54"
          strokeWidth="2"
        />
        <path d="M 10 -22 Q 13 -26, 11 -30" stroke="#D4C4B0" strokeWidth="1" />
      </g>

      {/* Muzzle — subtle, lighter area */}
      <ellipse
        cx="0"
        cy="7"
        rx="10"
        ry="8"
        fill="#F0EDE8"
        stroke="#C4B8A8"
        strokeWidth="0.8"
      />

      {/* Eyes — horizontal rectangular pupils like a real goat */}
      <g>
        {/* Left eye */}
        <ellipse cx="-8" cy="-5" rx="4" ry="5" fill="#FFF" />
        <ellipse cx="-8" cy="-4" rx="3" ry="3.5" fill="#C8A84E" />
        <rect x="-11" y="-5" width="6" height="2.5" rx="1" fill="#000" />
        <ellipse cx="-7" cy="-6" rx="1.2" ry="1.5" fill="#FFF" opacity="0.7" />

        {/* Right eye */}
        <ellipse cx="8" cy="-5" rx="4" ry="5" fill="#FFF" />
        <ellipse cx="8" cy="-4" rx="3" ry="3.5" fill="#C8A84E" />
        <rect x="5" y="-5" width="6" height="2.5" rx="1" fill="#000" />
        <ellipse cx="9" cy="-6" rx="1.2" ry="1.5" fill="#FFF" opacity="0.7" />
      </g>

      {/* Nose — small and subtle */}
      <ellipse
        cx="0"
        cy="5"
        rx="3"
        ry="2"
        fill="#6B5D54"
      />
      <ellipse
        cx="-0.5"
        cy="4.5"
        rx="1"
        ry="0.7"
        fill="#FFF"
        opacity="0.4"
      />

      {/* Nostrils — small, not prominent */}
      <ellipse cx="-1.2" cy="5.5" rx="0.8" ry="1" fill="#3C2415" />
      <ellipse cx="1.2" cy="5.5" rx="0.8" ry="1" fill="#3C2415" />

      {/* Mouth */}
      <path
        d="M 0 8 Q -3 10, -5 9 M 0 8 Q 3 10, 5 9"
        stroke="#8B7355"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />

      {/* Goatee / beard */}
      <g opacity="0.6">
        <path d="M -2 12 Q -3 17, -1 19" stroke="#C4B8A8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M 0 13 Q 0 18, 0 20" stroke="#C4B8A8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M 2 12 Q 3 17, 1 19" stroke="#C4B8A8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </g>

      {/* Fur texture (subtle) */}
      <g opacity="0.12">
        <path d="M -16 -2 Q -14 0, -16 2" stroke="#8B7355" strokeWidth="1" fill="none" />
        <path d="M 16 -2 Q 14 0, 16 2" stroke="#8B7355" strokeWidth="1" fill="none" />
        <path d="M -10 -14 Q -8 -12, -10 -10" stroke="#8B7355" strokeWidth="0.5" fill="none" />
        <path d="M 10 -14 Q 8 -12, 10 -10" stroke="#8B7355" strokeWidth="0.5" fill="none" />
      </g>
    </g>
    </g>
  );
};

export default Piece;

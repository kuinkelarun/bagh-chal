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
      <g
        onClick={onClick}
        style={{ cursor: 'pointer' }}
        className="piece-enter piece-smooth-move piece-hover"
        transform={`translate(${x}, ${y})`}
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
    );
  }

  // Goat
  const size = goatSize;
  return (
    <g
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      className="piece-enter piece-smooth-move piece-hover"
      transform={`translate(${x}, ${y})`}
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

      {/* Goat head/body */}
      <ellipse
        cx="0"
        cy="0"
        rx={size}
        ry={size * 0.95}
        fill={`url(#goat-gradient-${x}-${y})`}
        stroke="#8B7355"
        strokeWidth="2.5"
        filter={`url(#goat-shadow-${x}-${y})`}
      />

      {/* Ears */}
      <g>
        {/* Left ear */}
        <ellipse
          cx="-16"
          cy="-16"
          rx="6"
          ry="10"
          fill="#F5F5F5"
          stroke="#8B7355"
          strokeWidth="1.5"
        />
        <ellipse
          cx="-16"
          cy="-15"
          rx="3"
          ry="6"
          fill="#FFB6C1"
          opacity="0.6"
        />
        {/* Right ear */}
        <ellipse
          cx="16"
          cy="-16"
          rx="6"
          ry="10"
          fill="#F5F5F5"
          stroke="#8B7355"
          strokeWidth="1.5"
        />
        <ellipse
          cx="16"
          cy="-15"
          rx="3"
          ry="6"
          fill="#FFB6C1"
          opacity="0.6"
        />
      </g>

      {/* Horns */}
      <g stroke="#6B5D54" strokeWidth="2.5" fill="none" strokeLinecap="round">
        {/* Left horn */}
        <path
          d="M -14 -20 Q -18 -26, -15 -28 Q -13 -29, -11 -26"
          fill="#8B7355"
          stroke="#6B5D54"
          strokeWidth="2"
        />
        <path d="M -14 -22 Q -16 -24, -14 -26" stroke="#D4C4B0" strokeWidth="1" />

        {/* Right horn */}
        <path
          d="M 14 -20 Q 18 -26, 15 -28 Q 13 -29, 11 -26"
          fill="#8B7355"
          stroke="#6B5D54"
          strokeWidth="2"
        />
        <path d="M 14 -22 Q 16 -24, 14 -26" stroke="#D4C4B0" strokeWidth="1" />
      </g>

      {/* Snout/mouth area */}
      <ellipse
        cx="0"
        cy="6"
        rx="14"
        ry="10"
        fill="#E8E8E8"
        stroke="#8B7355"
        strokeWidth="1"
      />

      {/* Eyes */}
      <g>
        {/* Left eye */}
        <ellipse cx="-10" cy="-3" rx="4.5" ry="5.5" fill="#FFF" />
        <ellipse cx="-10" cy="-2" rx="3" ry="4" fill="#3C2415" />
        <rect x="-11" y="-4" width="2" height="6" rx="1" fill="#000" />
        <ellipse cx="-9" cy="-4" rx="1.5" ry="2" fill="#FFF" opacity="0.8" />

        {/* Right eye */}
        <ellipse cx="10" cy="-3" rx="4.5" ry="5.5" fill="#FFF" />
        <ellipse cx="10" cy="-2" rx="3" ry="4" fill="#3C2415" />
        <rect x="9" y="-4" width="2" height="6" rx="1" fill="#000" />
        <ellipse cx="11" cy="-4" rx="1.5" ry="2" fill="#FFF" opacity="0.8" />
      </g>

      {/* Nose */}
      <ellipse
        cx="0"
        cy="6"
        rx="4"
        ry="3"
        fill="#3C2415"
      />
      <ellipse
        cx="-1"
        cy="5"
        rx="1.5"
        ry="1"
        fill="#FFF"
        opacity="0.5"
      />

      {/* Nostrils */}
      <ellipse cx="-1.5" cy="6" rx="1" ry="1.5" fill="#2C1810" />
      <ellipse cx="1.5" cy="6" rx="1" ry="1.5" fill="#2C1810" />

      {/* Mouth */}
      <path
        d="M 0 8 Q -4 10, -6 9 M 0 8 Q 4 10, 6 9"
        stroke="#8B7355"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Fur texture (subtle) */}
      <g opacity="0.15">
        <path d="M -18 0 Q -16 2, -18 4" stroke="#8B7355" strokeWidth="1" fill="none" />
        <path d="M 18 0 Q 16 2, 18 4" stroke="#8B7355" strokeWidth="1" fill="none" />
        <path d="M -12 -12 Q -10 -10, -12 -8" stroke="#8B7355" strokeWidth="0.5" fill="none" />
        <path d="M 12 -12 Q 10 -10, 12 -8" stroke="#8B7355" strokeWidth="0.5" fill="none" />
      </g>
    </g>
  );
};

export default Piece;

/**
 * Hook to manage AI Worker for non-blocking computation
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Move, PlayerType } from '@/core/types';

interface AIWorkerResponse {
  type: 'move-computed' | 'error';
  move?: Move;
  error?: string;
  thinkingTime?: number;
  nodesSearched?: number;
}

interface UseAIWorkerResult {
  computeMove: (
    gameState: GameState,
    playerType: PlayerType,
    difficulty: number
  ) => Promise<Move>;
  isComputing: boolean;
  thinkingTime: number | null;
  error: string | null;
}

/**
 * Hook to use AI Worker for background computation
 * Falls back to synchronous computation if workers not available
 */
export function useAIWorker(): UseAIWorkerResult {
  const [isComputing, setIsComputing] = useState(false);
  const [thinkingTime, setThinkingTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const resolveRef = useRef<((move: Move) => void) | null>(null);
  const rejectRef = useRef<((error: Error) => void) | null>(null);

  // Initialize worker when available
  useEffect(() => {
    if (typeof Worker !== 'undefined') {
      try {
        workerRef.current = new Worker(
          new URL('../workers/aiWorker.ts', import.meta.url),
          { type: 'module' }
        );

        workerRef.current.onmessage = (event: MessageEvent<AIWorkerResponse>) => {
          const { type, move, error: workerError, thinkingTime: time } = event.data;

          if (type === 'move-computed' && move) {
            setThinkingTime(time || null);
            setIsComputing(false);
            if (resolveRef.current) {
              resolveRef.current(move);
              resolveRef.current = null;
            }
          } else if (type === 'error') {
            setError(workerError || 'Worker error');
            setIsComputing(false);
            if (rejectRef.current) {
              rejectRef.current(new Error(workerError || 'Worker error'));
              rejectRef.current = null;
            }
          }
        };

        workerRef.current.onerror = (error) => {
          console.error('Worker error:', error);
          setError('Worker initialization failed');
          setIsComputing(false);
          if (rejectRef.current) {
            rejectRef.current(new Error('Worker failed'));
            rejectRef.current = null;
          }
        };
      } catch (err) {
        console.warn('Worker creation failed, using synchronous AI');
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const computeMove = useCallback(
    async (
      gameState: GameState,
      playerType: PlayerType,
      difficulty: number
    ): Promise<Move> => {
      setIsComputing(true);
      setError(null);
      setThinkingTime(null);

      // Prefer worker computation for minimax levels (1-4)
      if (workerRef.current && difficulty <= 4) {
        return new Promise<Move>((resolve, reject) => {
          resolveRef.current = resolve;
          rejectRef.current = reject;

          workerRef.current!.postMessage({
            type: 'compute-move',
            gameState,
            playerType,
            difficulty,
          });
        });
      }

      // Fallback: synchronous computation
      try {
        const startTime = Date.now();

        const { AIFactory } = await import('@/ai/AIFactory');
        const aiEngine = AIFactory.createFromLevel(difficulty);
        const move = await aiEngine.getMove(gameState, playerType);

        const time = Date.now() - startTime;
        setThinkingTime(time);
        setIsComputing(false);

        return move;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Computation failed');
        setIsComputing(false);
        throw err;
      }
    },
    []
  );

  return {
    computeMove,
    isComputing,
    thinkingTime,
    error,
  };
}

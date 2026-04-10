import { useEffect } from 'react';

interface KeyboardShortcuts {
  onUndo?: () => void;
  onNewGame?: () => void;
  onShowRules?: () => void;
  onToggleFullscreen?: () => void;
  onEscape?: () => void;
}

/**
 * Custom hook to handle keyboard shortcuts for the game
 */
export const useKeyboardShortcuts = ({
  onUndo,
  onNewGame,
  onShowRules,
  onToggleFullscreen,
  onEscape,
}: KeyboardShortcuts) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Ctrl/Cmd + Z for undo
      if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
        event.preventDefault();
        onUndo?.();
        return;
      }

      // Ctrl/Cmd + N for new game
      if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        onNewGame?.();
        return;
      }

      // H for help/rules
      if (event.key === 'h' || event.key === 'H') {
        event.preventDefault();
        onShowRules?.();
        return;
      }

      // F for fullscreen
      if (event.key === 'f' || event.key === 'F') {
        event.preventDefault();
        onToggleFullscreen?.();
        return;
      }

      // Escape to close modals
      if (event.key === 'Escape') {
        event.preventDefault();
        onEscape?.();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [onUndo, onNewGame, onShowRules, onToggleFullscreen, onEscape]);
};

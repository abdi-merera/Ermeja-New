import { useRef } from "react";

export function Logo({ onClick, onLongPress }: { onClick?: () => void; onLongPress?: () => void }) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const startLongPress = () => {
    cancelLongPress();
    longPressTriggered.current = false;

    if (!onLongPress) {
      return;
    }

    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      longPressTimer.current = null;
      onLongPress();
    }, 5000);
  };

  const handleClick = () => {
    if (longPressTriggered.current) {
      longPressTriggered.current = false;
      return;
    }

    (onClick || (() => window.scrollTo({ top: 0, behavior: "smooth" })))();
  };

  return (
    <button
      type="button"
      className="flex select-none items-center text-left touch-manipulation"
      onClick={handleClick}
      onPointerDown={startLongPress}
      onPointerUp={cancelLongPress}
      onPointerCancel={cancelLongPress}
      onPointerLeave={cancelLongPress}
      onContextMenu={(event) => event.preventDefault()}
      aria-label="Ermija Hiking home"
    >
      <img src="/logo-white.svg" alt="Ermija Hiking" className="h-14 w-auto" />
    </button>
  );
}

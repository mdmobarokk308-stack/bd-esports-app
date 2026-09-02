import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { RefreshCw, ArrowDown } from 'lucide-react';

interface PullToRefreshContainerProps {
  children: ReactNode;
  onRefresh: () => Promise<void> | void;
  disabled?: boolean;
}

export const PullToRefreshContainer: React.FC<PullToRefreshContainerProps> = ({
  children,
  onRefresh,
  disabled = false,
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(0);
  const isPullingRef = useRef(false);

  const PULL_THRESHOLD = 70; // px distance to trigger refresh

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    // Only pull to refresh when scrolled at top of the window
    if (window.scrollY <= 5) {
      startYRef.current = e.touches[0].clientY;
      isPullingRef.current = true;
    } else {
      isPullingRef.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPullingRef.current || disabled || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;

    if (diff > 0 && window.scrollY <= 5) {
      // Add resistance to the pull gesture
      const distance = Math.min(diff * 0.45, 110);
      setPullDistance(distance);
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPullingRef.current || disabled || isRefreshing) return;
    isPullingRef.current = false;

    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(PULL_THRESHOLD);

      try {
        await onRefresh();
      } catch (err) {
        console.error('Pull to refresh failed:', err);
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 500);
      }
    } else {
      setPullDistance(0);
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full min-h-full overflow-x-hidden"
      style={{ overscrollBehaviorY: 'auto' }}
    >
      {/* Pull Indicator Banner at Top */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="w-full flex items-center justify-center transition-all duration-150 overflow-hidden"
          style={{
            height: `${pullDistance}px`,
            opacity: Math.min(pullDistance / PULL_THRESHOLD, 1),
          }}
        >
          <div className="flex items-center gap-2 bg-slate-900/90 text-amber-400 backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg border border-amber-500/30 text-xs font-bold font-['Rajdhani',sans-serif]">
            <RefreshCw
              className={`w-4 h-4 text-amber-400 ${
                isRefreshing ? 'animate-spin' : ''
              }`}
              style={{
                transform: isRefreshing
                  ? undefined
                  : `rotate(${Math.min(pullDistance * 3, 360)}deg)`,
              }}
            />
            <span>
              {isRefreshing
                ? '🔄 রিফ্রেশ করা হচ্ছে...'
                : pullDistance >= PULL_THRESHOLD
                ? '✨ ছেড়ে দিন রিফ্রেশ করার জন্য'
                : '⬇️ নিচে টানুন রিফ্রেশ করতে'}
            </span>
          </div>
        </div>
      )}

      {children}
    </div>
  );
};

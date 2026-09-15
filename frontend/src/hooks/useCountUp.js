import { useState, useEffect } from 'react';

/**
 * Animate a numeric value smoothly from 0 to target value on mount or target change.
 * Uses an easeOutQuad easing curve.
 * Automatically respects prefers-reduced-motion by returning target immediately.
 */
export const useCountUp = (target, durationMs = 700) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // If prefers-reduced-motion is active or target is 0/invalid, jump straight to target
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(target);
      return;
    }

    const numericTarget = typeof target === 'number' ? target : parseFloat(target) || 0;
    if (numericTarget === 0) {
      setCount(0);
      return;
    }

    let startTime = null;
    let animationFrameId;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / durationMs, 1);
      
      // Standard easeOutQuad curve (starts quick, smoothly settles into final integer)
      const easeOut = 1 - (1 - progress) * (1 - progress);
      const current = Math.round(easeOut * numericTarget);
      
      setCount(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(numericTarget);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [target, durationMs]);

  return count;
};

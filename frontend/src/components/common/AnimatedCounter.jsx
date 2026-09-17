import React, { useState, useEffect } from 'react';

/**
 * AnimatedCounter component for smooth number count-up micro-animations
 * used across Skill India Digital Hub metric cards and overview banners.
 */
export const AnimatedCounter = ({ end = 0, duration = 700, suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const target = typeof end === 'number' ? end : parseInt(end, 10) || 0;
    if (target === 0) {
      setCount(0);
      return;
    }
    let start = 0;
    const stepTime = Math.max(Math.floor(duration / Math.min(target, 60)), 16);
    const increment = Math.max(1, Math.ceil(target / (duration / stepTime)));

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

export default AnimatedCounter;

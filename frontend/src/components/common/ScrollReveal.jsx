import React, { useEffect, useRef, useState } from 'react';

/**
 * ScrollReveal component using native IntersectionObserver.
 * Smoothly triggers fade-up / slide-in reveals on scroll.
 * Complies strictly with prefers-reduced-motion by rendering immediately.
 */
export const ScrollReveal = ({ 
  children, 
  className = '', 
  delay = 0,
  threshold = 0.12,
  direction = 'up'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef(null);

  useEffect(() => {
    // If prefers-reduced-motion is active, reveal immediately without animation
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (domRef.current) observer.unobserve(domRef.current);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    const currentRef = domRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [threshold]);

  const transformStyle = direction === 'up' 
    ? (isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0')
    : (isVisible ? 'opacity-100' : 'opacity-0');

  return (
    <div
      ref={domRef}
      className={`transition-all duration-500 ease-out will-change-transform ${transformStyle} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};
